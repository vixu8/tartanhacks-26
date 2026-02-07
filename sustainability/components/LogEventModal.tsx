import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,

  Text,
  TextInput,
  View
} from 'react-native';


import EventDetailsModal from './EventDetailsModal';

type LogEventModalProps = {
  visible: boolean;
  onClose: () => void;
  onSaved?: () => void;
  presetId?: string;
};

type Event = {
  id: string;
  title: string;
  description?: string;
  lat?: number;
  lng?: number;
};

const DEFAULT_EVENTS: Event[] = [
  { id: '1', title: 'Walked', description: 'Walked instead of driving.' },
  { id: '2', title: 'Biked', description: 'Biked to destination.' },
  { id: '3', title: 'Drove', description: 'Drove to location.' },
  { id: '4', title: 'Thrifted', description: 'Bought secondhand items.' },
  { id: '5', title: 'Ate plant-based', description: 'Chose plant-based meal option.' },
  { id: '6', title: 'Recycled', description: 'Properly recycled materials.' },
  { id: '7', title: 'Compostable product', description: 'Used or purchased compostable products.' },
  { id: '8', title: 'Lights off', description: 'Turned off lights when not in use.' },
  { id: '9', title: 'Tap off while brushing', description: 'Turned off tap while brushing teeth.' },
  { id: '10', title: 'Refill bottle', description: 'Refilled reusable water bottle.' },
  { id: '11', title: 'No AI usage', description: 'Completed task without using AI.' },
  { id: '12', title: 'Went to sustainable event', description: 'Went to an event that encourages sustainability.' },
];

export default function LogEventModal({ visible, onClose, onSaved, presetId }: LogEventModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<Event[]>(DEFAULT_EVENTS);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customTitle, setCustomTitle] = useState('');

  const [activeView, setActiveView] = useState<'list' | 'details'>('list');
  const [detailsEventTitle, setDetailsEventTitle] = useState('');

  const toastTimer = useRef<number | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const windowHeight = useRef(Dimensions.get('window').height).current;
  const cardHeight = useRef(new Animated.Value(windowHeight * 0.5)).current;
  const cardTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      console.log('[LogEventModal] visible -> true');
      setEvents((prev) => (prev.length ? prev : DEFAULT_EVENTS));
      setSelectedEvent(null);
      setSearchQuery('');
      setShowCustom(false);


      const preset = presetId ? DEFAULT_EVENTS.find(e => e.id === presetId) : null;
    if (preset) {
      setSelectedEvent(preset);
      setDetailsEventTitle(preset.title || "");
      setActiveView('details');
    } else {
      setSelectedEvent(null);
      setActiveView('list');
      setDetailsEventTitle("");
    }

      cardHeight.setValue(windowHeight * 0.5);
      cardTranslateY.setValue(0);

    }
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      console.log('[LogEventModal] visible -> false');
      resetLogEventState();
      cardHeight.setValue(windowHeight * 0.5);
      cardTranslateY.setValue(0);
    }
  }, [visible]);

  useEffect(() => {
    console.log('[LogEventModal] activeView ->', activeView);
  }, [activeView]);

  useEffect(() => {
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
      animateCard(windowHeight * 0.45, 16)
    );
    const hideSub = Keyboard.addListener(hideEvent, () =>
      animateCard(windowHeight * 0.5, 0)
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const filteredEvents = events.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimer.current) {
      clearTimeout(toastTimer.current as unknown as number);
    }
    // @ts-ignore
    toastTimer.current = setTimeout(() => setToastMessage(''), 2500);
  };

  const resetLogEventState = () => {
    setShowCustom(false);
    setCustomTitle('');
    setSelectedEvent(null);
    setSearchQuery('');
    setDetailsEventTitle('');
    setActiveView('list');
  };

  const handleClose = () => {
    console.log('[LogEventModal] handleClose');
    onClose();
  };

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    setDetailsEventTitle(event.title || '');
    setActiveView('details');
  };

  const handleSaveCustom = async () => {
    const title = customTitle.trim();
    if (!title) {
      showToast('Please enter a custom event title.');
      return;
    }

    try {
      setDetailsEventTitle(title);
      setActiveView('details');
      setShowCustom(false);
      setCustomTitle('');
    } catch (error) {
      showToast('Could not open event details.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === 'ios' ? 'padding' : 'position'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
      >
        <View style={styles.modalOverlay}>
          {activeView === 'list' ? (
            <Animated.View
              style={[
                styles.modalCard,
                { height: cardHeight, transform: [{ translateY: cardTranslateY }] },
              ]}
            >
              {/* --- your list UI exactly as before --- */}
              <Text style={styles.modalTitle}>Log Event</Text>
  
              <TextInput
                style={styles.searchBar}
                placeholder="Search events..."
                placeholderTextColor="#374151"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
  
              {loading ? (
                <ActivityIndicator size="large" color="#22c55e" style={styles.loader} />
              ) : (
                <FlatList
                  data={filteredEvents}
                  keyExtractor={(item) => item.id}
                  style={styles.eventList}
                  renderItem={({ item }) => (
                    <Pressable
                      style={[
                        styles.eventItem,
                        selectedEvent?.id === item.id && styles.eventItemSelected,
                      ]}
                      onPress={() => handleSelectEvent(item)}
                    >
                      <Text style={styles.eventTitle}>{item.title}</Text>
                    </Pressable>
                  )}
                  ListEmptyComponent={<Text style={styles.emptyText}>No events found</Text>}
                />
              )}
  
              {!showCustom ? (
                <Pressable style={styles.customButton} onPress={() => setShowCustom(true)}>
                  <Text style={styles.customButtonText}>Custom Event</Text>
                </Pressable>
              ) : (
                <TextInput
                  style={styles.searchBar}
                  placeholder="Custom event title"
                  value={customTitle}
                  onChangeText={setCustomTitle}
                />
              )}
  
              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={handleClose}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
  
                {showCustom && (
                  <Pressable
                    style={[styles.actionButton, styles.saveButton]}
                    onPress={handleSaveCustom}
                  >
                    <Text style={styles.saveText}>Save</Text>
                  </Pressable>
                )}
              </View>
            </Animated.View>
          ) : (
            // 👇 Render details *inside the same modal*
            <EventDetailsModal
              visible={activeView === 'details'}
              eventTitle={detailsEventTitle}
              onClose={handleClose}
              onSaved={onSaved}
            />
          )}
        </View>
  
        {toastMessage ? (
          <View style={styles.toast} pointerEvents="none">
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </Modal>
  );
  
}

const styles = StyleSheet.create({
  keyboardAvoiding: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
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
  searchBar: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  eventList: {
    flex: 1,
    marginBottom: 12,
  },
  eventItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  eventItemSelected: {
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  customButton: {
    borderWidth: 1,
    borderColor: '#16a34a',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
  },
  customButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  detailsContainer: {
    flex: 1,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  halfInput: {
    flex: 1,
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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    marginRight: 8,
  },
  tagText: {
    marginRight: 6,
  },
  tagRemove: {
    color: '#6b7280',
    fontWeight: '600',
  },
  notesInput: {
    minHeight: 72,
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
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    marginTop: 20,
    fontSize: 16,
  },
  loader: {
    marginVertical: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
