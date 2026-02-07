import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { addEvent } from '../firebase/database';

type EventDetailsModalProps = {
  visible: boolean;
  eventTitle: string;
  onClose: () => void;
  onSaved?: () => void;
};

const COMMON_TAGS = [
  'transportation',
  'recycling',
  'food',
  'shopping',
  'exercise',
  'community',
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
      setDetailTitle(eventTitle);
    }
  }, [visible, eventTitle]);
  const [detailDate, setDetailDate] = useState('');
  const [detailTime, setDetailTime] = useState('');
  const [meridiem, setMeridiem] = useState<'AM' | 'PM'>('AM');
  const [detailNotes, setDetailNotes] = useState('');
  const [detailTags, setDetailTags] = useState<string[]>([]);
  const [tagQuery, setTagQuery] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  const toastTimer = useRef<number | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimer.current) {
      clearTimeout(toastTimer.current as unknown as number);
    }
    // @ts-ignore
    toastTimer.current = setTimeout(() => setToastMessage(''), 2500);
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
      onClose();
      onSaved?.();
    } catch (error) {
      showToast('Could not save event.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Event Details</Text>

          <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Title</Text>
            <TextInput style={styles.input} placeholder="Title" placeholderTextColor="#9ca3af" value={detailTitle} onChangeText={setDetailTitle} />

            <View style={styles.row}>
              <View style={styles.halfColumn}>
                <Text style={styles.label}>Date</Text>
                <Pressable 
                  style={[styles.input, styles.halfInput, styles.dateButton]}
                  onPress={() => setShowCalendar(true)}
                >
                  <Text style={[styles.dateButtonText, { color: detailDate ? '#111827' : '#9ca3af' }]}>{detailDate || 'Select date'}</Text>
                </Pressable>
              </View>
              <View style={styles.halfColumn}>
                <Text style={styles.label}>Time</Text>
                <View style={styles.timeRow}>
                  <TextInput style={[styles.input, styles.timeInput]} placeholder="HH:MM" placeholderTextColor="#9ca3af" value={detailTime} onChangeText={handleTimeChange} keyboardType="decimal-pad" maxLength={5} />
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
              <TextInput style={styles.input} placeholder="Add tags (search or type then press +)" placeholderTextColor="#9ca3af" value={tagQuery} onChangeText={setTagQuery} />
              {tagQuery.length > 0 && (
                <View style={styles.tagDropdown}>
                  {COMMON_TAGS.filter((t) => t.includes(tagQuery.toLowerCase())).map((t) => (
                    <Pressable
                      key={t}
                      style={styles.tagRow}
                      onPress={() => {
                        if (!detailTags.includes(t)) setDetailTags((s) => [...s, t]);
                        setTagQuery('');
                      }}
                    >
                      <Text>{t}</Text>
                    </Pressable>
                  ))}
                  <Pressable
                    style={styles.tagRow}
                    onPress={() => {
                      const t = tagQuery.trim();
                      if (t && !detailTags.includes(t)) setDetailTags((s) => [...s, t]);
                      setTagQuery('');
                    }}
                  >
                    <Text>Add "{tagQuery}"</Text>
                  </Pressable>
                </View>
              )}

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

          <View style={styles.modalActions}>
            <Pressable style={[styles.actionButton, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.actionButton, styles.saveButton]} onPress={handleSave}>
              <Text style={styles.saveText}>Enter</Text>
            </Pressable>
          </View>
        </View>
      </View>

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
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    height: '50%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  container: {
    flex: 1,
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
    placeholderTextColor: '#1f2937',
    minHeight: 44,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
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
    marginBottom: 12,
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
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginTop: 6,
    maxHeight: 120,
  },
  tagRow: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tagsSection: {
    marginBottom: 0,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
