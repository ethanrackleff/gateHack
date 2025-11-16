import { Pressable, StyleSheet, Text, View } from "react-native"

export type OptionsMenuProps = {
  goBack: any,
  currentPageNum: number,
  setCurrentPageNum: any,
  totalPages: number,
}

export default function OptionsMenu({
  goBack,
  currentPageNum,
  setCurrentPageNum,
  totalPages
}: OptionsMenuProps) {

  const styles = StyleSheet.create({
    container: {
      backgroundColor: '#aaf',
    },
    topChunk: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center"
    },
    backButton: {
      width: 8,
      height: 8,
      backgroundColor: "#ff0"
    },
    middleChunk: {
      height: 160,
      width: 300
    }
  });

  return (
    <View style={styles.container}>
      <View style={styles.topChunk}>
        <Pressable style={styles.backButton} onPress={goBack}>
        </Pressable>
        <Text>{`Page ${currentPageNum} of ${totalPages}`}</Text>
      </View>
      <View style={styles.middleChunk}>
        
      </View>
    </View>
  );


}
