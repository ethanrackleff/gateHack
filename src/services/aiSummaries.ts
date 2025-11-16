import { BookLayout, Page } from './pagination';

  const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

  /**
   * Call OpenAI API to generate a summary
   * @param text - The text to summarize
   * @param maxChars - Maximum characters for the summary (based on page size)
   * @returns Summary string or error message
   */
  async function callOpenAI(text: string, maxChars: number): Promise<string> {
    if (!OPENAI_API_KEY) {
      return 'Error: OpenAI API key not found in environment variables';
    }

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are a helpful assistant that summarizes book content. Create 
  concise summaries with a minimum of 3-4 sentences. The summary must not exceed ${maxChars} 
  characters.`
            },
            {
              role: 'user',
              content: `Summarize the following text:\n\n${text}`
            }
          ],
          temperature: 0.7,
          max_tokens: Math.floor(maxChars / 3), // Rough estimate: 1 token ≈ 3 chars
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return `Error: OpenAI API returned ${response.status} - ${errorData.error?.message || 
  'Unknown error'}`;
      }

      const data = await response.json();
      const summary = data.choices[0]?.message?.content?.trim();

      if (!summary) {
        return 'Error: No summary generated from OpenAI';
      }

      return summary;
    } catch (error) {
      return `Error: Failed to connect to OpenAI API - ${error instanceof Error ? error.message
   : 'Unknown error'}`;
    }
  }

  /**
   * Find the starting character index for summary generation
   * (beginning of previous chapter, or start of book if on chapter 1)
   * @param book - The book object
   * @param currentPage - The current page the user is on
   * @returns character index to start summary from, or null if should skip
   */
  function getSummaryStartIndex(book: any, currentPage: Page): number | null {
    const currentChapterId = currentPage.chapterId;

    // Find current chapter index
    const currentChapterIndex = book.chapters.findIndex(
      (ch: any) => ch.id === currentChapterId
    );

    // If on first chapter, skip summary generation
    if (currentChapterIndex <= 0) {
      return null;
    }


    // Find where previous chapter starts in the full text
    // We need to calculate character position by going through all chapters before it
    let charPosition = 0;

    for (let i = 0; i < currentChapterIndex - 1; i++) {
      const chapter = book.chapters[i];
      // Add chapter title + newlines
      charPosition += `\n\n${chapter.title}\n\n`.length;
      // Add all paragraphs
      chapter.paragraphs.forEach((line: string) => {
        charPosition += line.length + 2; // +2 for \n\n
      });
    }

    return charPosition;
   }

   export async function getSummary(path: string, location: number): Promise<string | null> {
    if (location < 5) {
      return 'No Summary available, you are at the beginning of the book.'; 
    }
    let promptText = '';

    let locationsJson = require("../../epub_tools/alice_locations.json");

    let locationList = locationsJson.locations;

    for (let i = location - 5; i <= location; i++) {
      promptText = promptText + locationList[i].text;
    }

    const summary = await callOpenAI(promptText, 1000);

    return summary;
   }

  /**
   * Generate a summary of the text from previous chapter to current reading position
   * @param book - The book object
   * @param layout - The book layout with pagination info
   * @param currentPage - The current page the user is on
   * @param maxCharsPerPage - Maximum characters that fit on one page (for sizing summary)
   * @returns Summary string or error message
   */
  export async function generateSummaryForCurrentPosition(
    book: any,
    layout: BookLayout,
    currentPage: Page,
    maxCharsPerPage: number
  ): Promise<string> {
    // Get starting position (beginning of previous chapter)
    const startIndex = getSummaryStartIndex(book, currentPage);

    // Skip if on first chapter
    if (startIndex === null) {
      return 'No summary available - you are at the beginning of the book';
    }

    // End position is the first character of current page
    const endIndex = currentPage.startCharIndex;

    // Extract text to summarize
    const textToSummarize = layout.fullText.slice(startIndex, endIndex);

    // If there's no text to summarize
    if (textToSummarize.trim().length === 0) {
      return 'No text available to summarize';
    }

    // Generate summary with max length constraint
    const summary = await callOpenAI(textToSummarize, maxCharsPerPage);

    return summary;
  }

  /**
   * Helper: Calculate max summary length based on page dimensions
   * Uses the same estimation as pagination
   */
  export function calculateMaxSummaryLength(
    screenWidth: number,
    screenHeight: number,
    fontSize: number,
    lineHeight: number
  ): number {
    const charsPerLine = Math.floor(screenWidth / (fontSize * 0.6));
    const linesPerPage = Math.floor(screenHeight / (fontSize * lineHeight));
    return charsPerLine * linesPerPage;
  }
