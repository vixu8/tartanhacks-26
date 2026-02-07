import { BlurView } from "expo-blur";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import DataList from "@/components/DataList";

//import DataList from "@/app/components/DataList";

import { sampleActivities } from "@/data/sampleActivities";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
// const OUTER_SCROLL_THRESHOLD = SCREEN_HEIGHT * 0.6; // Threshold when outer is maxed

export default function HomeScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [innerScrollEnabled, setInnerScrollEnabled] = useState(false);

  const OUTER_SCROLL_THRESHOLD = SCREEN_HEIGHT * 0.7; 

  const backgroundImageSrc = "@/assets/images/tree-placeholder.png"

useEffect(() => {
    const listenerId = scrollY.addListener(({ value }) => {
      // Enable inner scroll when outer scroll reaches threshold
      if (value >= OUTER_SCROLL_THRESHOLD && !innerScrollEnabled) {
        setInnerScrollEnabled(true);
      } else if (value < OUTER_SCROLL_THRESHOLD && innerScrollEnabled) {
        setInnerScrollEnabled(false);
      }
    });

    return () => {
      scrollY.removeListener(listenerId);
    };
  }, [scrollY, innerScrollEnabled]);

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <ImageBackground
        source={require(backgroundImageSrc)}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Animated Blur Overlay */}
        <Animated.View
          style={[
            styles.blurContainer,
            {
              opacity: scrollY.interpolate({
                inputRange: [0, SCREEN_HEIGHT * 0.8],
                outputRange: [0, 0.8],
                extrapolate: "clamp",
              }),
            },
          ]}
        >
          <BlurView intensity={100} style={StyleSheet.absoluteFill} />
        </Animated.View>
      </ImageBackground>

      {/* Scrollable Foreground Window */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        contentOffset={{ x: 0, y: 0 }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        bounces={true}
      >
        <View style={styles.windowContainer}>
          <View style={styles.windowTop}>
            {/* Scroll Indicator */}
            <View style={styles.scrollIndicator} />

            {/* Sticky Title */}
            <View style={styles.stickyHeader}>
              <Text style={styles.title}>Streak Counter: 1=9</Text>
            </View>
          </View>

          <View style={styles.window}>
            {/* Inner Scrollable Content */}
            <ScrollView
              style={styles.innerScrollView}
              showsVerticalScrollIndicator={true}
              bounces={true}
              scrollEnabled={true}
              nestedScrollEnabled={innerScrollEnabled}
            >
              <Text style={styles.content}>Your Activity History</Text>

              {/* Data List */}
              <DataList data={sampleActivities} />
            </ScrollView>
          </View>
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
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: SCREEN_HEIGHT * 0.8,
    paddingBottom: SCREEN_HEIGHT * .15,
    paddingHorizontal: "5%",
  },
  windowContainer: {
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  windowTop: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingTop: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  window: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 20,
    height: SCREEN_HEIGHT * 0.8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  innerScrollView: {
    maxHeight: "90%",
    flex: 1,
  },
  scrollIndicator: {
    width: 40,
    height: 5,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 2.5,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  stickyHeader: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
  content: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
});
