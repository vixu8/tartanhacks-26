import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Modal, Image } from 'react-native';
import { useEffect, useState } from 'react';
import { addCoins, getCoinCount } from '@/firebase/database';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ShopItem {
  id: string;
  name: string;
  imageUrl: string;
  cost: number;
  description: string;
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
      handleCoinCountChange(-1 * selectedItem.cost);
    }
    setModalVisible(false);
    setSelectedItem(null);
  };

  const handleCancelPurchase = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

  // Using Noto Emoji style for cute, recognizable images
  const getImageUrl = (emoji: string) => {
    // Use OpenMoji for cute, flat design emojis
    const emojiCode = emoji.codePointAt(0)?.toString(16).toUpperCase().padStart(4, '0');
    return `https://raw.githubusercontent.com/hfg-gmuend/openmoji/master/color/618x618/${emojiCode}.png`;
  };

  // Shop data with world customization items using cute images
  const shopSections: ShopSection[] = [
    {
      title: 'Plants & Flowers',
      items: [
        { 
          id: '1', 
          name: 'Sunflowers', 
          imageUrl: getImageUrl('🌻'), 
          cost: 75,
          description: 'Add a cheerful patch of sunflowers around your tree. They sway gently in the breeze!'
        },
        { 
          id: '2', 
          name: 'Cherry Blossoms', 
          imageUrl: getImageUrl('🌸'), 
          cost: 120,
          description: 'Beautiful pink cherry blossoms that bloom at the base of your tree for 7 days.'
        },
        { 
          id: '3', 
          name: 'Tulip Garden', 
          imageUrl: getImageUrl('🌷'), 
          cost: 90,
          description: 'A colorful bed of tulips in red, yellow, and pink. Perfect for spring vibes!'
        },
        { 
          id: '4', 
          name: 'Rose Bush', 
          imageUrl: getImageUrl('🌹'), 
          cost: 100,
          description: 'Elegant red roses grow beside your tree, adding romance to your world.'
        },
        { 
          id: '5', 
          name: 'Wildflower Meadow', 
          imageUrl: getImageUrl('🌼'), 
          cost: 85,
          description: 'A natural meadow of mixed wildflowers spreads across your landscape.'
        },
        { 
          id: '6', 
          name: 'Lotus Pond', 
          imageUrl: getImageUrl('🪷'), 
          cost: 150,
          description: 'Add a serene pond with floating lotus flowers near your tree.'
        },
        { 
          id: '7', 
          name: 'Mushroom Circle', 
          imageUrl: getImageUrl('🍄'), 
          cost: 65,
          description: 'Whimsical mushrooms grow in a fairy ring around your tree base.'
        },
        { 
          id: '8', 
          name: 'Cactus Garden', 
          imageUrl: getImageUrl('🌵'), 
          cost: 80,
          description: 'Desert cacti add a unique southwestern touch to your environment.'
        },
      ],
    },
    {
      title: 'Animals & Pets',
      items: [
        { 
          id: '9', 
          name: 'Butterfly Swarm', 
          imageUrl: getImageUrl('🦋'), 
          cost: 110,
          description: 'Colorful butterflies flutter around your tree for 3 days, adding life and movement.'
        },
        { 
          id: '10', 
          name: 'Bird Nest', 
          imageUrl: getImageUrl('🐦'), 
          cost: 95,
          description: 'A family of birds makes a nest in your tree. Hear them chirp throughout the day!'
        },
        { 
          id: '11', 
          name: 'Friendly Squirrel', 
          imageUrl: getImageUrl('🐿️'), 
          cost: 120,
          description: 'An adorable squirrel scampers up and down your tree, collecting acorns.'
        },
        { 
          id: '12', 
          name: 'Ladybugs', 
          imageUrl: getImageUrl('🐞'), 
          cost: 70,
          description: 'Lucky ladybugs crawl on your tree leaves, bringing good fortune.'
        },
        { 
          id: '13', 
          name: 'Bunny Visitor', 
          imageUrl: getImageUrl('🐰'), 
          cost: 100,
          description: 'A cute bunny hops around your tree, nibbling on grass and flowers.'
        },
        { 
          id: '14', 
          name: 'Honeybees', 
          imageUrl: getImageUrl('🐝'), 
          cost: 85,
          description: 'Busy bees buzz around pollinating your flowers and making honey.'
        },
        { 
          id: '15', 
          name: 'Garden Snail', 
          imageUrl: getImageUrl('🐌'), 
          cost: 60,
          description: 'A peaceful snail slowly explores the base of your tree, leaving a sparkly trail.'
        },
        { 
          id: '16', 
          name: 'Owl Perch', 
          imageUrl: getImageUrl('🦉'), 
          cost: 130,
          description: 'A wise owl sits in your tree at night, hooting softly under the stars.'
        },
      ],
    },
    {
      title: 'Weather & Sky',
      items: [
        { 
          id: '17', 
          name: 'Rainbow', 
          imageUrl: getImageUrl('🌈'), 
          cost: 200,
          description: 'A beautiful rainbow arcs over your tree for 24 hours. Pure magical vibes!'
        },
        { 
          id: '18', 
          name: 'Gentle Rain', 
          imageUrl: getImageUrl('🌧️'), 
          cost: 90,
          description: 'Soft rain falls for a day, making everything fresh and helping your plants grow.'
        },
        { 
          id: '19', 
          name: 'Sunshine Rays', 
          imageUrl: getImageUrl('☀️'), 
          cost: 80,
          description: 'Bright sun rays beam down through your tree branches, creating a warm glow.'
        },
        { 
          id: '20', 
          name: 'Starry Night', 
          imageUrl: getImageUrl('✨'), 
          cost: 150,
          description: 'Transform your sky into a stunning starry night with twinkling stars for 24 hours.'
        },
        { 
          id: '21', 
          name: 'Cloud Shapes', 
          imageUrl: getImageUrl('☁️'), 
          cost: 70,
          description: 'Fun shaped clouds (hearts, animals, etc.) float by in your sky.'
        },
        { 
          id: '22', 
          name: 'Northern Lights', 
          imageUrl: getImageUrl('🌌'), 
          cost: 250,
          description: 'Spectacular aurora borealis dances in your night sky for 2 days. Breathtaking!'
        },
        { 
          id: '23', 
          name: 'Fireflies', 
          imageUrl: getImageUrl('🪲'), 
          cost: 110,
          description: 'Magical fireflies illuminate your tree at dusk, creating a fairy-tale atmosphere.'
        },
        { 
          id: '24', 
          name: 'Shooting Stars', 
          imageUrl: getImageUrl('💫'), 
          cost: 140,
          description: 'Watch shooting stars streak across your night sky. Make a wish!'
        },
      ],
    },
    {
      title: 'Special Decorations',
      items: [
        { 
          id: '25', 
          name: 'Fairy Lights', 
          imageUrl: getImageUrl('🎄'), 
          cost: 160,
          description: 'String twinkling fairy lights through your tree branches. Perfect for evenings!'
        },
        { 
          id: '26', 
          name: 'Wind Chimes', 
          imageUrl: getImageUrl('🎐'), 
          cost: 95,
          description: 'Hang beautiful wind chimes that make peaceful sounds in the breeze.'
        },
        { 
          id: '27', 
          name: 'Garden Gnome', 
          imageUrl: getImageUrl('🧙'), 
          cost: 120,
          description: 'A cheerful garden gnome keeps watch over your tree and garden.'
        },
        { 
          id: '28', 
          name: 'Birdhouse', 
          imageUrl: getImageUrl('🏠'), 
          cost: 85,
          description: 'Hang a cozy birdhouse where feathered friends can rest and nest.'
        },
        { 
          id: '29', 
          name: 'Seasonal Wreath', 
          imageUrl: getImageUrl('🎀'), 
          cost: 100,
          description: 'A decorative wreath that changes with the seasons adorns your tree.'
        },
        { 
          id: '30', 
          name: 'Stone Path', 
          imageUrl: getImageUrl('🪨'), 
          cost: 110,
          description: 'A charming stone pathway leads up to your tree through the garden.'
        },
        { 
          id: '31', 
          name: 'Lantern Post', 
          imageUrl: getImageUrl('🏮'), 
          cost: 130,
          description: 'An elegant lantern post lights up your tree area when the sun sets.'
        },
        { 
          id: '32', 
          name: 'Swing', 
          imageUrl: getImageUrl('🛝'), 
          cost: 175,
          description: 'Hang a wooden swing from your tree branch. Peaceful and nostalgic!'
        },
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
        <Image 
          source={{ uri: item.imageUrl }} 
          style={styles.itemImage}
          resizeMode="contain"
        />
      </View>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.coinContainer}>
          <Text style={styles.coinCost}>{item.cost}</Text>
        </View>
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
          <Text style={styles.coinIcon}>🪙</Text>
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

      {/* Item Details Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCancelPurchase}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedItem && (
              <>
                <View style={styles.modalImageContainer}>
                  <Image 
                    source={{ uri: selectedItem.imageUrl }} 
                    style={styles.modalImage}
                    resizeMode="contain"
                  />
                </View>

                <Text style={styles.modalItemName}>{selectedItem.name}</Text>

                <View style={styles.modalCoinContainer}>
                  <Text style={styles.modalCoinIcon}>🪙</Text>
                  <Text style={styles.modalCoinCost}>{selectedItem.cost}</Text>
                </View>

                <View style={styles.descriptionContainer}>
                  <Text style={styles.descriptionTitle}>Description</Text>
                  <Text style={styles.descriptionText}>{selectedItem.description}</Text>
                </View>

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
                    <Text style={styles.confirmButtonText}>
                      {currentCoins >= selectedItem.cost ? 'Purchase' : 'Not Enough Coins'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const PADDING = 15;
const SECTION_PADDING = 16;
const ITEM_SPACING = 10;
const ITEM_WIDTH = (SCREEN_WIDTH - (PADDING * 2) - (SECTION_PADDING * 2) - ITEM_SPACING) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#C8E6C9',
    shadowColor: '#43A047',
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
    color: '#2E7D32',
  },
  coinBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F8E9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#66BB6A',
  },
  coinIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  coinBalanceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 30,
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#43A047',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#C8E6C9',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 15,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  shopItem: {
    width: ITEM_WIDTH,
    backgroundColor: '#F1F8E9',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#C8E6C9',
    shadowColor: '#43A047',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#C8E6C9',
    padding: 8,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemDetails: {
    width: '100%',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 8,
  },
  coinContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#66BB6A',
  },
  coinCost: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#43A047',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#C8E6C9',
  },
  modalImageContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#F1F8E9',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#66BB6A',
    padding: 12,
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalItemName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalCoinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F8E9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#66BB6A',
  },
  modalCoinIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  modalCoinCost: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  descriptionContainer: {
    width: '100%',
    backgroundColor: '#F1F8E9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: '#C8E6C9',
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#66BB6A',
    lineHeight: 20,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#43A047',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#C8E6C9',
  },
  confirmButton: {
    backgroundColor: '#43A047',
    borderWidth: 2,
    borderColor: '#43A047',
  },
  disabledButton: {
    backgroundColor: '#C8E6C9',
    borderWidth: 2,
    borderColor: '#C8E6C9',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#66BB6A',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});