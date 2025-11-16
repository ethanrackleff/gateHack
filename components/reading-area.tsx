import { StyleSheet, Text, View } from "react-native"

export type ReadingAreaProps = {
  pageText?: string;
  fontSize: number,
  lineHeight: number
}

export default function ReadingArea({
  pageText,
  fontSize,
  lineHeight
}: ReadingAreaProps) {

  const styles = StyleSheet.create({
    container: {
      padding: 12,
      flex: 1,
      backgroundColor: '#ddd',
    },
    content: {
      textAlign: 'left',
      fontSize: fontSize,
      lineHeight: lineHeight * fontSize,
    },
  });



  return (
    <View style={styles.container}>
      <Text style={styles.content}>
        {pageText}

      </Text>

    </View>
  );


}
