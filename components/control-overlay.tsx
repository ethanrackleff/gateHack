import { StyleSheet, Text, View, Pressable } from "react-native"


export type ControlOverlayProps = {
  activateMenu: any,
  goPrevious: any,
  goNext: any,
}

export default function ControlOverlay({
  activateMenu,
  goPrevious,
  goNext
}: ControlOverlayProps) {

  const styles = StyleSheet.create({
    mainContainer: {
      ...StyleSheet.absoluteFillObject,
      width: "100%",
      height: "100%",
    },
    topArea: {
      height: 76,
      width: "100%",
    },
    midArea: {
      flex: 1,
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between"
    },
    leftArea: {
      height: "100%",
      width: "20%"
    },
    rightArea: {
      height: "100%",
      width: "20%"
    },
  });



  return (
    <View style={styles.mainContainer} pointerEvents="box-none">
      <Pressable style={styles.topArea} onPress={activateMenu}></Pressable>
      <View style={styles.midArea}>
        <Pressable style={styles.leftArea} onPress={goPrevious}></Pressable>
        <Pressable style={styles.rightArea} onPress={goNext}></Pressable>
      </View>
    </View>
  );


}
