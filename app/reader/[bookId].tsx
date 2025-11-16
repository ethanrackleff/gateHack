 import { getBookById } from '@/src/data/booksIndex';
import {
  calculateMaxSummaryLength,
  generateSummaryForCurrentPosition
} from '@/src/services/aiSummaries';
import {
  generateBookLayout,
  getPageByNumber,
  getPageText,
  type BookLayout,
  type LayoutConfig
} from '@/src/services/pagination';
import { getReadingState, saveReadingState } from '@/src/services/storage';
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

    const [currentSummary, setCurrentSummary] = useState<string>('');
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);

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
    if (!bookLayout || !book || isLoading)  {
      console.log('Returning early');
      return;
    }

    const generateSummary = async () => {
      setIsLoadingSummary(true);

      const currentPage = getPageByNumber(bookLayout, currentPageNum);
      if (!currentPage) {
        setIsLoadingSummary(false);
        return;
      }

      // Calculate max summary length based on screen size
      const maxLength = calculateMaxSummaryLength(
        width - 40,  // screenWidth minus padding
        height - 140, // screenHeight minus header/footer
        fontSize,
        lineHeight
      );

      const summary = await generateSummaryForCurrentPosition(
        book,
        bookLayout,
        currentPage,
        maxLength
      );

      console.log('=== SUMMARY GENERATED ===');
      console.log('Current Page:', currentPageNum);
      console.log('Summary:', summary);
      console.log('Summary Length:', summary.length);
      console.log('========================');

      setCurrentSummary(summary);
      setIsLoadingSummary(false);

      setCurrentSummary(summary);
      setIsLoadingSummary(false);
    };

    generateSummary();
  }, [bookLayout]); // Regenerate when page changes

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

    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </Pressable>
          <Text style={styles.chapterTitle}>{currentPage?.chapterTitle}</Text>
        </View>

        {/* Reading Area */}
        <View style={styles.contentArea}>
          <Text style={[styles.content, { fontSize, lineHeight: fontSize * lineHeight }]}>
            {pageText}
          </Text>
        </View>

        {/* Footer Controls */}
        <View style={styles.footer}>
          <Pressable
            style={styles.navButton}
            onPress={() => setCurrentPageNum(Math.max(1, currentPageNum - 1))}
            disabled={currentPageNum === 1}
          >
            <Text style={[styles.navButtonText, currentPageNum === 1 && styles.disabled]}>
              Previous
            </Text>
          </Pressable>

          <Text style={styles.pageNumber}>
            Page {currentPageNum} / {bookLayout.pages.length}
          </Text>

          <Pressable
            style={styles.navButton}
            onPress={() => setCurrentPageNum(Math.min(bookLayout.pages.length, currentPageNum +
   1))}
            disabled={currentPageNum === bookLayout.pages.length}
          >
            <Text style={[styles.navButtonText, currentPageNum === bookLayout.pages.length && 
  styles.disabled]}>
              Next
            </Text>
          </Pressable>
        </View>

        {/* Font Size Controls */}
        <View style={styles.controls}>
          <Text style={styles.controlLabel}>Font: {fontSize}px</Text>
          <Pressable 
            style={styles.controlButton}
            onPress={() => setFontSize(Math.max(12, fontSize - 2))}
          >
            <Text style={styles.controlButtonText}>A-</Text>
          </Pressable>
          <Pressable 
            style={styles.controlButton}
            onPress={() => setFontSize(Math.min(24, fontSize + 2))}
          >
            <Text style={styles.controlButtonText}>A+</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    header: {
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
    },
    backButton: {
      fontSize: 16,
      color: '#007AFF',
      marginBottom: 8,
    },
    chapterTitle: {
      fontSize: 14,
      color: '#666',
    },
    contentArea: {
      flex: 1,
      paddingHorizontal: 20,
      paddingVertical: 20,
      justifyContent: 'flex-start',
    },
    content: {
      textAlign: 'left',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderTopWidth: 1,
      borderTopColor: '#e0e0e0',
    },
    navButton: {
      padding: 10,
    },
    navButtonText: {
      fontSize: 16,
      color: '#007AFF',
    },
    disabled: {
      color: '#ccc',
    },
    pageNumber: {
      fontSize: 14,
      color: '#666',
    },
    controls: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 15,
      paddingBottom: 20,
    },
    controlLabel: {
      fontSize: 14,
      color: '#666',
    },
    controlButton: {
      paddingHorizontal: 15,
      paddingVertical: 8,
      backgroundColor: '#f0f0f0',
      borderRadius: 6,
    },
    controlButtonText: {
      fontSize: 18,
      color: '#007AFF',
    },
  });
