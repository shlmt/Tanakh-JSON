/**
 * Parasha Service - עזר לשליפת וחיפוש פסוקים מהתנ"ך
 * ניתן להשתמש בו ללא תלות ב-Angular
 */

const BOOKS_MAP = {
  Genesis: 'בראשית',
  Exodus: 'שמות',
  Leviticus: 'ויקרא',
  Numbers: 'במדבר',
  Deuteronomy: 'דברים',
  Joshua: 'יהושע',
  Judges: 'שופטים',
  Samuel: 'שמואל',
  'I Samuel': 'שמואל א',
  'II Samuel': 'שמואל ב',
  Kings: 'מלכים',
  'I Kings': 'מלכים א',
  'II Kings': 'מלכים ב',
  Isaiah: 'ישעיהו',
  Jeremiah: 'ירמיהו',
  Ezekiel: 'יחזקאל',
  Hosea: 'הושע',
  Joel: 'יואל',
  Amos: 'עמוס',
  Obadiah: 'עובדיה',
  Jonah: 'יונה',
  Micah: 'מיכה',
  Nahum: 'נחום',
  Habakkuk: 'חבקוק',
  Zephaniah: 'צפניה',
  Haggai: 'חגי',
  Zechariah: 'זכריה',
  Malachi: 'מלאכי',
};

const GEMATRIA_MAP = {
  1: 'א',
  2: 'ב',
  3: 'ג',
  4: 'ד',
  5: 'ה',
  6: 'ו',
  7: 'ז',
  8: 'ח',
  9: 'ט',
  10: 'י',
  11: 'יא',
  12: 'יב',
  13: 'יג',
  14: 'יד',
  15: 'טו',
  16: 'טז',
  17: 'יז',
  18: 'יח',
  19: 'יט',
  20: 'כ',
  21: 'כא',
  22: 'כב',
  23: 'כג',
  24: 'כד',
  25: 'כה',
  26: 'כו',
  27: 'כז',
  28: 'כח',
  29: 'כט',
  30: 'ל',
  31: 'לא',
  32: 'לב',
  33: 'לג',
  34: 'לד',
  35: 'לה',
  36: 'לו',
  37: 'לז',
  38: 'לח',
  39: 'לט',
  40: 'מ',
  41: 'מא',
  42: 'מב',
  43: 'מג',
  44: 'מד',
  45: 'מה',
  46: 'מו',
  47: 'מז',
  48: 'מח',
  49: 'מט',
  50: 'נ',
  51: 'נא',
  52: 'נב',
  53: 'נג',
  54: 'נד',
  55: 'נה',
  56: 'נו',
  57: 'נז',
  58: 'נח',
  59: 'נט',
  60: 'ס',
  61: 'סא',
  62: 'סב',
  63: 'סג',
  64: 'סד',
  65: 'סה',
  66: 'סו',
  67: 'סז',
  68: 'סח',
  69: 'סט',
  70: 'ע',
  71: 'עא',
  72: 'עב',
  73: 'עג',
  74: 'עד',
  75: 'עה',
  76: 'עו',
  77: 'עז',
  78: 'עח',
  79: 'עט',
  80: 'פ',
  81: 'פא',
  82: 'פב',
  83: 'פג',
  84: 'פד',
  85: 'פה',
  86: 'פו',
  87: 'פז',
  88: 'פח',
  89: 'פט',
  90: 'צ',
  91: 'צא',
  92: 'צב',
  93: 'צג',
  94: 'צד',
  95: 'צה',
  96: 'צו',
  97: 'צז',
  98: 'צח',
  99: 'צט',
  100: 'ק',
};

/**
 * המר מספר לגימטריה בעברית
 * @param {number} num
 * @returns {string}
 */
const numberToGematria = (num) => GEMATRIA_MAP[num] || num.toString();

/**
 * פרוק קטע פסוקים (כמו "Genesis 1:1-3") לפורמט מובן
 * @param {string} verseString - קטע בפורמט אנגלית
 * @returns {Object|undefined} - {bookName, startChapter, startVerse, endChapter, endVerse} בעברית
 */
const parseVerseToHebrew = (verseString) => {
  const regex = /^(.*?)\s+(\d+):(\d+)-(?:(\d+):)?(\d+)$/;
  const match = verseString?.trim().match(regex);
  if (!match) {
    return undefined;
  }

  const [_, bookName, startChapterStr, startVerseStr, endChapterStr, endVerseStr] = match;
  const startChapter = Number(startChapterStr);
  const startVerse = Number(startVerseStr);
  const endVerse = Number(endVerseStr);
  const endChapter = endChapterStr ? Number(endChapterStr) : startChapter;

  return {
    bookName: BOOKS_MAP[bookName],
    startChapter: numberToGematria(startChapter),
    startVerse: numberToGematria(startVerse),
    endChapter: numberToGematria(endChapter),
    endVerse: numberToGematria(endVerse),
  };
};

/**
 * שלוף קטע של פסוקים מנתוני התנ"ך
 * @param {Array} tanakhData - מערך הספרים מ-tanakh.json
 * @param {Object} ref - {bookName, startChapter, startVerse, endChapter, endVerse}
 * @returns {Object} - {book, range, chapters}
 */
const getTanakhRange = (tanakhData, { bookName, startChapter, startVerse, endChapter, endVerse }) => {
  const book = tanakhData.find((b) => b.book === bookName);
  if (!book) {
    throw new Error(`ספר "${bookName}" לא נמצא`);
  }

  const chapters = Object.keys(book.chapters);
  const startChapterIndex = chapters.indexOf(startChapter);
  const endChapterIndex = chapters.indexOf(endChapter);

  if (startChapterIndex === -1) {
    throw new Error(`פרק "${startChapter}" לא נמצא בספר "${bookName}"`);
  }
  if (endChapterIndex === -1) {
    throw new Error(`פרק "${endChapter}" לא נמצא בספר "${bookName}"`);
  }
  if (startChapterIndex > endChapterIndex) {
    throw new Error('פרק התחלה לא יכול להיות אחרי פרק הסיום');
  }

  const result = {
    book: bookName,
    range: `${startChapter}:${startVerse} - ${endChapter}:${endVerse}`,
    chapters: {},
  };

  for (let i = startChapterIndex; i <= endChapterIndex; i++) {
    const chapterKey = chapters[i];
    const chapter = book.chapters[chapterKey];
    if (!chapter) continue;

    const verses = Object.keys(chapter);
    result.chapters[chapterKey] = {};

    if (startChapterIndex === endChapterIndex) {
      // אותו פרק
      const startVerseIndex = verses.indexOf(startVerse);
      const endVerseIndex = verses.indexOf(endVerse);

      if (startVerseIndex === -1) {
        throw new Error(`פסוק "${startVerse}" לא נמצא בפרק "${chapterKey}"`);
      }
      if (endVerseIndex === -1) {
        throw new Error(`פסוק "${endVerse}" לא נמצא בפרק "${chapterKey}"`);
      }
      if (startVerseIndex > endVerseIndex) {
        throw new Error('פסוק התחלה לא יכול להיות אחרי פסוק הסיום');
      }

      for (let j = startVerseIndex; j <= endVerseIndex; j++) {
        const verseKey = verses[j];
        result.chapters[chapterKey][verseKey] = chapter[verseKey];
      }
    } else if (i === startChapterIndex) {
      // פרק ההתחלה
      const startVerseIndex = verses.indexOf(startVerse);
      if (startVerseIndex === -1) {
        throw new Error(`פסוק "${startVerse}" לא נמצא בפרק "${chapterKey}"`);
      }
      for (let j = startVerseIndex; j < verses.length; j++) {
        const verseKey = verses[j];
        result.chapters[chapterKey][verseKey] = chapter[verseKey];
      }
    } else if (i === endChapterIndex) {
      // פרק הסיום
      const endVerseIndex = verses.indexOf(endVerse);
      if (endVerseIndex === -1) {
        throw new Error(`פסוק "${endVerse}" לא נמצא בפרק "${chapterKey}"`);
      }
      for (let j = 0; j <= endVerseIndex; j++) {
        const verseKey = verses[j];
        result.chapters[chapterKey][verseKey] = chapter[verseKey];
      }
    } else {
      // פרקים אמצעיים - כל הפסוקים
      result.chapters[chapterKey] = { ...chapter };
    }
  }

  return result;
};

/**
 * שלוף את קריאת התורה של התאריך לפי Hebcal
 * @param {string} date - בפורמט YYYY-MM-DD
 * @returns {Promise<Object>} - {title, parasha, haftara, leining}
 */
const fetchParasha = async (date) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error('Invalid date format. Use YYYY-MM-DD.');
  }

  const res = await fetch(
    `https://www.hebcal.com/hebcal?v=1&cfg=json&s=on&start=${date}&end=${date}`
  );

  if (!res.ok) {
    throw new Error('Failed to fetch parasha');
  }

  const data = await res.json();

  if (!data.items || data.items.length === 0) {
    throw new Error('No parasha found for the given date');
  }

  const item = data.items[0];
  return {
    title: item.hebrew,
    parasha: parseVerseToHebrew(item.leyning.torah),
    haftara: parseVerseToHebrew(item.leyning.haftarah),
    leining: [
      parseVerseToHebrew(item.leyning['1']),
      parseVerseToHebrew(item.leyning['2']),
      parseVerseToHebrew(item.leyning['3']),
      parseVerseToHebrew(item.leyning['4']),
      parseVerseToHebrew(item.leyning['5']),
      parseVerseToHebrew(item.leyning['6']),
      parseVerseToHebrew(item.leyning['7']),
      parseVerseToHebrew(item.leyning.maftir),
    ],
  };
};

/**
 * שלוף טקסט של קטע פסוקים מהתנ"ך
 * @param {Object} ref - {bookName, startChapter, startVerse, endChapter, endVerse}
 * @param {string} tanakhPath - נתיב לקובץ tanakh.json (ברירת מחדל: './tanakh.json')
 * @returns {Promise<Object>} - {book, range, chapters}
 */
const getParashaText = async (ref, tanakhPath = './tanakh.json') => {
  const { bookName, startChapter, startVerse, endChapter, endVerse } = ref;

  const response = await fetch(tanakhPath);
  if (!response.ok) {
    throw new Error('Failed to fetch Tanakh data');
  }

  const tanakhData = await response.json();
  return getTanakhRange(tanakhData, {
    bookName,
    startChapter,
    startVerse,
    endChapter,
    endVerse,
  });
};

/**
 * פונקציה עזר: הסר קרי, השאיר רק כתיב
 * @param {string} text - טקסט עם [קרי]
 * @returns {string}
 */
const getKetivOnly = (text) => {
  return text.replace(/\s*\[[^\]]+\]/g, '');
};

/**
 * פונקציה עזר: החלץ קרי מתוך טקסט
 * @param {string} text - טקסט עם [קרי]
 * @returns {string|null}
 */
const getKeri = (text) => {
  const match = text.match(/\[([^\]]+)\]/);
  return match ? match[1] : null;
};

// ייצוא
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    fetchParasha,
    getParashaText,
    parseVerseToHebrew,
    getTanakhRange,
    numberToGematria,
    getKetivOnly,
    getKeri,
    BOOKS_MAP,
    GEMATRIA_MAP,
  };
}

// או ES6 export אם יש תמיכה
try {
  export {
    fetchParasha,
    getParashaText,
    parseVerseToHebrew,
    getTanakhRange,
    numberToGematria,
    getKetivOnly,
    getKeri,
    BOOKS_MAP,
    GEMATRIA_MAP,
  };
} catch (e) {
  // CommonJS environment, no need for ES6 export
}
