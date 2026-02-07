import { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { addEvent } from '../firebase/database';
import EventDetailsModal from './EventDetailsModal';

type LogEventModalProps = {
  visible: boolean;
  onClose: () => void;
  onSaved?: () => void;
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
];

export default function LogEventModal({ visible, onClose, onSaved }: LogEventModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<Event[]>(DEFAULT_EVENTS);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customTitle, setCustomTitle] = useState('');

  const [detailsVisible, setDetailsVisible] = useState(false);
  const [detailsEventTitle, setDetailsEventTitle] = useState('');

  const toastTimer = useRef<number | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (visible) {
      setEvents((prev) => (prev.length ? prev : DEFAULT_EVENTS));
      setSelectedEvent(null);
      setSearchQuery('');
      setShowCustom(false);
    }
  }, [visible]);

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

  const handleClose = () => {
    onClose();
  };

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    setDetailsEventTitle(event.title || '');
    setDetailsVisible(true);
  };

  const handleSaveCustom = async () => {
    const title = customTitle.trim();
    if (!title) {
      showToast('Please enter a custom event title.');
      return;
    }

    try {
      setDetailsEventTitle(title);
      setDetailsVisible(true);
      setShowCustom(false);
      setCustomTitle('');
    } catch (error) {
      showToast('Could not open event details.');
    }
  };

  const handleSaveDetails = async () => {
    const title = detailsEventTitle.trim();
    if (!title) {
      showToast('Please enter a title for the event.');
      return;
    }

    try {
      const payload: any = {
        title,
        description: '',
        tags: [],
      };
      payload.lat = selectedEvent?.lat ?? 0;
      payload.lng = selectedEvent?.lng ?? 0;

      const docId = await addEvent(payload);
      const newEvent: Event = { id: docId, title };
      setEvents((prev) => [newEvent, ...prev]);
      setDetailsVisible(false);
      setSelectedEvent(newEvent);
      showToast('Event saved');
      onClose();
      onSaved?.();
    } catch (error) {
      showToast('Could not save event.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Log Event</Text>

          <TextInput
            style={styles.searchBar}
            placeholder="Search events..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {loading ? (
            <ActivityIndicator size="large" color="#22c55e" style={styles.loader} />
          ) : (
            <FlatList
              data={filteredEvents}
              keyExtractor={(item) => item.id}
              scrollEnabled={true}
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
              ListEmptyComponent={
                <Text style={styles.emptyText}>No events found</Text>
              }
            />
          )}

          {/* Static custom event button (same size as search bar). */}
          {!showCustom ? (
            <Pressable
              style={styles.customButton}
              onPress={() => setShowCustom(true)}
            >
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
              onPress={() => {
                setShowCustom(false);
                setCustomTitle('');
                handleClose();
              }}
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
        </View>
      </View>

      <EventDetailsModal
        visible={detailsVisible}
        eventTitle={detailsEventTitle}
        onClose={() => setDetailsVisible(false)}
        onSaved={onSaved}
      />
      {toastMessage ? (
        <View style={styles.toast} pointerEvents="none">
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      ) : null}
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
});
