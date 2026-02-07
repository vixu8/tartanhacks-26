import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";

type Event = {
  id: string;
  title: string;
  description?: string;
  lat: number;
  lng: number;
  startsAt: string; // ISO
  endsAt: string;   // ISO
};

export default function MapScreen() {
  const pins: Event[] = useMemo(
    () => [
      { id: "1", title: "Event 1", description: "boomshakalaka", lat: 40.4433, lng: -79.9436,  startsAt: "2026-02-06T18:30:00-05:00", endsAt: "2026-02-10T18:30:00-05:00"},
      { id: "2", title: "Event 2", description: "sdiybt", lat: 40.4444, lng: -79.9418, startsAt: "2026-02-06T18:30:00-05:00", endsAt: "2026-02-10T18:30:00-05:00" },
    ],
    []
  );

  const [selected, setSelected] = useState<Event | null>(null);

  const now = Date.now();
  const visiblePins = useMemo(
    () => pins.filter(e => new Date(e.endsAt).getTime() > now),
    [pins, now]
  );

  const initialRegion: Region = {
    latitude: 40.4433,
    longitude: -79.9436,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={initialRegion}> 
        {visiblePins.map((p) => (
          <Marker
          key={p.id}
          coordinate={{ latitude: p.lat, longitude: p.lng }}
          onPress={() => setSelected(p)}
        >
          <View style={styles.pinWithLabel}>
          <View style={styles.labelBubble}>
          <Text style={styles.labelText}>{p.title}</Text>
          </View>
          </View> 
        </Marker>
        ))}
      </MapView>

      {/* simple “bottom sheet” */}
      {selected && (
        <View style={styles.sheet}>
          <Pressable onPress={() => setSelected(null)} style={styles.close} hitSlop={12}>
      <Text style={{ fontSize: 18 }}>✕</Text>
    </Pressable>
          <Text style={styles.sheetTitle}>{selected.title}</Text>
          {!!selected.description && <Text style={styles.sheetBody}>{selected.description}</Text>}

          <Pressable style={styles.button} onPress={() => alert(`Do something with ${selected.id}`)}>
            <Text style={styles.buttonText}>Action</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  sheet: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "white",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  sheetTitle: { fontSize: 16, fontWeight: "700" },
  sheetBody: { marginTop: 4, opacity: 0.8 },
  button: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "black",
  },
  buttonText: { color: "white", fontWeight: "600" },
  pinText: {
    color: "white",
    fontWeight: "700",
    fontSize: 12,
  },
  close: {
    position: "absolute",
    top: 10,
    right: 12,
    padding: 6,
    zIndex: 10,
  },
  pinWithLabel: {
    alignItems: "flex-start",
  },
  
  labelBubble: {
    backgroundColor: "white",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginLeft: 18, // pushes bubble to right of pin
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 10,
  },
  
  labelText: {
    fontSize: 12,
    fontWeight: "600",
  },
  
});


