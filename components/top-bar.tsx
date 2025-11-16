import { Text, StyleSheet, View } from "react-native"
import AppText from "./app-text";
import { useEffect, useState } from "react";

export type TopBarProps = {
  currentLocation: any,
  totalLocations: number,
}

export default function TopBar({
  currentLocation,
  totalLocations
}: TopBarProps) {
    
  const [locationIndex, setLocationIndex] = useState<number | null>(null);

  useEffect(() => {
    const loc = currentLocation?.start?.location;
    if (typeof loc === "number") {

      setLocationIndex(loc);
    }
  }, [currentLocation]);

  // clamp progress between 0 and 1
  
  const progressPercent = locationIndex ? (locationIndex)/(totalLocations) : 0;
  const clamped = Math.min(Math.max(progressPercent, 0), 1);

  const styles = StyleSheet.create({
    container: {
      paddingTop: 48,
      paddingBottom: 16,
      backgroundColor: '#fff',
      paddingLeft: 16,
      paddingRight: 18,
      flexDirection: "row",
      alignItems: "center",
    },
    barText: {
      fontSize: 14,
      color: "#444",
      paddingLeft: 6, 
    },
    bar: {
      flexGrow: 1,
      height: 12,
      backgroundColor: '#ddd',
      borderWidth: 4,
      borderStyle: "solid",
      borderColor: "#222",
      overflow: 'hidden',   // ensures the fill stays inside the rounded bar
    },
    fill: {
      height: '100%',
      backgroundColor: '#222',
    }
  });



  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        <View style={[styles.fill, { width: `${clamped * 100}%` }]}>
        </View>
      </View>
      <AppText style={styles.barText}>{`${locationIndex}/${totalLocations}`}</AppText>
    </View>
  );


}
