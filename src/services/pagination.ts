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

  function padToNextPageBoundary(
  text: string,
  charsPerLine: number,
  charsPerPage: number
): string {
  const charsIntoCurrentPage = text.length % charsPerPage;

  // Already at page start
  if (charsIntoCurrentPage === 0) return text;

  const charsRemainingOnPage = charsPerPage - charsIntoCurrentPage;

  // How many full lines of padding can we add
  const fullLines = Math.floor(charsRemainingOnPage / charsPerLine);
  const remainingChars = charsRemainingOnPage % charsPerLine;

  let padding = "";

  // Each full line = (charsPerLine - 1) spaces + '\n' (1 char) = charsPerLine chars
  for (let i = 0; i < fullLines; i++) {
    padding += " ".repeat(charsPerLine - 1) + "\n";
  }

  // If there are leftover chars, fill them with spaces + newline
  // so that the total added chars == charsRemainingOnPage
  if (remainingChars > 0) {
    if (remainingChars === 1) {
      // We only need 1 char: a newline is enough
      padding += "\n";
    } else {
      padding += " ".repeat(remainingChars - 1) + "\n";
    }
  }

  return text + padding;
}

export function createContinuousText(
  book: any,
  config: LayoutConfig
): {
  text: string;
  chapterPositions: Array<{ startIdx: number; chapterId: string; title: string }>;
} {
  let text = "";
  const chapterPositions: Array<{ startIdx: number; chapterId: string; title: string }> = [];

  // Calculate page dimensions
  const contentHeight = config.screenHeight - config.marginTop - config.marginBottom;
  const lineHeightPx = config.fontSize * config.lineHeight;
  const linesPerPage = Math.floor(contentHeight / lineHeightPx);

  // Rough estimate of chars per line
  const charsPerLine = Math.floor(config.screenWidth / (config.fontSize * 0.6));
  const charsPerPage = charsPerLine * linesPerPage;

  book.chapters.forEach((chapter: any, index: number) => {
    // For chapters after the first, move to the start of a new page
    if (index > 0) {
      text = padToNextPageBoundary(text, charsPerLine, charsPerPage);
    }

    const startIdx = text.length;

    chapterPositions.push({
      startIdx,
      chapterId: chapter.id,
      title: chapter.title,
    });

    // Add chapter title (starting at top of page)
    text += chapter.title + "\n\n";

    // Ensure the title is on its own page:
    // fill the rest of this page so paragraphs start on the next page
    text = padToNextPageBoundary(text, charsPerLine, charsPerPage);

    // Add all paragraphs with spacing
    chapter.paragraphs.forEach((para: string) => {
      text += para + "\n\n";
    });
  });

  return { text, chapterPositions };
}




/*
export function createContinuousText(
    book: any,
    config: LayoutConfig
  ): {
    text: string;
    chapterPositions: Array<{ startIdx: number; chapterId:
  string; title: string }>
  } {
    let text = '';
    const chapterPositions: Array<{ startIdx: number;
  chapterId: string; title: string }> = [];

    // Calculate page dimensions
    const contentHeight = config.screenHeight -
  config.marginTop - config.marginBottom;
    const lineHeightPx = config.fontSize *
  config.lineHeight;
    const linesPerPage = Math.floor(contentHeight /
  lineHeightPx);
    const charsPerLine = Math.floor(config.screenWidth /
  (config.fontSize * 0.6));
    const charsPerPage = charsPerLine * linesPerPage;

    book.chapters.forEach((chapter: any) => {
      const startIdx = text.length;

      chapterPositions.push({
        startIdx,
        chapterId: chapter.id,
        title: chapter.title,
      });

      // For chapters after the first, add page break
      //if (startIdx !== 0) {
        // Calculate how many characters into the current page we are
        const charsIntoCurrentPage = text.length %
  charsPerPage;

        // If we're not at the start of a page, fill the rest of the page
        if (charsIntoCurrentPage > 0) {
          const charsRemainingOnPage = charsPerPage -
  charsIntoCurrentPage;
          const linesRemaining =
  Math.ceil(charsRemainingOnPage / charsPerLine);
          text += '\n'.repeat(linesRemaining);
        }
      //}

      // Add chapter title on its own page
      text += `\n\n${chapter.title}\n\n`;

      // Fill rest of page after title
      const titleLength = chapter.title.length + 4; // +4 for the \n\n before and after
      const charsAfterTitle = titleLength % charsPerPage;
      if (charsAfterTitle > 0) {
        const charsRemaining = charsPerPage -
  charsAfterTitle;
        const linesRemaining = Math.ceil(charsRemaining /
  charsPerLine);
        text += '\n'.repeat(linesRemaining);
      }

      // Add all paragraphs with spacing
      chapter.paragraphs.forEach((para: string) => {
        text += para + '\n\n';
      });
    });

    return { text, chapterPositions };
  }
*/

  /*export function createContinuousText(
    book: any,
    config: LayoutConfig
  ): {
    text: string;
    chapterPositions: Array<{ startIdx: number; chapterId:
  string; title: string }>
  } {
    let text = '';
    const chapterPositions: Array<{ startIdx: number;
  chapterId: string; title: string }> = [];

    // Calculate newlines needed to fill a page
    const contentHeight = config.screenHeight -
  config.marginTop - config.marginBottom;
    const lineHeightPx = config.fontSize * config.lineHeight;
    const linesPerPage = Math.floor(contentHeight /
  lineHeightPx);
    const pageBreak = '\n'.repeat(linesPerPage);

    book.chapters.forEach((chapter: any) => {

      if (text.length !== 0) {
        text += pageBreak + '\n';
      }

      chapterPositions.push({
        startIdx: text.length,
        chapterId: chapter.id,
        title: chapter.title,
      });

      // Add chapter title on its own page
      text += `\n\n${chapter.title}${pageBreak}`;

      // Add all paragraphs with spacing
      chapter.paragraphs.forEach((para: string) => {
        text += '\t' + para + '\n';
      });
    });

    return { text, chapterPositions };
  }
  */



  /**
   * Flatten book into continuous text with chapter markers
   */
  /*
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
  */


  


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


     // Calculate content height first
    const contentHeight = config.screenHeight -
  config.marginTop - config.marginBottom;
    const configWithHeight = { ...config, contentHeight };

    // Pass config to createContinuousText
    const { text: fullText, chapterPositions } = createContinuousText(book, configWithHeight);
    
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