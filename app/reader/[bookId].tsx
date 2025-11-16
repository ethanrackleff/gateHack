import AppText from "@/components/app-text";
import ControlOverlay from "@/components/control-overlay";
import Footer from "@/components/footer";
import GenericPopup from "@/components/generic-popup";
import OptionsMenu from "@/components/options-menu";
import Summary from "@/components/summary";
import SummaryLoading from "@/components/summary-loading";
import TopBar from "@/components/top-bar";
import { getBookById } from "@/src/data/booksIndex";
import {
  getSummary
} from "@/src/services/aiSummaries";
import { getReadingState, saveReadingState } from "@/src/services/storage";
import { Location, Reader, useReader } from "@epubjs-react-native/core";
import { useFileSystem } from "@epubjs-react-native/expo-file-system";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
const { width, height } = Dimensions.get("window");

export default function ReaderScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const book = getBookById(bookId);

  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isSummaryVisible, setIsSummaryVisible] = useState(true);

  const [locationIndex, setLocationIndex] = useState<any | null>(null);
  const [currentCfi, setCurrentCfi] = useState<Location | null>(null);
  
  const [isReady, setIsReady] = useState<boolean>(false);

  const [currentSummary, setCurrentSummary] = useState<string>("");
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const { goPrevious, changeFontSize, goNext, currentLocation, goToLocation, totalLocations } =
    useReader();

  const path = "../../epub_tools/alice_locations.json";

  useEffect(() => {
    changeFontSize("30px");
    
  }, [isReady])

  // Generate summary when book layout is ready
  useEffect(() => {
    if (!currentLocation) {
      console.log("no location yet");
      return;
    }

    const generateSummary = async () => {
      setIsLoadingSummary(true);

      // do not attempt to show summary if there is no reason to

      // Calculate max summary length based on screen size
      const summary = await getSummary(path, currentLocation.start.index);

      console.log("=== SUMMARY GENERATED ===");
      console.log("Current Location:", locationIndex);
      console.log("Summary:", summary);
      console.log("Summary Length:", summary ? summary.length : -1);
      console.log("========================");

      setCurrentSummary(summary ? summary : "no summary");
      setIsLoadingSummary(false);

      setCurrentSummary(summary ? summary : "no summary");
      setIsLoadingSummary(false);
    };

    generateSummary();
    // TODO: uncomment ts
  }, []); // Regenerate when page changes

  // Restore last reading position when book loads
  useEffect(() => {
    if (!book) return;
    if (!bookId) return;
    if (!isReady) return;

    const restorePosition = async () => {
      const savedState = await getReadingState(bookId);

      if (savedState) {
        console.log("Restoring reading position:", savedState.currentPage);
        setLocationIndex(savedState.currentPage.start.location);
        console.log("going to position of currentCfi")
        console.log(savedState.currentPage)
        goToLocation(savedState.currentPage.start.cfi);
      } else {
        console.log("No saved position, starting from page 1");
      }
    };

    restorePosition();
  }, [book, bookId, isReady]);

  // Save reading position whenever page changes
  useEffect(() => {
    if (!isReady) return;

    const savePosition = async () => {
      console.log("saving reading position, currentcfi:")
      console.log(currentCfi)
      // weird edge cases on load
      if (locationIndex < 1) {
        console.log("locatoin index not loaded yet, aborting save")
        return
      }
      // TODO: MAke sure the thing saves properly
      // if (currentCfi.)
      await saveReadingState(bookId, {
        bookId,
        currentPage: currentCfi,
        totalPages: totalLocations,
        lastRead: Date.now(),
      });
      console.log("Saved reading position: page", locationIndex);
    };

    savePosition();
  }, [currentCfi]);

  if (!book) {
    return (
      <View style={styles.container}>
        <Text>Book not found</Text>
      </View>
    );
  }

  function goBack() {
    setIsReady(false);
    router.back();
  }

  function handleLocationChange(
    _totalLocations: number,
    currentLocation: Location,
    _progress: number,
    _currentSection: any
  ) {
    if (currentLocation) {
      setCurrentCfi(currentLocation)
      if (locationIndex > 3 && currentLocation?.start?.location < 1) {
        console.log("must be some weird shit")
      } else {
        setLocationIndex(currentLocation.start.location)
      }
    }
    // console.log(stateLocation)
    if (!isReady) {
      setIsReady(true);
    }
  }

  return (
    <View style={styles.container}>
      <GenericPopup
        visible={isSummaryVisible}
        onRequestClose={() => {
          setIsSummaryVisible(false);
        }}
      >
        {currentSummary !== "" ? (
          <Summary summary={currentSummary} />
        ) : (
          <SummaryLoading />
        )}
      </GenericPopup>

      <GenericPopup
        visible={isMenuVisible}
        onRequestClose={() => {
          setIsMenuVisible(false);
        }}
      >
        <OptionsMenu
          goBack={goBack}
          locationIndex={locationIndex}
          setLocationIndex={setLocationIndex}
          goToLocation={goToLocation}
          totalLocations={totalLocations}
        />
      </GenericPopup>

      {isReady ? (
        <TopBar
          locationIndex={locationIndex}
          totalLocations={totalLocations}
        />
      ) : (
        <AppText>Loading...</AppText>
      )}

      <View style={styles.epubContainer}>
        <Reader
          // src="https://github.com/IDPF/epub3-samples/releases/download/20230704/accessible_epub_3.epub"
          //src="https://github.com/ethanrackleff/gateHack/raw/refs/heads/main/epub_tools/Alice-In-Wonderland.epub"
          src="https://raw.githubusercontent.com/ethanrackleff/gateHack/main/epub_tools/alice-images-font.epub"
          width={width}
          height={height}
          flow="paginated"
          fileSystem={useFileSystem} // ✅ pass the hook, don’t call it
          enableSwipe={false}
          waitForLocationsReady
          onReady={() => {
            console.log("Book loaded");
          }}
          onDisplayError={(error: unknown) => {
            console.log("Reader error", error);
          }}
          onLocationChange={handleLocationChange}
        />
      </View>

      <Footer locationIndex={locationIndex}/>

      <ControlOverlay
        activateMenu={() => setIsMenuVisible(true)}
        goPrevious={goPrevious}
        goNext={goNext}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  epubContainer: {
    flex: 1,
    backgroundColor: "#fdd",
  },
});
