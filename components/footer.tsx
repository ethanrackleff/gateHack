import { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";

export type FooterProps = {
  locationIndex: number;
}
// Require images statically - React Native bundler needs this at build time
const bgs = [
  require("../assets/images/bg/bg1.png"),
  require("../assets/images/bg/bg1.png"),
  require("../assets/images/bg/bg1.png"),
  require("../assets/images/bg/bg1.png"),
  require("../assets/images/bg/bg1.png"),
  require("../assets/images/bg/bg1.png"),
  require("../assets/images/bg/bg1.png"),
  require("../assets/images/bg/bg1.png"),
  require("../assets/images/bg/bg1.png"),
  require("../assets/images/bg/bg1.png"),
]

/*const bgs = [
  require("../assets/images/bg/bg1.png"),
  require("../assets/images/bg/bg2.png"),
  require("../assets/images/bg/bg3.png"),
  require("../assets/images/bg/bg4.png"),
  require("../assets/images/bg/bg5.png"),
  require("../assets/images/bg/bg6.png"),
  require("../assets/images/bg/bg7.png"),
  require("../assets/images/bg/bg8.png"),
  require("../assets/images/bg/bg9.png"),
  require("../assets/images/bg/bg10.png"),
]*/


export default function Footer({
  locationIndex
}: FooterProps) {

  const [imageIndex, setImageIndex] = useState<number>(0)

  useEffect(() => {
    if (locationIndex === null) return
    const indexToChoose = Math.min(Math.floor(locationIndex / 10), 9)
    if (imageIndex !== indexToChoose) {
      setImageIndex(indexToChoose)
    }
  }, [locationIndex])

  const styles = StyleSheet.create({
    container: {
      height: "10%",
      backgroundColor: '#9b9',
    },
    image: {
      height: "100%",
      width: "100%"
    }
  });



  return (
    <View style={styles.container}>
      <Image style={styles.image} resizeMode="stretch" source={bgs[imageIndex]} />
    </View>
  );


}
