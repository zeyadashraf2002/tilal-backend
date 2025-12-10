import axios from 'axios';

/**
 * In-memory cache for translations
 * Structure: { 'text|sourceLang|targetLang': 'translatedText' }
 */
const translationCache = new Map();

/**
 * Maximum cache size (to prevent memory overflow)
 */
const MAX_CACHE_SIZE = 10000;

/**
 * Clean cache when it exceeds max size
 */
const cleanCache = () => {
  if (translationCache.size > MAX_CACHE_SIZE) {
    // Remove oldest 20% of entries
    const entriesToRemove = Math.floor(MAX_CACHE_SIZE * 0.2);
    const keys = Array.from(translationCache.keys());
    
    for (let i = 0; i < entriesToRemove; i++) {
      translationCache.delete(keys[i]);
    }
    
    console.log(`Translation cache cleaned. Removed ${entriesToRemove} entries.`);
  }
};

/**
 * Generate cache key
 */
const getCacheKey = (text, sourceLang, targetLang) => {
  return `${text}|${sourceLang}|${targetLang}`;
};

/**
 * Translate text using Google Translate API (Free alternative using MyMemory API)
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code (ar, en, bn)
 * @param {string} sourceLang - Source language code (default: 'en')
 * @returns {Promise<string>} - Translated text
 */
export const translateText = async (text, targetLang, sourceLang = 'en') => {
  try {
    // Return original if same language
    if (sourceLang === targetLang) {
      return text;
    }

    // Return empty if text is empty
    if (!text || text.trim() === '') {
      return text;
    }

    // Check cache first
    const cacheKey = getCacheKey(text, sourceLang, targetLang);
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey);
    }

    // Use MyMemory Translation API (Free, no API key required)
    // Limit: 1000 words/day per IP
    const langPair = `${sourceLang}|${targetLang}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;

    const response = await axios.get(url);

    if (response.data && response.data.responseData && response.data.responseData.translatedText) {
      const translatedText = response.data.responseData.translatedText;
      
      // Store in cache
      translationCache.set(cacheKey, translatedText);
      cleanCache();
      
      return translatedText;
    }

    // If translation fails, return original text
    return text;
  } catch (error) {
    console.error('Translation error:', error.message);
    // Return original text if translation fails
    return text;
  }
};

/**
 * Translate object with multiple language fields
 * @param {object} obj - Object with language fields (e.g., { ar: 'text', en: 'text' })
 * @param {string} targetLang - Target language
 * @returns {Promise<string>} - Translated text
 */
export const translateMultiLangObject = async (obj, targetLang) => {
  try {
    // If target language exists in object, return it
    if (obj && obj[targetLang]) {
      return obj[targetLang];
    }

    // Otherwise, try to translate from available languages
    const availableLangs = ['en', 'ar', 'bn'];
    
    for (const lang of availableLangs) {
      if (obj && obj[lang] && obj[lang].trim() !== '') {
        return await translateText(obj[lang], targetLang, lang);
      }
    }

    // Return empty string if no translation available
    return '';
  } catch (error) {
    console.error('Multi-lang translation error:', error.message);
    return obj?.en || obj?.ar || obj?.bn || '';
  }
};

/**
 * Translate array of texts
 * @param {Array<string>} texts - Array of texts to translate
 * @param {string} targetLang - Target language
 * @param {string} sourceLang - Source language
 * @returns {Promise<Array<string>>} - Array of translated texts
 */
export const translateBatch = async (texts, targetLang, sourceLang = 'en') => {
  try {
    const translations = [];
    
    for (const text of texts) {
      const translated = await translateText(text, targetLang, sourceLang);
      translations.push(translated);
      
      // Add small delay to avoid rate limiting (100ms between requests)
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return translations;
  } catch (error) {
    console.error('Batch translation error:', error.message);
    return texts; // Return original texts if translation fails
  }
};

/**
 * Detect language of text (simple detection based on character sets)
 * @param {string} text - Text to detect language
 * @returns {string} - Detected language code
 */
export const detectLanguage = (text) => {
  if (!text || text.trim() === '') {
    return 'en';
  }

  // Arabic detection (Unicode range for Arabic characters)
  const arabicPattern = /[\u0600-\u06FF]/;
  if (arabicPattern.test(text)) {
    return 'ar';
  }

  // Bengali detection (Unicode range for Bengali characters)
  const bengaliPattern = /[\u0980-\u09FF]/;
  if (bengaliPattern.test(text)) {
    return 'bn';
  }

  // Default to English
  return 'en';
};

/**
 * Get cache statistics
 * @returns {object} - Cache statistics
 */
export const getCacheStats = () => {
  return {
    size: translationCache.size,
    maxSize: MAX_CACHE_SIZE,
    usagePercentage: ((translationCache.size / MAX_CACHE_SIZE) * 100).toFixed(2)
  };
};

/**
 * Clear translation cache
 */
export const clearCache = () => {
  translationCache.clear();
  console.log('Translation cache cleared.');
};

/**
 * Middleware to add translation helper to request
 */
export const translationMiddleware = (req, res, next) => {
  // Get language from query, header, or default to 'en'
  const lang = req.query.lang || req.headers['accept-language']?.split(',')[0]?.split('-')[0] || 'en';
  
  // Add translation helper to request
  req.translate = async (text, sourceLang = 'en') => {
    return await translateText(text, lang, sourceLang);
  };
  
  req.translateObject = async (obj) => {
    return await translateMultiLangObject(obj, lang);
  };
  
  req.lang = lang;
  
  next();
};

export default {
  translateText,
  translateMultiLangObject,
  translateBatch,
  detectLanguage,
  getCacheStats,
  clearCache,
  translationMiddleware
};

