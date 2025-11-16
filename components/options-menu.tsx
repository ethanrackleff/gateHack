import { Pressable, StyleSheet, Text, View } from "react-native"
import Slider from '@react-native-community/slider';

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
        <View>
          <Slider
            style={{ width: 300, height: 40 }}
            minimumValue={1}
            maximumValue={totalPages}
            step={1}
            value={currentPageNum}
            onValueChange={setCurrentPageNum}
            minimumTrackTintColor="#4a90e2"
            maximumTrackTintColor="#ddd"
            thumbTintColor="#4a90e2"
          />
        </View>
        {/* <View> */}
        {/*   <Slider */}
        {/*     style={{ width: 300, height: 40 }} */}
        {/*     minimumValue={Math.max(currentPageNum-3, 1)} */}
        {/*     maximumValue={Math.min(currentPageNum+3, totalPages)} */}
        {/*     step={1} */}
        {/*     value={currentPageNum} */}
        {/*     onValueChange={setCurrentPageNum} */}
        {/*     minimumTrackTintColor="#4a90e2" */}
        {/*     maximumTrackTintColor="#ddd" */}
        {/*     thumbTintColor="#4a90e2" */}
        {/*   /> */}
        {/* </View> */}
      </View>

    </View>
  );


}
