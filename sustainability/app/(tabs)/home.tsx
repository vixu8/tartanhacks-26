import { View, Text, StyleSheet, Animated, Dimensions, ImageBackground } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRef } from 'react';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <ImageBackground
        source={require('@/assets/images/tree-placeholder.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Animated Blur Overlay */}
        <Animated.View style={[styles.blurContainer, { opacity: scrollY.interpolate({
          inputRange: [0, SCREEN_HEIGHT * 0.8],
          outputRange: [0, .8],
          extrapolate: 'clamp',
        })}]}>
          <BlurView intensity={100} style={StyleSheet.absoluteFill} />
        </Animated.View>
      </ImageBackground>

      {/* Scrollable Foreground Window */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        contentOffset={{ x: 0, y: 0 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.window}>
          <Text style={styles.title}>Home</Text>
          <Text style={styles.content}>Scroll to explore...</Text>

          {/* Add placeholder content to make scrolling visible */}
          {[...Array(20)].map((_, index) => (
            <View key={index} style={styles.contentBlock}>
              <Text style={styles.contentText}>Content Block {index + 1}</Text>
            </View>
          ))}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: SCREEN_HEIGHT * 0.85,
    paddingHorizontal: '5%',
  },
  window: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: SCREEN_HEIGHT * 1.5, // Make it scrollable
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  content: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  contentBlock: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 12,
  },
  contentText: {
    fontSize: 16,
    color: '#333',
  },
});
