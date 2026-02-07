import { BlurView } from "expo-blur";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ImageBackground,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import DataList, { DataItem } from "@/components/DataList";

//import DataList from "@/app/components/DataList";

import { getEvents } from "@/firebase/database";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const SUSTAINABILITY_ITEMS = [
  {
    fact: "If everyone switched to LED bulbs, lighting energy use could drop by about 50%.",
    more: "LEDs last longer, reduce electricity demand, and lower carbon emissions from power plants.",
    cta: "Switch one frequently used bulb at home to LED this week.",
    link: "https://www.energy.gov/energysaver/led-lighting",
  },
  {
    fact: "Roughly one-third of all food produced globally is wasted.",
    more: "Food waste means wasted water, land, energy, and transportation emissions.",
    cta: "Plan meals or freeze leftovers to cut waste.",
    link: "https://www.fao.org/food-loss-and-food-waste/en/",
  },
  {
    fact: "Recycling aluminum saves up to 95% of the energy needed to make new aluminum.",
    more: "Aluminum can be recycled almost indefinitely without losing quality.",
    cta: "Rinse and recycle cans instead of trashing them.",
    link: "https://www.epa.gov/recycle",
  },
  {
    fact: "Transportation is one of the largest sources of CO₂ emissions.",
    more: "Short car trips have disproportionately high emissions due to cold starts.",
    cta: "Try walking, biking, or combining errands into one trip.",
    link: "https://www.epa.gov/greenvehicles",
  },
  {
    fact: "A reusable water bottle can replace hundreds of plastic bottles each year.",
    more: "Plastic production relies on fossil fuels and contributes to ocean pollution.",
    cta: "Carry a reusable bottle when leaving home.",
    link: "https://www.nationalgeographic.com/environment/article/plastic-pollution",
  },
  {
    fact: "Producing beef typically emits far more greenhouse gases than plant-based foods.",
    more: "Livestock emissions include methane, which is much more potent than CO₂ in the short term.",
    cta: "Try one plant-based meal this week.",
    link: "https://ourworldindata.org/food-choice-vs-eating-local",
  },
  {
    fact: "Standby power ('phantom load') can account for 5–10% of home electricity use.",
    more: "Devices like TVs, consoles, and chargers draw power even when not actively used.",
    cta: "Use a power strip to switch off multiple devices at once.",
    link: "https://www.energy.gov/energysaver/reducing-phantom-loads",
  },
];

// Leaf SVG component
const LeafIcon = ({ size = 40 }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: size, lineHeight: size }}>🍃</Text>
  </View>
);

export default function HomeScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [innerScrollEnabled, setInnerScrollEnabled] = useState(false);

  const [factIndex, setFactIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [activities, setActivities] = useState<DataItem[]>([]);

  const OUTER_SCROLL_THRESHOLD = SCREEN_HEIGHT * 0.7;
  const backgroundImageSrc = "@/assets/images/tree-placeholder.png";

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const events = await getEvents();
        setActivities(events as DataItem[]);
      } catch (error) {
        console.error("Error fetching activities:", error);
      }
    };

    fetchActivities();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % SUSTAINABILITY_ITEMS.length);
      setVisible(true);
      setExpanded(false);
      setMinimized(false);
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const listenerId = scrollY.addListener(({ value }) => {
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

  const handleMinimize = () => {
    setMinimized(true);
    setExpanded(false);
  };

  const handleRestore = () => {
    setMinimized(false);
  };

  const item = SUSTAINABILITY_ITEMS[factIndex];

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require(backgroundImageSrc)}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
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

      {visible && !minimized && (
        <View style={styles.factContainer}>
          <Pressable
            style={[styles.factBubble, expanded && styles.factBubbleExpanded]}
            onPress={() => setExpanded((e) => !e)}
          >
            <View style={styles.factHeader}>
              <Text style={styles.factTitle}>🌱 Eco Tip</Text>
              <Pressable 
                onPress={handleMinimize}
                style={styles.minimizeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.minimizeIcon}>−</Text>
              </Pressable>
            </View>
            <Text style={styles.factText}>{item.fact}</Text>

            {expanded && (
              <>
                <Text style={styles.factMore}>{item.more}</Text>
                <Text style={styles.factCTA}>Try this: {item.cta}</Text>
                <Pressable onPress={() => Linking.openURL(item.link)}>
                  <Text style={styles.factLink}>Learn more</Text>
                </Pressable>
              </>
            )}
          </Pressable>
        </View>
      )}

      {visible && minimized && (
        <Pressable 
          style={styles.leafContainer}
          onPress={handleRestore}
        >
          <View style={styles.leafBubble}>
            <LeafIcon size={32} />
          </View>
        </Pressable>
      )}

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        bounces={true}
      >
        <View style={styles.windowContainer}>
          <View style={styles.windowTop}>
            <View style={styles.scrollIndicator} />
            <View style={styles.stickyHeader}>
              <Text style={styles.title}>Streak Counter: 1=9</Text>
            </View>
          </View>

          <View style={styles.window}>
            <ScrollView
              style={styles.innerScrollView}
              showsVerticalScrollIndicator={true}
              bounces={true}
              scrollEnabled={true}
              nestedScrollEnabled={innerScrollEnabled}
            >
              <Text style={styles.content}>Your Activity History</Text>
              <DataList data={activities} />
            </ScrollView>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundImage: { position: "absolute", width: "100%", height: "100%" },
  blurContainer: { ...StyleSheet.absoluteFillObject },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingTop: SCREEN_HEIGHT * 0.8,
    paddingBottom: SCREEN_HEIGHT * 0.15,
    paddingHorizontal: "5%",
  },
  windowContainer: { maxHeight: SCREEN_HEIGHT * 0.7 },
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
  innerScrollView: { maxHeight: "90%", flex: 1 },
  scrollIndicator: {
    width: 40,
    height: 5,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 2.5,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  stickyHeader: { backgroundColor: "rgba(255, 255, 255, 0.95)", paddingBottom: 8 },
  title: { fontSize: 32, fontWeight: "bold" },
  content: { fontSize: 16, color: "#666", marginBottom: 20 },

  factContainer: {
    position: "absolute",
    top: 70,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  factBubble: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  factBubbleExpanded: {
    paddingBottom: 18,
  },
  factHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  factTitle: { 
    color: "#1B5E20", 
    fontWeight: "700",
  },
  minimizeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(27, 94, 32, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  minimizeIcon: {
    color: '#1B5E20',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  factText: { color: "#2E7D32", fontWeight: "600" },
  factMore: { color: "#388E3C", marginTop: 6 },
  factCTA: { color: "#1B5E20", marginTop: 6, fontWeight: "600" },
  factLink: { color: "#43A047", marginTop: 6, textDecorationLine: "underline" },

  leafContainer: {
    position: 'absolute',
    top: 70,
    right: 16,
    zIndex: 20,
  },
  leafBubble: {
    backgroundColor: 'white',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});