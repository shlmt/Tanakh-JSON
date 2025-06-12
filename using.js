/**
 * קורא פסוקי תנ"ך מקובץ JSON
 * @param {Object} tanakhData - נתוני התנ"ך שנטענו מקובץ JSON
 * @param {string} bookName - שם הספר (למשל: "צפניה")
 * @param {string} startChapter - פרק התחלה (באות עברית, למשל: "א")
 * @param {string} startVerse - פסוק התחלה (באות עברית, למשל: "א")
 * @param {string} endChapter - פרק סיום (באות עברית, למשל: "ב")
 * @param {string} endVerse - פסוק סיום (באות עברית, למשל: "ה")
 * @returns {Object} אובייקט המכיל את הפסוקים בטווח הנתון
 */
function getTanakhRange(tanakhData, bookName, startChapter, startVerse, endChapter, endVerse) {
    // מציאת הספר
    const book = tanakhData.find(b => b.book === bookName);
    if (!book) {
        throw new Error(`ספר "${bookName}" לא נמצא`);
    }
    
    // קבלת רשימת הפרקים בספר
    const chapters = Object.keys(book.chapters);
    
    // מציאת אינדקסים של פרקי התחלה וסיום
    const startChapterIndex = chapters.indexOf(startChapter);
    const endChapterIndex = chapters.indexOf(endChapter);
    
    if (startChapterIndex === -1) {
        throw new Error(`פרק "${startChapter}" לא נמצא בספר "${bookName}"`);
    }
    
    if (endChapterIndex === -1) {
        throw new Error(`פרק "${endChapter}" לא נמצא בספר "${bookName}"`);
    }
    
    if (startChapterIndex > endChapterIndex) {
        throw new Error("פרק התחלה לא יכול להיות אחרי פרק הסיום");
    }
    
    const result = {
        book: bookName,
        range: `${startChapter}:${startVerse} - ${endChapter}:${endVerse}`,
        chapters: {}
    };
    
    // עיבוד כל פרק בטווח
    for (let i = startChapterIndex; i <= endChapterIndex; i++) {
        const chapterKey = chapters[i];
        const chapter = book.chapters[chapterKey];
        
        if (!chapter) continue;
        
        const verses = Object.keys(chapter);
        result.chapters[chapterKey] = {};
        
        // אם זה פרק יחיד (התחלה וסיום זהים)
        if (startChapterIndex === endChapterIndex) {
            const startVerseIndex = verses.indexOf(startVerse);
            const endVerseIndex = verses.indexOf(endVerse);
            
            if (startVerseIndex === -1) {
                throw new Error(`פסוק "${startVerse}" לא נמצא בפרק "${chapterKey}"`);
            }
            
            if (endVerseIndex === -1) {
                throw new Error(`פסוק "${endVerse}" לא נמצא בפרק "${chapterKey}"`);
            }
            
            if (startVerseIndex > endVerseIndex) {
                throw new Error("פסוק התחלה לא יכול להיות אחרי פסוק הסיום");
            }
            
            // העתקת הפסוקים בטווח
            for (let j = startVerseIndex; j <= endVerseIndex; j++) {
                const verseKey = verses[j];
                result.chapters[chapterKey][verseKey] = chapter[verseKey];
            }
        }
        // אם זה הפרק הראשון
        else if (i === startChapterIndex) {
            const startVerseIndex = verses.indexOf(startVerse);
            
            if (startVerseIndex === -1) {
                throw new Error(`פסוק "${startVerse}" לא נמצא בפרק "${chapterKey}"`);
            }
            
            // העתקת כל הפסוקים מהפסוק הראשון עד הסוף
            for (let j = startVerseIndex; j < verses.length; j++) {
                const verseKey = verses[j];
                result.chapters[chapterKey][verseKey] = chapter[verseKey];
            }
        }
        // אם זה הפרק האחרון
        else if (i === endChapterIndex) {
            const endVerseIndex = verses.indexOf(endVerse);
            
            if (endVerseIndex === -1) {
                throw new Error(`פסוק "${endVerse}" לא נמצא בפרק "${chapterKey}"`);
            }
            
            // העתקת כל הפסוקים מההתחלה עד הפסוק האחרון
            for (let j = 0; j <= endVerseIndex; j++) {
                const verseKey = verses[j];
                result.chapters[chapterKey][verseKey] = chapter[verseKey];
            }
        }
        // פרקים אמצעיים - העתק הכל
        else {
            result.chapters[chapterKey] = { ...chapter };
        }
    }
    
    return result;
}

/**
 * פונקציה עזר להדפסת התוצאה בצורה נוחה לקריאה
 * @param {Object} rangeData - תוצאת getTanakhRange
 * @returns {string} טקסט מעוצב
 */
function formatTanakhRange(rangeData) {
    let result = ''
    
    for (const [chapterKey, chapter] of Object.entries(rangeData.chapters)) {
        result += `פרק ${chapterKey}:\n`;
        result += '-'.repeat(20) + '\n';
        
        for (const [verseKey, verse] of Object.entries(chapter)) {
            result += `(${verseKey}) ${verse.text}`;
            if (verse.parasha) {
                result += ` ${verse.parasha}`;
            }
            result += '\n';
        }
        
        result += '\n';
    }
    
    return result;
}

// דוגמה לשימוש:

async function example() {
    try {
        // טעינת נתוני התנ"ך
        const tanakhData = await (await fetch('https://raw.githubusercontent.com/shlmt/Tanakh-JSON/refs/heads/main/tanakh.json')).json()
        
        // קבלת פסוקים מצפניה פרק א פסוק א עד פרק א פסוק ה
        const range = getTanakhRange(tanakhData, 'צפניה', 'א', 'א', 'א', 'ה');
        
        // הדפסת התוצאה
        console.log(formatTanakhRange(range));        
        
        // או גישה ישירה לנתונים:
        console.log(range.chapters['א']['א'].text); // הפסוק הראשון
        
    } catch (error) {
        console.error('שגיאה:', error.message);
    }
}

// הרצת הדוגמה
example();

// ייצוא הפונקציות (לסביבת Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getTanakhRange,
        formatTanakhRange
    };
}