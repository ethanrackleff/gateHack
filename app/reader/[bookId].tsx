import ControlOverlay from '@/components/control-overlay';
import Footer from '@/components/footer';
import GenericPopup from '@/components/generic-popup';
import OptionsMenu from '@/components/options-menu';
import Summary from '@/components/summary';
import SummaryLoading from '@/components/summary-loading';
import TopBar from '@/components/top-bar';
import { getBookById } from '@/src/data/booksIndex';
import {
  calculateMaxSummaryLength,
  getSummary
} from '@/src/services/aiSummaries';
import {
  generateBookLayout,
  getPageByNumber,
  getPageText,
  type BookLayout,
  type LayoutConfig
} from '@/src/services/pagination';
import { getReadingState, saveReadingState } from '@/src/services/storage';
import { Reader, useReader } from "@epubjs-react-native/core";
import { useFileSystem } from "@epubjs-react-native/expo-file-system";
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ReaderProvider } from "@epubjs-react-native/core";
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import AppText from '@/components/app-text';
  const { width, height } = Dimensions.get('window');

  export default function ReaderScreen() {
    const { bookId } = useLocalSearchParams<{ bookId: string }>();
    const book = getBookById(bookId);

    const [bookLayout, setBookLayout] = useState<BookLayout | null>(null);
    const [currentPageNum, setCurrentPageNum] = useState(1);
    const [fontSize, setFontSize] = useState(20);
    const [lineHeight] = useState(1.5);
    const [isLoading, setIsLoading] = useState(true);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [isSummaryVisible, setIsSummaryVisible] = useState(true);

    const [stateLocation, setStateLocation] = useState<any | null>(null);
    // may not be necessary
    // const [locationTotal, setLocationTotal] = useState<number | null>(null);
    const [isReady, setIsReady] = useState<boolean>(false);

    const [currentSummary, setCurrentSummary] = useState<string>('');
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);


    const { goPrevious, goNext, currentLocation, goToLocation, totalLocations } = useReader();

    const { injectJavascript } = useReader();

    const path = "../../epub_tools/alice_locations.json";

    useEffect(() => {
      if (currentLocation) {
        setStateLocation(currentLocation);
        // e.g. currentLocatidn.start.cfi, currentLocation.start.location, etc.
        // console.log("location via hook:", currentLocation);
      }
    }, [currentLocation]);
  
    // Generate layout when book loads or settings change
    useEffect(() => {
      if (!book) return;

      const generateLayout = async () => {
        setIsLoading(true);

        const config: LayoutConfig = {
          screenHeight: height - 140,
          screenWidth: width - 40,
          fontSize,
          lineHeight,
          marginTop: 20,
          marginBottom: 20,
          paragraphSpacing: 12,
        };

        const layout = await generateBookLayout(book, config);
        setBookLayout(layout);
        setIsLoading(false);

        };

      generateLayout();

    }, [book, fontSize]);

    // Generate summary when book layout is ready
  useEffect(() => {
    if (!currentLocation) {
      console.log("no location yet")
      return
    }

    const generateSummary = async () => {
      setIsLoadingSummary(true);

      // do not attempt to show summary if there is no reason to

      // Calculate max summary length based on screen size
      const maxLength = calculateMaxSummaryLength(
        width - 40,  // screenWidth minus padding
        height - 140, // screenHeight minus header/footer
        fontSize,
        lineHeight
      );

      const summary = await getSummary(path, currentLocation.start.index); 

      console.log('=== SUMMARY GENERATED ===');
      console.log('Current Page:', currentPageNum);
      console.log('Summary:', summary);
      console.log('Summary Length:', summary ? summary.length : -1);
      console.log('========================');

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

    const restorePosition = async () => {
      const savedState = await getReadingState(bookId);

      if (savedState) {
        console.log('Restoring reading position:',
  savedState.currentPage);
        setCurrentPageNum(savedState.currentPage);
      } else {
        console.log('No saved position, starting from page 1');
      }
    };

    restorePosition();
  }, [bookId]);

   // Save reading position whenever page changes
  useEffect(() => {
    if (!bookLayout || !book) return;

    const savePosition = async () => {
      await saveReadingState(bookId, {
        bookId,
        currentPage: currentPageNum,
        totalPages: bookLayout.pages.length,
        lastRead: Date.now(),
      });
      console.log('Saved reading position: page',
  currentPageNum);
    };

    savePosition();
  }, [currentPageNum, bookLayout, bookId]);

    if (!book) {
      return (
        <View style={styles.container}>
          <Text>Book not found</Text>
        </View>
      );
    }

    if (isLoading || !bookLayout) {
      return (
        <View style={styles.container}>
          <Text>Loading...</Text>
        </View>
      );
    }

    const currentPage = getPageByNumber(bookLayout, currentPageNum);
    const pageText = getPageText(bookLayout, currentPageNum);

    function goBack() {
      router.back()
    }

    function increaseFontSize() {
      setFontSize(Math.min(24, fontSize + 2))
    }

    function decreaseFontSize() {
      setFontSize(Math.max(12, fontSize - 2))
    }

    function handleLocationChange(loc: any) {
      if (loc) {
        setStateLocation(loc)
      }
      console.log(stateLocation)
      if (!isReady) {
        setIsReady(true)
      }
    }
   

    return (
      <View style={styles.container}>

        <GenericPopup
          visible={isSummaryVisible}
          onRequestClose={() => {setIsSummaryVisible(false)}}
        >
          {(currentSummary !== "") ? (
            <Summary summary={currentSummary}/>
          ) : (
            <SummaryLoading />
          )}
          

        </GenericPopup>

        <GenericPopup 
          visible={isMenuVisible} 
          onRequestClose={() => {setIsMenuVisible(false)}}
        >
          <OptionsMenu goBack={goBack} currentLocation={stateLocation} setCurrentLocation={setStateLocation} goToLocation={goToLocation} totalLocations={totalLocations}/>
        </GenericPopup>

        { (isReady) ? (
          <TopBar currentLocation={stateLocation} totalLocations={totalLocations}/>
        ) : (
          <AppText>Loading...</AppText>
        )
        }

        <View style={styles.epubContainer}>
          <Reader
            src="https://github.com/IDPF/epub3-samples/releases/download/20230704/accessible_epub_3.epub"
            width={width}
            height={height}
            flow="paginated"
            fileSystem={useFileSystem}      // ✅ pass the hook, don’t call it
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

        <Footer/>

        <ControlOverlay activateMenu={() => setIsMenuVisible(true)} goPrevious={goPrevious} goNext={goNext}/>
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    epubContainer: {
      flex: 1,
      backgroundColor: '#fdd',
    },
  });
