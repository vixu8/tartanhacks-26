import { Text, StyleSheet, TouchableOpacity } from "react-native";

interface DataRowProps {
  title: string;
  points: number;
  onPress?: () => void;
}

export default function DataRow({ title, points, onPress }: DataRowProps) {
  const isPositive = points >= 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.points, isPositive ? styles.positive : styles.negative]}>
        {isPositive ? "+" : ""}{points}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
    flex: 1,
  },
  points: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 12,
  },
  positive: {
    color: "#22c55e", // Green
  },
  negative: {
    color: "#ef4444", // Red
  },
});
