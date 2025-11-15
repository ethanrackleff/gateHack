  /**
   * @typedef {import('../models/books.js').Book} Book
   * @typedef {import('../models/books.js').Chapter} Chapter
   */

  /**
   * Layout configuration (font, margins, screen size)
   */
  export interface LayoutConfig {
    screenHeight: number;
    screenWidth: number;
    fontSize: number;
    lineHeight: number;
    marginTop: number;
    marginBottom: number;
    paragraphSpacing: number;
    contentHeight?: number;
  }

  /**
   * Page is a character range in continuous text
   */
  export interface Page {
    pageNumber: number;
    startCharIndex: number;
    endCharIndex: number;
    chapterId: string;
    chapterTitle: string;
  }

  /**
   * Complete book layout after rendering
   */
  export interface BookLayout {
    pages: Page[];
    fullText: string;
    totalHeight: number;
    contentHeight: number;
  }

  /**
   * Flatten book into continuous text with chapter markers
   */
  export function createContinuousText(book: any): {
    text: string;
    chapterPositions: Array<{ startIdx: number; chapterId: string; title: string }>
  } {
    let text = '';
    const chapterPositions: Array<{ startIdx: number; chapterId: string; title: string }> = [];

    book.chapters.forEach((chapter: any) => {
      // Mark chapter start position
      chapterPositions.push({
        startIdx: text.length,
        chapterId: chapter.id,
        title: chapter.title,
      });

      // Add chapter title as text
      text += `\n\n${chapter.title}\n\n`;

      // Add all paragraphs with spacing
      chapter.paragraphs.forEach((para: string) => {
        text += para + '\n\t';
      });
    });

    return { text, chapterPositions };
  }

  /**
   * Find which chapter a character position belongs to
   */
  function findChapterAtPosition(
    charIndex: number,
    chapterPositions: Array<{ startIdx: number; chapterId: string; title: string }>
  ) {
    for (let i = chapterPositions.length - 1; i >= 0; i--) {
      if (charIndex >= chapterPositions[i].startIdx) {
        return chapterPositions[i];
      }
    }
    return chapterPositions[0];
  }

  /**
   * Calculate how many characters fit on one page
   */
  function estimateCharsPerPage(config: LayoutConfig): number {
    const charsPerLine = Math.floor(config.screenWidth / (config.fontSize * 0.6));
    const linesPerPage = Math.floor((config.contentHeight || 0) / (config.fontSize *
  config.lineHeight));
    return charsPerLine * linesPerPage;
  }

  /**
   * Generate page layout with continuous text flow
   */
  export async function generateBookLayout(
    book: any,
    config: LayoutConfig,
    measureContent?: (text: string) => Promise<number>
  ): Promise<BookLayout> {

    // Step 1: Create continuous text
    const { text: fullText, chapterPositions } = createContinuousText(book);

    // Step 2: Calculate content height
    const contentHeight = config.screenHeight - config.marginTop - config.marginBottom;

    // Step 3: Estimate characters per page
    const charsPerPage = estimateCharsPerPage({
      ...config,
      contentHeight,
    });

    // Step 4: Generate pages by slicing text
    const pages: Page[] = [];
    let pageNumber = 1;
    let currentCharIdx = 0;

    while (currentCharIdx < fullText.length) {
      const endCharIdx = Math.min(currentCharIdx + charsPerPage, fullText.length);
      const chapter = findChapterAtPosition(currentCharIdx, chapterPositions);

      pages.push({
        pageNumber,
        startCharIndex: currentCharIdx,
        endCharIndex: endCharIdx,
        chapterId: chapter.chapterId,
        chapterTitle: chapter.title,
      });

      currentCharIdx = endCharIdx;
      pageNumber++;
    }

    // Estimate total height
    const totalHeight = pages.length * contentHeight;

    return {
      pages,
      fullText,
      totalHeight,
      contentHeight,
    };
  }

  /**
   * Get text content for a specific page
   */
  export function getPageText(layout: BookLayout, pageNumber: number): string {
    const page = layout.pages.find(p => p.pageNumber === pageNumber);
    if (!page) return '';

    return layout.fullText.slice(page.startCharIndex, page.endCharIndex);
  }

  /**
   * Get page by number
   */
  export function getPageByNumber(layout: BookLayout, pageNumber: number): Page | null {
    return layout.pages.find(p => p.pageNumber === pageNumber) || null;
  }

  /**
   * Get page at scroll offset
   */
  export function getPageAtOffset(layout: BookLayout, scrollOffset: number): Page | null {
    const pageIndex = Math.floor(scrollOffset / layout.contentHeight);
    return layout.pages[pageIndex] || null;
  }