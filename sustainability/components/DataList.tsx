import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from "react-native";
import { useState } from "react";
import DataRow from "./DataRow";

export interface DataItem {
  id: string;
  title: string;
  points: number;
  description?: string;
  date?: string;
  time?: string;
  tags?: string[];
}

interface DataListProps {
  data: DataItem[];
}

export default function DataList({ data }: DataListProps) {
  const [selectedItem, setSelectedItem] = useState<DataItem | null>(null);

  const handleRowPress = (item: DataItem) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  return (
    <View style={styles.container}>
      {/* List of Data Rows */}
      {data.map((item) => (
        <DataRow
          key={item.id}
          title={item.title}
          points={item.points}
          onPress={() => handleRowPress(item)}
        />
      ))}

      {/* Detail View Modal */}
      <Modal
        visible={selectedItem !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedItem && (
              <>
                {/* Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedItem.title}</Text>
                  <TouchableOpacity
                    onPress={handleCloseModal}
                    style={styles.closeButton}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Points Display */}
                <View style={styles.pointsContainer}>
                  <Text style={styles.pointsLabel}>Points:</Text>
                  <Text
                    style={[
                      styles.pointsValue,
                      selectedItem.points >= 0
                        ? styles.positive
                        : styles.negative,
                    ]}
                  >
                    {selectedItem.points >= 0 ? "+" : ""}
                    {selectedItem.points}
                  </Text>
                </View>

                {/* Date */}
                {selectedItem.date && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Date:</Text>
                    <Text style={styles.detailValue}>{selectedItem.date}</Text>
                  </View>
                )}

                {/* Time */}
                {selectedItem.time && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Time:</Text>
                    <Text style={styles.detailValue}>{selectedItem.time}</Text>
                  </View>
                )}

                {/* Tags */}
                {selectedItem.tags && selectedItem.tags.length > 0 && (
                  <View style={styles.tagsContainer}>
                    <Text style={styles.detailLabel}>Tags:</Text>
                    <View style={styles.tagsWrapper}>
                      {selectedItem.tags.map((tag, index) => (
                        <View key={index} style={styles.tagPill}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Description */}
                {selectedItem.description && (
                  <View style={styles.descriptionContainer}>
                    <Text style={styles.detailLabel}>Description:</Text>
                    <ScrollView style={styles.descriptionScroll}>
                      <Text style={styles.descriptionText}>
                        {selectedItem.description}
                      </Text>
                    </ScrollView>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    paddingRight: 16,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 20,
    color: "#666",
    fontWeight: "bold",
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
  },
  pointsLabel: {
    fontSize: 18,
    fontWeight: "500",
    color: "#666",
    marginRight: 12,
  },
  pointsValue: {
    fontSize: 32,
    fontWeight: "bold",
  },
  positive: {
    color: "#22c55e",
  },
  negative: {
    color: "#ef4444",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginRight: 8,
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
  },
  descriptionContainer: {
    marginTop: 8,
  },
  descriptionScroll: {
    maxHeight: 200,
    marginTop: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  tagsContainer: {
    marginBottom: 16,
  },
  tagsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  tagPill: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
});
