import { useState, useEffect } from 'react';
import { addCoins } from '@/firebase/database';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native';

// Avatar options without background colors
const AVATAR_BASES = [
  { id: 1, seed: 'Whiskers' },
  { id: 2, seed: 'Bubbles' },
  { id: 3, seed: 'Sprinkles' },
  { id: 4, seed: 'Cuddles' },
  { id: 5, seed: 'Peaches' },
  { id: 6, seed: 'Mochi' },
  { id: 7, seed: 'Buttercup' },
  { id: 8, seed: 'Snowball' },
  { id: 9, seed: 'Cookie' },
  { id: 10, seed: 'Blossom' },
  { id: 11, seed: 'Sunny' },
  { id: 12, seed: 'Maple' },
];

// Background color options
const BACKGROUND_COLORS = [
  { id: 1, name: 'Mint', hex: 'c8e6c9' },
  { id: 2, name: 'Sage', hex: 'a5d6a7' },
  { id: 3, name: 'Forest', hex: '81c784' },
  { id: 4, name: 'Teal', hex: 'b2dfdb' },
  { id: 5, name: 'Seafoam', hex: '80cbc4' },
  { id: 6, name: 'Sky', hex: 'b3e5fc' },
  { id: 7, name: 'Lavender', hex: 'd1c4e9' },
  { id: 8, name: 'Peach', hex: 'ffccbc' },
  { id: 9, name: 'Lemon', hex: 'fff9c4' },
  { id: 10, name: 'Rose', hex: 'f8bbd0' },
];

// Generate avatar URL with background color
const getAvatarUrl = (seed: string, backgroundColor: string) => {
  return `https://api.dicebear.com/7.x/lorelei/png?seed=${seed}&backgroundColor=${backgroundColor}`;
};

export default function ProfileScreen() {
  const [selectedAvatarBase, setSelectedAvatarBase] = useState(AVATAR_BASES[0]);
  const [selectedBackgroundColor, setSelectedBackgroundColor] = useState(BACKGROUND_COLORS[0]);
  const [username, setUsername] = useState('Player123');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [activeTab, setActiveTab] = useState<'avatar' | 'friends' | 'leaderboard'>('avatar');
  
  // Generate current avatar URL
  const currentAvatarUrl = getAvatarUrl(selectedAvatarBase.seed, selectedBackgroundColor.hex);
  
  // Mock data - replace with real data from Firebase
  const [friends, setFriends] = useState([
    { id: '1', name: 'Alex', avatar: getAvatarUrl('Bubbles', 'a5d6a7'), points: 1250 },
    { id: '2', name: 'Sam', avatar: getAvatarUrl('Sprinkles', '81c784'), points: 980 },
    { id: '3', name: 'Jordan', avatar: getAvatarUrl('Cuddles', 'b2dfdb'), points: 850 },
  ]);
  
  const [currentUserPoints, setCurrentUserPoints] = useState(1100);

  // Combine current user with friends for leaderboard
  const leaderboard = [
    { id: 'me', name: username, avatar: currentAvatarUrl, points: currentUserPoints, isCurrentUser: true },
    ...friends
  ].sort((a, b) => b.points - a.points);

  const handleSaveUsername = () => {
    setIsEditingUsername(false);
    // TODO: Save to Firebase
  };

  const handleAddFriend = () => {
    // TODO: Implement friend request system
    alert('Friend request feature coming soon!');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: currentAvatarUrl }} 
            style={styles.avatarLarge}
            resizeMode="cover"
          />
        </View>
        
        {isEditingUsername ? (
          <View style={styles.usernameEdit}>
            <TextInput
              style={styles.usernameInput}
              value={username}
              onChangeText={setUsername}
              onSubmitEditing={handleSaveUsername}
              autoFocus
            />
            <TouchableOpacity onPress={handleSaveUsername} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setIsEditingUsername(true)}>
            <Text style={styles.username}>{username}</Text>
            <Text style={styles.editHint}>Tap to edit</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsLabel}>Points</Text>
          <Text style={styles.points}>{currentUserPoints}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'avatar' && styles.tabActive]}
          onPress={() => setActiveTab('avatar')}
        >
          <Text style={[styles.tabText, activeTab === 'avatar' && styles.tabTextActive]}>
            Avatar
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'friends' && styles.tabActive]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.tabTextActive]}>
            Friends ({friends.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'leaderboard' && styles.tabActive]}
          onPress={() => setActiveTab('leaderboard')}
        >
          <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.tabTextActive]}>
            Leaderboard
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'avatar' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Choose Your Avatar</Text>
            <View style={styles.avatarGrid}>
              {AVATAR_BASES.map((avatar) => (
                <TouchableOpacity
                  key={avatar.id}
                  style={[
                    styles.avatarOption,
                    selectedAvatarBase.id === avatar.id && styles.avatarOptionSelected
                  ]}
                  onPress={() => setSelectedAvatarBase(avatar)}
                  activeOpacity={0.7}
                >
                  <View style={styles.avatarImageWrapper}>
                    <Image 
                      source={{ uri: getAvatarUrl(avatar.seed, selectedBackgroundColor.hex) }} 
                      style={styles.avatarImage}
                      resizeMode="cover"
                    />
                  </View>
                  {selectedAvatarBase.id === avatar.id && (
                    <View style={styles.selectedBadge}>
                      <Text style={styles.selectedBadgeText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Choose Background Color</Text>
            <View style={styles.colorGrid}>
              {BACKGROUND_COLORS.map((color) => (
                <TouchableOpacity
                  key={color.id}
                  style={[
                    styles.colorOption,
                    { backgroundColor: `#${color.hex}` },
                    selectedBackgroundColor.id === color.id && styles.colorOptionSelected
                  ]}
                  onPress={() => setSelectedBackgroundColor(color)}
                  activeOpacity={0.7}
                >
                  {selectedBackgroundColor.id === color.id && (
                    <View style={styles.colorSelectedBadge}>
                      <Text style={styles.colorSelectedBadgeText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.previewSection}>
              <Text style={styles.previewTitle}>Preview</Text>
              <View style={styles.previewAvatarContainer}>
                <Image 
                  source={{ uri: currentAvatarUrl }} 
                  style={styles.previewAvatar}
                  resizeMode="cover"
                />
              </View>
            </View>
          </View>
        )}

        {activeTab === 'friends' && (
          <View style={styles.tabContent}>
            <TouchableOpacity style={styles.addFriendButton} onPress={handleAddFriend}>
              <Text style={styles.addFriendButtonText}>Add Friend</Text>
            </TouchableOpacity>
            
            {friends.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyState}>No friends yet. Add some!</Text>
              </View>
            ) : (
              friends.map((friend) => (
                <View key={friend.id} style={styles.friendCard}>
                  <View style={styles.friendAvatarWrapper}>
                    <Image 
                      source={{ uri: friend.avatar }} 
                      style={styles.friendAvatar}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{friend.name}</Text>
                    <Text style={styles.friendPoints}>{friend.points} points</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'leaderboard' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Top Players</Text>
            {leaderboard.map((player, index) => (
              <View 
                key={player.id} 
                style={[
                  styles.leaderboardCard,
                  player.isCurrentUser && styles.leaderboardCardHighlight
                ]}
              >
                <View style={styles.rankContainer}>
                  <View style={[
                    styles.rankBadge,
                    index === 0 && styles.rankBadgeGold,
                    index === 1 && styles.rankBadgeSilver,
                    index === 2 && styles.rankBadgeBronze,
                  ]}>
                    <Text style={[
                      styles.rank,
                      index < 3 && styles.rankTop3
                    ]}>#{index + 1}</Text>
                  </View>
                </View>
                
                <View style={styles.leaderboardAvatarWrapper}>
                  <Image 
                    source={{ uri: player.avatar }} 
                    style={styles.leaderboardAvatar}
                    resizeMode="cover"
                  />
                </View>
                
                <View style={styles.leaderboardInfo}>
                  <Text style={styles.leaderboardName}>
                    {player.name} {player.isCurrentUser && '(You)'}
                  </Text>
                  <Text style={styles.leaderboardPoints}>{player.points} points</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#C8E6C9',
  },
  avatarContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#F1F8E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#66BB6A',
  },
  avatarLarge: {
    width: '100%',
    height: '100%',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  editHint: {
    fontSize: 12,
    color: '#66BB6A',
    textAlign: 'center',
    marginTop: 4,
  },
  usernameEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  usernameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderBottomColor: '#43A047',
    paddingHorizontal: 8,
    minWidth: 150,
    textAlign: 'center',
    color: '#2E7D32',
  },
  saveButton: {
    backgroundColor: '#43A047',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#43A047',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  pointsContainer: {
    marginTop: 12,
    alignItems: 'center',
    backgroundColor: '#F1F8E9',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pointsLabel: {
    fontSize: 12,
    color: '#43A047',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  points: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#C8E6C9',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#43A047',
    backgroundColor: '#F1F8E9',
  },
  tabText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#43A047',
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 20,
    color: '#2E7D32',
    textAlign: 'center',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  avatarOption: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#C8E6C9',
    position: 'relative',
    shadowColor: '#43A047',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarOptionSelected: {
    borderColor: '#43A047',
    backgroundColor: '#F1F8E9',
    shadowOpacity: 0.3,
    transform: [{ scale: 1.05 }],
  },
  avatarImageWrapper: {
    width: '85%',
    aspectRatio: 1,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: '#E8F5E9',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  selectedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#43A047',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#C8E6C9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#43A047',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  colorOptionSelected: {
    borderColor: '#43A047',
    borderWidth: 4,
    shadowOpacity: 0.3,
    transform: [{ scale: 1.1 }],
  },
  colorSelectedBadge: {
    backgroundColor: '#FFFFFF',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorSelectedBadgeText: {
    color: '#43A047',
    fontSize: 14,
    fontWeight: 'bold',
  },
  previewSection: {
    marginTop: 30,
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 12,
  },
  previewAvatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#43A047',
    shadowColor: '#43A047',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  previewAvatar: {
    width: '100%',
    height: '100%',
  },
  addFriendButton: {
    backgroundColor: '#43A047',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#43A047',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addFriendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyStateContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyState: {
    textAlign: 'center',
    color: '#66BB6A',
    fontSize: 16,
  },
  friendCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#C8E6C9',
    shadowColor: '#43A047',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  friendAvatarWrapper: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    overflow: 'hidden',
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#66BB6A',
  },
  friendAvatar: {
    width: '100%',
    height: '100%',
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
  },
  friendPoints: {
    fontSize: 14,
    color: '#66BB6A',
    marginTop: 2,
    fontWeight: '600',
  },
  leaderboardCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#C8E6C9',
    shadowColor: '#43A047',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  leaderboardCardHighlight: {
    backgroundColor: '#F1F8E9',
    borderWidth: 3,
    borderColor: '#43A047',
    shadowOpacity: 0.3,
  },
  rankContainer: {
    width: 45,
    alignItems: 'center',
  },
  rankBadge: {
    backgroundColor: '#C8E6C9',
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankBadgeGold: {
    backgroundColor: '#FFD700',
  },
  rankBadgeSilver: {
    backgroundColor: '#C0C0C0',
  },
  rankBadgeBronze: {
    backgroundColor: '#CD7F32',
  },
  rank: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  rankTop3: {
    color: '#FFFFFF',
  },
  leaderboardAvatarWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: '#E8F5E9',
    marginHorizontal: 12,
    borderWidth: 2,
    borderColor: '#66BB6A',
  },
  leaderboardAvatar: {
    width: '100%',
    height: '100%',
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
  },
  leaderboardPoints: {
    fontSize: 14,
    color: '#66BB6A',
    marginTop: 2,
    fontWeight: '600',
  },
});