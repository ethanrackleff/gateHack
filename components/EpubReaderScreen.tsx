import React from "react";
import { Dimensions, View, StyleSheet } from "react-native";
import { Reader } from "@epubjs-react-native/core";
import { useFileSystem } from "@epubjs-react-native/expo-file-system";

const { width, height } = Dimensions.get("window");

export default function EpubReader() {
  return (
    <View style={styles.container}>
      <Reader
        src="https://github.com/IDPF/epub3-samples/releases/download/20230704/accessible_epub_3.epub"
        width={width}
        height={height}
        fileSystem={useFileSystem}      // ✅ pass the hook, don’t call it
        waitForLocationsReady
        onReady={() => {
          console.log("Book loaded");
        }}
        onDisplayError={(error: unknown) => {
          console.log("Reader error", error);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
