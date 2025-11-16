import { StyleSheet, Text, View } from "react-native"

export type FooterProps = {
}

export default function Footer({
}: FooterProps) {

  const styles = StyleSheet.create({
    container: {
      height: "10%",
      backgroundColor: '#9b9',
    },
  });



  return (
    <View style={styles.container}>
    </View>
  );


}
