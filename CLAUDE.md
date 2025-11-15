# CLAUDE.md – Interactive Kindle-like EPUB Reader (Expo / React Native)

## 0. High-level Summary

You are building a **Kindle-style EPUB reader** in React Native (Expo) with:

- Page-based reading (no vertical scroll, swipe to change pages)
- Support for EPUB books bundled in the app
- **Inline AI-generated 16-bit images**:
  - Scene images inserted between paragraphs every ~**500 words** (configurable)
  - Subtle 16-bit **chapter banner** at the bottom of the screen
- **Highlighting** like Kindle, plus:
  - Ask for **summaries of highlighted text** (LLM)
  - On open, show a **summary of the last ~5 pages** to re-enter the book
- **Page number side markings** similar to editor line numbers
- Simple **home screen grid** of book covers

Time budget is ~20 hours, so the instructions below are prioritized: **Core MVP first**, then **Stretch**.

Assumption: we **parse EPUB and render text natively in React Native** (not just drop in a prebuilt EPUB viewer), to keep full control over layout, images, highlights, and page markers.

---

## 1. Tech Stack & Key Dependencies

**Base:**

- Expo (managed workflow, React Native)
- TypeScript (recommended but not required)

**Routing & UI:**

- `expo-router` – file-based navigation
- Either:
  - Vanilla React Native components **or**
  - `react-native-paper` for modals/buttons/text fields
- `react-native-gesture-handler` + `react-native-reanimated` (bundled with Expo) or `react-native-pager-view` for swipe pagination

**Data & Storage:**

- `@react-native-async-storage/async-storage` – for highlights, page map, summaries
- `expo-file-system` – for storing generated images per book

**EPUB & Parsing:**

- A minimal EPUB parsing approach (two options):
  - Use a lightweight JS EPUB parser (if you add one), **or**
  - For hackathon simplicity: store book contents as **pre-extracted JSON** (chapters and paragraphs) from an EPUB you process ahead of time.
  
  > For time reasons, assume: **EPUBs are preprocessed into JSON** with:
  > ```ts
  > type Chapter = {
  >   id: string;
  >   title: string;
  >   paragraphs: string[];
  > };
  > type Book = {
  >   id: string;
  >   title: string;
  >   author?: string;
  >   coverImage: any;   // require('...')
  >   chapters: Chapter[];
  > };
  > ```

**LLM APIs:**

- OpenAI:
  - **Images**: DALL·E endpoint (16-bit style pixel art prompts)
  - **Text**: GPT model for summaries

> NOTE: For the hackathon, you can **stub** API calls or pre-generate assets if rate limits or latency become a problem.

---

## 2. Project Structure

Implement the project roughly like this:

```text
app/
  _layout.tsx              # expo-router root layout
  index.tsx                # Home screen (grid of books)

  reader/
    [bookId].tsx           # Main reader screen for a given book

src/
  data/
    books/
      book1.json           # Preprocessed EPUB-like JSON
      ...
    booksIndex.ts          # Registry of books

  models/
    book.ts                # Types for Book, Chapter, Page, Highlight, etc.

  services/
    pagination.ts          # Pagination + page map generation
    aiImages.ts            # DALL·E image generation & caching
    aiSummaries.ts         # GPT-based summaries
    storage.ts             # AsyncStorage helpers
    readingState.ts        # Helper: last location, last 5 pages, etc.

  components/
    BookGrid.tsx
    ReaderPage.tsx
    ReaderChrome.tsx       # Top/bottom UI, page info, chapter title
    PageMarkers.tsx        # Side markings for page numbers
    HighlightLayer.tsx     # Tap/drag text highlighting logic
    SummaryModal.tsx       # Popup window for summaries
    ChapterBanner.tsx      # 16-bit banner at bottom
