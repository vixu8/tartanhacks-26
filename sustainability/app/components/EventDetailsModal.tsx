import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  Keyboard,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { addEvent } from '../../firebase/database';

type EventDetailsModalProps = {
  visible: boolean;
  eventTitle: string;
  onClose: () => void;
  onSaved?: () => void;
};

const COMMON_TAGS = [
  'transport',
  'food',
  'shopping',
  'home',
  'energy',
  'water',
  'waste',
  'reusable',
  'community',
  'education',
  'daily',
  'habit',
  'low-emission',
  'high-emission',
  'eco-friendly',
  'convenience',
];

export default function EventDetailsModal({
  visible,
  eventTitle,
  onClose,
  onSaved,
}: EventDetailsModalProps) {
  const [detailTitle, setDetailTitle] = useState(eventTitle);

  React.useEffect(() => {
    if (visible) {
      console.log('[EventDetailsModal] visible -> true');
      setDetailTitle(eventTitle);
    }
  }, [visible, eventTitle]);

  React.useEffect(() => {
    if (!visible) {
      console.log('[EventDetailsModal] visible -> false');
    }
  }, [visible]);
  const [detailDate, setDetailDate] = useState('');
  const [detailTime, setDetailTime] = useState('');
  const [meridiem, setMeridiem] = useState<'AM' | 'PM'>('AM');
  const [detailNotes, setDetailNotes] = useState('');
  const [detailTags, setDetailTags] = useState<string[]>([]);
  const [tagQuery, setTagQuery] = useState('');
  const [debouncedTagQuery, setDebouncedTagQuery] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [tagInputFocused, setTagInputFocused] = useState(false);
  const keepTagDropdownOpenRef = useRef(false);
  const windowHeight = useRef(Dimensions.get('window').height).current;
  const cardHeight = useRef(new Animated.Value(windowHeight * 0.5)).current;
  const cardTranslateY = useRef(new Animated.Value(0)).current;
  const normalizedQuery = debouncedTagQuery.trim().toLowerCase();
  const filteredTagOptions = useMemo(
    () =>
      COMMON_TAGS.filter(
        (t) => !detailTags.includes(t) && t.includes(normalizedQuery)
      ),
    [detailTags, normalizedQuery]
  );
  const canAddCustomTag =
    normalizedQuery.length > 0 &&
    !detailTags.some((t) => t.toLowerCase() === normalizedQuery) &&
    !COMMON_TAGS.some((t) => t.toLowerCase() === normalizedQuery);
  const showTagDropdown = tagInputFocused && (filteredTagOptions.length > 0 || canAddCustomTag);

  const toastTimer = useRef<number | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  React.useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const animateCard = (toHeight: number, toTranslateY: number) => {
      Animated.parallel([
        Animated.timing(cardHeight, {
          toValue: toHeight,
          duration: 180,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(cardTranslateY, {
          toValue: toTranslateY,
          duration: 180,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]).start();
    };

    const showSub = Keyboard.addListener(showEvent, () =>
      animateCard(windowHeight * 0.45, 18)
    );
    const hideSub = Keyboard.addListener(hideEvent, () =>
      animateCard(windowHeight * 0.5, 0)
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedTagQuery(tagQuery), 90);
    return () => clearTimeout(timer);
  }, [tagQuery]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimer.current) {
      clearTimeout(toastTimer.current as unknown as number);
    }
    // @ts-ignore
    toastTimer.current = setTimeout(() => setToastMessage(''), 2500);
  };

  const resetForm = () => {
    setDetailTitle(eventTitle);
    setDetailDate('');
    setDetailTime('');
    setMeridiem('AM');
    setDetailNotes('');
    setDetailTags([]);
    setTagQuery('');
    setTagInputFocused(false);
    setShowCalendar(false);
    cardHeight.setValue(windowHeight * 0.5);
    cardTranslateY.setValue(0);
  };

  const handleCancel = () => {
    console.log('[EventDetailsModal] cancel pressed');
    resetForm();
    onClose();
  };

  const handleTimeChange = (input: string) => {
    // Remove any non-digit characters
    const digitsOnly = input.replace(/\D/g, '');
    
    // Limit to 4 digits
    if (digitsOnly.length > 4) {
      return;
    }

    // Format as HH:MM
    let formatted = digitsOnly;
    if (digitsOnly.length >= 2) {
      const hours = digitsOnly.slice(0, 2);
      const minutes = digitsOnly.slice(2, 4);
      
      // Validate hours (01-12 for 12-hour format)
      const hoursNum = parseInt(hours);
      if (hoursNum === 0 || hoursNum > 12) {
        return;
      }
      
      // Validate minutes (00-59) if present
      if (minutes.length > 0) {
        const minutesNum = parseInt(minutes);
        if (minutesNum > 59) {
          return;
        }
        formatted = `${hours}:${minutes}`;
      } else {
        formatted = hours;
      }
    }
    
    setDetailTime(formatted);
  };

  const handleAddTag = useCallback((rawTag: string) => {
    const tag = rawTag.trim();
    if (!tag) return;

    keepTagDropdownOpenRef.current = true;
    setDetailTags((prev) => {
      if (prev.some((t) => t.toLowerCase() === tag.toLowerCase())) {
        return prev;
      }
      return [...prev, tag];
    });
    setTagQuery('');
    setTagInputFocused(true);
  }, []);

  const renderTagOption = useCallback(
    (t: string) => (
      <Pressable
        key={t}
        style={styles.tagDropdownRow}
        onPress={() => handleAddTag(t)}
      >
        <Text style={styles.tagDropdownText}>{t}</Text>
        <Text style={styles.tagPlusSymbol}>+</Text>
      </Pressable>
    ),
    [handleAddTag]
  );

  const handleSave = async () => {
    const title = detailTitle.trim();
    if (!title) {
      showToast('Please enter a title for the event.');
      return;
    }

    try {
      const payload: any = {
        title,
        description: detailNotes || '',
        tags: detailTags,
      };
      if (detailDate) payload.date = detailDate;
      if (detailTime) payload.time = `${detailTime} ${meridiem}`;
      payload.lat = 0;
      payload.lng = 0;

      await addEvent(payload);
      showToast('Event saved');
      console.log('[EventDetailsModal] saved, closing');
      onClose();
      onSaved?.();
    } catch (error) {
      showToast('Could not save event.');
    }
  };

  if (!visible) return null;

  return (
    <>
      <Animated.View
        style={[
          styles.modalCard,
          { height: cardHeight, transform: [{ translateY: cardTranslateY }] },
        ]}
      >
            <Text style={styles.modalTitle}>Event Details</Text>

            <View style={styles.scrollArea}>
              <ScrollView
                style={[
                  styles.container,
                  Platform.OS === 'web' ? ({ overscrollBehavior: 'contain' } as any) : null,
                ]}
                contentContainerStyle={styles.containerContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                scrollEnabled={!showTagDropdown}
                bounces={false}
                overScrollMode="never"
              >
              <Text style={styles.label}>Title</Text>
              <TextInput style={styles.input} placeholder="Title" placeholderTextColor="#9ca3af" value={detailTitle} onChangeText={setDetailTitle} />

              <View style={styles.row}>
                <View style={styles.halfColumn}>
                  <Text style={styles.label}>Date</Text>
                  <Pressable 
                    style={[styles.input, styles.halfInput, styles.dateButton, styles.compactRowInput]}
                    onPress={() => setShowCalendar(true)}
                  >
                    <Text style={[styles.dateButtonText, { color: detailDate ? '#111827' : '#9ca3af' }]}>{detailDate || 'Select date'}</Text>
                  </Pressable>
                </View>
                <View style={styles.halfColumn}>
                  <Text style={styles.label}>Time</Text>
                  <View style={styles.timeRow}>
                    <TextInput style={[styles.input, styles.timeInput, styles.compactRowInput]} placeholder="HH:MM" placeholderTextColor="#9ca3af" value={detailTime} onChangeText={handleTimeChange} keyboardType="decimal-pad" maxLength={5} />
                    <Pressable 
                      style={styles.meridiemButton}
                      onPress={() => setMeridiem(meridiem === 'AM' ? 'PM' : 'AM')}
                    >
                      <Text style={styles.meridiemText}>{meridiem}</Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              <View style={styles.tagsSection}>
                <Text style={styles.label}>Tags</Text>
                <View style={styles.tagInputWrap}>
                  <View style={styles.tagInputRow}>
                    <TextInput 
                      style={[styles.input, styles.tagInput]} 
                      placeholder="Search or add a tag"
                      placeholderTextColor="#9ca3af" 
                      value={tagQuery} 
                      onChangeText={setTagQuery}
                      onFocus={() => setTagInputFocused(true)}
                      onSubmitEditing={() => {
                        if (canAddCustomTag) {
                          handleAddTag(tagQuery);
                        }
                      }}
                      returnKeyType="done"
                      onBlur={() =>
                        setTimeout(() => {
                          if (keepTagDropdownOpenRef.current) {
                            keepTagDropdownOpenRef.current = false;
                            return;
                          }
                          setTagInputFocused(false);
                        }, 180)
                      }
                    />
                    <Pressable
                      style={styles.comboToggleButton}
                      onPress={() => setTagInputFocused((prev) => !prev)}
                    >
                      <Text style={styles.comboToggleText}>{tagInputFocused ? '▴' : '▾'}</Text>
                    </Pressable>
                  </View>
                  
                  {showTagDropdown && (
                    <View
                      style={styles.tagDropdown}
                      // Prevent wheel/touch bubbling to the parent scroll container while using the dropdown.
                      {...(Platform.OS === 'web'
                        ? ({
                            onWheelCapture: (e: any) => {
                              keepTagDropdownOpenRef.current = true;
                              e.stopPropagation();
                            },
                            onTouchMoveCapture: (e: any) => {
                              keepTagDropdownOpenRef.current = true;
                              e.stopPropagation();
                            },
                          } as any)
                        : {})}
                    >
                      <ScrollView
                        style={[
                          styles.tagDropdownScroll,
                          Platform.OS === 'web' ? ({ overscrollBehavior: 'contain' } as any) : null,
                        ]}
                        nestedScrollEnabled
                        keyboardShouldPersistTaps="handled"
                        onScrollBeginDrag={() => {
                          keepTagDropdownOpenRef.current = true;
                        }}
                        onTouchStart={() => {
                          keepTagDropdownOpenRef.current = true;
                        }}
                      >
                        {canAddCustomTag && (
                          <Pressable
                            style={[styles.tagDropdownRow, styles.addCustomRow]}
                            onPress={() => handleAddTag(tagQuery)}
                          >
                            <Text style={styles.tagDropdownText}>Add "{tagQuery.trim()}"</Text>
                            <Text style={styles.tagPlusSymbol}>+</Text>
                          </Pressable>
                        )}
                        {filteredTagOptions.map(renderTagOption)}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {detailTags.length > 0 && (
                  <View style={styles.tagsContainer}>
                    {detailTags.map((t) => (
                      <View key={t} style={styles.tagPill}>
                        <Text style={styles.tagText}>{t}</Text>
                        <Pressable onPress={() => setDetailTags((s) => s.filter((x) => x !== t))}>
                          <Text style={styles.tagRemove}>×</Text>
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                placeholder="Notes"
                placeholderTextColor="#9ca3af"
                value={detailNotes}
                onChangeText={setDetailNotes}
                multiline
                numberOfLines={4}
              />
              </ScrollView>
            </View>

            {!showTagDropdown && (
              <View style={styles.modalActions}>
                <Pressable style={[styles.actionButton, styles.cancelButton]} onPress={handleCancel}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable style={[styles.actionButton, styles.saveButton]} onPress={handleSave}>
                  <Text style={styles.saveText}>Enter</Text>
                </Pressable>
              </View>
            )}
      </Animated.View>
      {toastMessage ? (
        <View style={styles.toast} pointerEvents="none">
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      ) : null}

      <Modal visible={showCalendar} transparent animationType="fade" onRequestClose={() => setShowCalendar(false)}>
        <View style={styles.calendarOverlay}>
          <View style={styles.calendarModal}>
            <Calendar
              onDayPress={(day) => {
                setDetailDate(day.dateString);
                setShowCalendar(false);
              }}
              markedDates={detailDate ? { [detailDate]: { selected: true, selectedColor: '#22c55e' } } : {}}
              theme={{
                selectedDayBackgroundColor: '#22c55e',
                selectedDayTextColor: '#fff',
                todayTextColor: '#22c55e',
                arrowColor: '#22c55e',
              }}
            />
            <Pressable 
              style={styles.calendarCloseButton}
              onPress={() => setShowCalendar(false)}
            >
              <Text style={styles.calendarCloseText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
    minHeight: 0,
  },
  scrollArea: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  container: {
    flex: 1,
    minHeight: 0,
  },
  containerContent: {
    paddingBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 16,
    color: '#111827',
    minHeight: 44,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 2,
  },
  compactRowInput: {
    marginBottom: 0,
  },
  halfColumn: {
    flex: 1,
  },
  halfInput: {
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    marginBottom: 2,
  },
  timeInput: {
    flex: 1,
    marginBottom: 0,
  },
  meridiemButton: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
  },
  meridiemText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 14,
  },
  dateButton: {
    justifyContent: 'center',
  },
  dateButtonText: {
    fontSize: 16,
  },
  calendarContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarModal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    maxWidth: 380,
  },
  calendarCloseButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    alignItems: 'center',
  },
  calendarCloseText: {
    fontWeight: '600',
    color: '#374151',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 2,
  },
  tagDropdown: {
    position: 'absolute',
    top: '100%',
    marginTop: 4,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    maxHeight: 340,
    zIndex: 120,
    elevation: 14,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  tagDropdownScroll: {
    maxHeight: 340,
  },
  tagInputWrap: {
    position: 'relative',
    zIndex: 110,
  },
  tagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagInput: {
    flex: 1,
    marginBottom: 0,
  },
  comboToggleButton: {
    width: 38,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  comboToggleText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '700',
  },
  tagRow: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tagDropdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    minHeight: 48,
  },
  addCustomRow: {
    backgroundColor: '#ecfdf5',
  },
  tagDropdownText: {
    fontSize: 15,
    color: '#111827',
    flex: 1,
  },
  tagPlusSymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#22c55e',
    marginLeft: 8,
  },
  tagsSection: {
    marginBottom: 0,
    position: 'relative',
    zIndex: 100,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    marginBottom: 0,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
  },
  tagText: {
    marginRight: 6,
  },
  tagRemove: {
    color: '#6b7280',
    fontWeight: '600',
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  toast: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  toastText: {
    color: 'white',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelText: {
    color: '#111827',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#22c55e',
  },
  saveText: {
    color: 'white',
    fontWeight: '600',
  },
});
