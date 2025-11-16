import ControlOverlay from '@/components/control-overlay';
import Footer from '@/components/footer';
import GenericPopup from '@/components/generic-popup';
import OptionsMenu from '@/components/options-menu';
import ReadingArea from '@/components/reading-area';
import TopBar from '@/components/top-bar';
import { getBookById } from '@/src/data/booksIndex';
import {
    generateBookLayout,
    getPageByNumber,
    getPageText,
    type BookLayout,
    type LayoutConfig
} from '@/src/services/pagination';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';

  const { width, height } = Dimensions.get('window');

  export default function ReaderScreen() {
    const { bookId } = useLocalSearchParams<{ bookId: string }>();
    const book = getBookById(bookId);

    const [bookLayout, setBookLayout] = useState<BookLayout | null>(null);
    const [currentPageNum, setCurrentPageNum] = useState(1);
    const [fontSize, setFontSize] = useState(16);
    const [lineHeight] = useState(1.5);
    const [isLoading, setIsLoading] = useState(true);
    const [isMenuVisible, setIsMenuVisible] = useState(false);

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


    function goPrevPage() {
      setCurrentPageNum(Math.max(1, currentPageNum - 1))
    }

    function goNextPage() {
      if (!bookLayout) return
      setCurrentPageNum(Math.min(bookLayout.pages.length, currentPageNum + 1))
    }

    function goBack() {
      router.back()
    }

    function increaseFontSize() {
      setFontSize(Math.min(24, fontSize + 2))
    }

    function decreaseFontSize() {
      setFontSize(Math.max(12, fontSize - 2))
    }
   

    return (
      <View style={styles.container}>

        <GenericPopup 
          visible={isMenuVisible} 
          onRequestClose={() => {setIsMenuVisible(false)}}
        >
          <OptionsMenu goBack={goBack} currentPageNum={currentPageNum} setCurrentPageNum={setCurrentPageNum} totalPages={bookLayout.pages.length}/>
        </GenericPopup>

        <TopBar pageNumber={currentPageNum} totalPages={bookLayout.pages.length}/>

        <ReadingArea pageText={pageText} fontSize={fontSize} lineHeight={lineHeight}/>

        <Footer/>

        <ControlOverlay goPrevPage={goPrevPage} goNextPage={goNextPage} activateMenu={() => setIsMenuVisible(true)}/>

      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
  });
