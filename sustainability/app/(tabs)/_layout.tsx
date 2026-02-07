import { Ionicons } from '@expo/vector-icons';

import { Tabs, useGlobalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import LogEventModal from '../../components2/LogEventModal';






const router = useRouter();

function CustomTabBar({ state, descriptors, navigation, onPlusPress }: any) {
  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? options.title ?? route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Icon names for each tab
          let iconName: any = 'home';
          if (route.name === 'home') iconName = 'home';
          else if (route.name === 'shop') iconName = 'cart';
          else if (route.name === 'map') iconName = 'map';
          else if (route.name === 'profile') iconName = 'person';

          // Skip rendering the middle placeholder for the plus button
          if (index === 2) {
            return <View key={route.key} style={styles.tabItem} />;
          }

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tabItem}
            >
              <Ionicons
                name={iconName}
                size={24}
                color={isFocused ? '#22c55e' : '#666'}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Centered Plus Button */}
      <TouchableOpacity style={styles.plusButton} onPress={onPlusPress}>
        <Ionicons name="add" size={36} color="white" />
      </TouchableOpacity>
    </View>
  );
}

export default function TabLayout() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const params = useGlobalSearchParams<{ log?: string; preset?: string }>();

  useEffect(() => {
    // when route has ?log=1, open the modal
    if (params.log === "1") {
      setIsModalOpen(true);
    }
  }, [params.log]);

  return (
    <>
      <Tabs
        tabBar={(props) => (
          <CustomTabBar {...props} onPlusPress={
            () => {router.replace({ pathname: "/home", params: { log: "1" } });}} />
        )}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="home" />
        <Tabs.Screen name="shop" />
        <Tabs.Screen name="placeholder" options={{ href: null }} />
        <Tabs.Screen name="map" />
        <Tabs.Screen name="profile" />
      </Tabs>

      <LogEventModal
        visible={isModalOpen}
        presetId={params.preset}
        onClose={() => {
          setIsModalOpen(false);
          router.replace("/(tabs)/home"); // clears log param so it doesn't reopen
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'relative',
    backgroundColor: 'white',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
    marginBottom: 10,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusButton: {
    position: 'absolute',
    top: -25,
    left: '50%',
    marginLeft: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
