import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Modal } from 'react-native';
import { useEffect, useState } from 'react';
import { addCoins, getCoinCount } from '@/firebase/database';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ShopItem {
  id: string;
  name: string;
  image: any;
  cost: number;
}

interface ShopSection {
  title: string;
  items: ShopItem[];
}

export default function ShopScreen() {
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentCoins, setCurrentCoins] = useState(0);

    useEffect(() => {
    // Subscribe to real-time updates
    const docRef = doc(db, "game", "coins");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setCurrentCoins(docSnap.data().count || 0);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleCoinCountChange = async (diff) => {
    await addCoins(diff);
  };

  const handleItemPress = (item: ShopItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleConfirmPurchase = () => {
    if (selectedItem) {
      // Handle purchase logic here
      console.log(`Purchasing ${selectedItem.name} for ${selectedItem.cost} coins`);
      // You can add your purchase logic here (e.g., deduct coins, add item to inventory)
      handleCoinCountChange(-1*selectedItem.cost)
    }
    setModalVisible(false);
    setSelectedItem(null);
  };

  const handleCancelPurchase = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

  // Sample shop data - replace with your actual data
  const shopSections: ShopSection[] = [
    {
      title: 'Power-Ups',
      items: [
        { id: '1', name: '2x Points', image: require('@/assets/images/react-logo.png'), cost: 100 },
        { id: '2', name: 'Shield', image: require('@/assets/images/react-logo.png'), cost: 150 },
        { id: '3', name: 'Booster', image: require('@/assets/images/react-logo.png'), cost: 200 },
        { id: '4', name: 'Extra Life', image: require('@/assets/images/react-logo.png'), cost: 250 },
        { id: '5', name: 'Time Freeze', image: require('@/assets/images/react-logo.png'), cost: 300 },
        { id: '6', name: 'Speed Up', image: require('@/assets/images/react-logo.png'), cost: 175 },
        { id: '7', name: 'Lucky Star', image: require('@/assets/images/react-logo.png'), cost: 225 },
        { id: '8', name: 'Magnet', image: require('@/assets/images/react-logo.png'), cost: 125 },
        { id: '9', name: 'Multiplier', image: require('@/assets/images/react-logo.png'), cost: 275 },
      ],
    },
    {
      title: 'Cosmetics',
      items: [
        { id: '10', name: 'Red Theme', image: require('@/assets/images/react-logo.png'), cost: 50 },
        { id: '11', name: 'Blue Theme', image: require('@/assets/images/react-logo.png'), cost: 50 },
        { id: '12', name: 'Green Theme', image: require('@/assets/images/react-logo.png'), cost: 50 },
        { id: '13', name: 'Gold Border', image: require('@/assets/images/react-logo.png'), cost: 100 },
        { id: '14', name: 'Silver Border', image: require('@/assets/images/react-logo.png'), cost: 75 },
        { id: '15', name: 'Bronze Border', image: require('@/assets/images/react-logo.png'), cost: 60 },
        { id: '16', name: 'Sparkle Effect', image: require('@/assets/images/react-logo.png'), cost: 120 },
        { id: '17', name: 'Glow Effect', image: require('@/assets/images/react-logo.png'), cost: 110 },
        { id: '18', name: 'Shadow Effect', image: require('@/assets/images/react-logo.png'), cost: 90 },
      ],
    },
    {
      title: 'Special Items',
      items: [
        { id: '19', name: 'Mystery Box', image: require('@/assets/images/react-logo.png'), cost: 500 },
        { id: '20', name: 'Rare Chest', image: require('@/assets/images/react-logo.png'), cost: 750 },
        { id: '21', name: 'Epic Crate', image: require('@/assets/images/react-logo.png'), cost: 1000 },
        { id: '22', name: 'Daily Bonus', image: require('@/assets/images/react-logo.png'), cost: 200 },
        { id: '23', name: 'Weekly Pack', image: require('@/assets/images/react-logo.png'), cost: 600 },
        { id: '24', name: 'Monthly Deal', image: require('@/assets/images/react-logo.png'), cost: 1500 },
        { id: '25', name: 'Starter Pack', image: require('@/assets/images/react-logo.png'), cost: 300 },
        { id: '26', name: 'Pro Pack', image: require('@/assets/images/react-logo.png'), cost: 800 },
        { id: '27', name: 'Ultimate Pack', image: require('@/assets/images/react-logo.png'), cost: 2000 },
      ],
    },
  ];

  const renderShopItem = (item: ShopItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.shopItem}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.itemImage} resizeMode="contain" />
      </View>
      <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
      <View style={styles.coinContainer}>
        <Text style={styles.coinIcon}>🪙</Text>
        <Text style={styles.coinCost}>{item.cost}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSection = (section: ShopSection, index: number) => (
    <View key={index} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.gridContainer}>
        {section.items.map(item => renderShopItem(item))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shop</Text>
        <View style={styles.coinBalance}>
          <Text style={styles.coinBalanceIcon}>🪙</Text>
          <Text style={styles.coinBalanceText}>{currentCoins.toLocaleString()}</Text>
        </View>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {shopSections.map((section, index) => renderSection(section, index))}
      </ScrollView>

      {/* Purchase Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCancelPurchase}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Purchase</Text>

            {selectedItem && (
              <>
                <View style={styles.modalImageContainer}>
                  <Image
                    source={selectedItem.image}
                    style={styles.modalImage}
                    resizeMode="contain"
                  />
                </View>

                <Text style={styles.modalItemName}>{selectedItem.name}</Text>

                <View style={styles.modalCoinContainer}>
                  <Text style={styles.modalCoinIcon}>🪙</Text>
                  <Text style={styles.modalCoinCost}>{selectedItem.cost}</Text>
                </View>

                <Text style={styles.modalQuestion}>
                  Do you want to purchase this item?
                </Text>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={handleCancelPurchase}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      currentCoins >= selectedItem.cost ? styles.confirmButton : styles.disabledButton
                    ]}
                    onPress={currentCoins >= selectedItem.cost ? handleConfirmPurchase : undefined}
                    activeOpacity={currentCoins >= selectedItem.cost ? 0.8 : 1}
                    disabled={currentCoins < selectedItem.cost}
                  >
                    <Text style={styles.confirmButtonText}>Purchase</Text>
                  </TouchableOpacity>
                </View>

                {currentCoins < selectedItem.cost && (
                  <Text style={styles.errorText}>Not enough coins!</Text>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const ITEM_SIZE = (SCREEN_WIDTH - 60) / 3; // 3 items per row, accounting for padding

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  coinBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ffc107',
  },
  coinBalanceIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  coinBalanceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#856404',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 30,
  },
  section: {
    marginBottom: 30,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  shopItem: {
    width: ITEM_SIZE,
    aspectRatio: 1,
    backgroundColor: '#fafafa',
    borderRadius: 10,
    padding: 8,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImage: {
    width: '80%',
    height: '80%',
  },
  itemName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginTop: 4,
  },
  coinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: '#fff3cd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  coinIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  coinCost: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#856404',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  modalImageContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  modalImage: {
    width: '80%',
    height: '80%',
  },
  modalItemName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalCoinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
  },
  modalCoinIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  modalCoinCost: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#856404',
  },
  modalQuestion: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  errorText: {
    marginTop: 15,
    fontSize: 14,
    fontWeight: '600',
    color: '#dc3545',
    textAlign: 'center',
  },
});