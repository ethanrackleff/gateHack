/**
 * @typedef {Object} Chapter
 * @property {string} id - Unique chapter identifier
 * @property {string} title - Chapter title
 * @property {string[]} paragraphs - Array of paragraph text
 */

/**
 * @typedef {Object} Book
 * @property {string} id - Unique book identifier
 * @property {string} title - Book title
 * @property {string} author - Book author
 * @property {any} coverImage - Cover image (require() reference or URI)
 * @property {Chapter[]} chapters - Array of chapters
 */

/**
 * @typedef {Object} Page
 * @property {number} pageNumber - Page number (1-indexed)
 * @property {string} chapterId - Which chapter this page belongs to
 * @property {string} chapterTitle - Chapter title for display
 * @property {string} content - The actual text content for this page
 * @property {number} startWordIndex - Starting word index in the chapter
 * @property {number} endWordIndex - Ending word index in the chapter
 */

/**
 * @typedef {Object} Highlight
 * @property {string} id - Unique highlight identifier
 * @property {string} bookId - Book this highlight belongs to
 * @property {number} pageNumber - Page number where highlight exists
 * @property {string} text - The highlighted text
 * @property {number} timestamp - When highlight was created
 */

/**
 * @typedef {Object} ReadingState
 * @property {string} bookId - Book identifier
 * @property {number} currentPage - Current page number (1-indexed)
 * @property {number} totalPages - Total pages in book
 * @property {number} lastRead - Timestamp of last reading session
 */

export { };
