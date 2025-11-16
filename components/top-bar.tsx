import { Text, StyleSheet, View } from "react-native"

export type TopBarProps = {
  pageNumber: number,
  totalPages: number
}

export default function TopBar({
  pageNumber,
  totalPages
}: TopBarProps) {

  // clamp progress between 0 and 1
  const progress = (pageNumber-1)/(totalPages-1);
  const clamped = Math.min(Math.max(progress, 0), 1);

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
      fontSize: 12,
      color: "#444",
      paddingLeft: 6, 
    },
    bar: {
      flexGrow: 1,
      height: 12,
      backgroundColor: '#e0e0e0',
      borderRadius: 6,
      overflow: 'hidden',   // ensures the fill stays inside the rounded bar
    },
    fill: {
      height: '100%',
      backgroundColor: '#44ff44',
      borderRadius: 6
    }
  });



  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        <View style={[styles.fill, { width: `${clamped * 100}%` }]}>
        </View>
      </View>
      <Text style={styles.barText}>{`${pageNumber}/${totalPages}`}</Text>
    </View>
  );


}
