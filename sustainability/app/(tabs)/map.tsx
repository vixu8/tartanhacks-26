import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Callout, Marker, Region } from "react-native-maps";

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
      <MapView style={styles.map} initialRegion={initialRegion} onPress={() => setSelected(null)}>
        {visiblePins.map((p) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.lat, longitude: p.lng }}
            title={p.title}
            description={p.description}
            onPress={() => setSelected(p)}
          >
            <Callout onPress={() => setSelected(p)}>
              <View style={{ maxWidth: 220 }}>
                <Text style={{ fontWeight: "600" }}>{p.title}</Text>
                {!!p.description && <Text>{p.description}</Text>}
                <Text style={{ marginTop: 6, opacity: 0.7 }}>Tap for details</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* simple “bottom sheet” */}
      {selected && (
        <View style={styles.sheet}>
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
});


