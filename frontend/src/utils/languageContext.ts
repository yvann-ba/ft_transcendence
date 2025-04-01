type Language = 'en' | 'fr' | 'es';
type TranslationKeys = Record<string, any>;

// Cache translations to avoid reloading them
const translationCache: Record<Language, TranslationKeys | null> = {
  en: null,
  fr: null,
  es: null
};

export function getTranslation(obj: any, path: string, defaultValue: string = ''): string {
  const travel = (regexp: RegExp) =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === null ? defaultValue : result;
}

export function getInitialLanguage(): Language {
  const savedLanguage = localStorage.getItem('language') as Language;
  if (savedLanguage && ['en', 'fr', 'es'].includes(savedLanguage)) {
    return savedLanguage;
  }
  
  const browserLang = navigator.language.substring(0, 2);
  if (['en', 'fr', 'es'].includes(browserLang)) {
    return browserLang as Language;
  }
  
  return 'en';
}

async function loadTranslations(language: Language): Promise<TranslationKeys> {
  if (translationCache[language]) {
    return translationCache[language]!;
  }
  
  try {
    const response = await fetch(`/translation/${language}.json`);
    if (!response.ok) {
      console.error(`Failed to load translation file: ${language}.json`);
      throw new Error(`HTTP error ${response.status}`);
    }
    const translations = await response.json();
    translationCache[language] = translations;
    return translations;
  } catch (error) {
    console.error(`Error loading translations for ${language}:`, error);
    if (language !== 'en') {
      return loadTranslations('en');
    }
    return {};
  }
}

class LanguageService {
  private currentLanguage: Language;
  private translations: TranslationKeys;
  private listeners: (() => void)[] = [];
  
  constructor() {
    this.currentLanguage = getInitialLanguage();
    this.translations = {};
    this.init();
  }
  
  private async init() {
    this.translations = await loadTranslations(this.currentLanguage);
    this.notifyListeners();
  }
  
  public getCurrentLanguage(): Language {
    return this.currentLanguage;
  }
  
  public async setLanguage(language: Language) {
    if (language === this.currentLanguage) return;
    
    this.currentLanguage = language;
    localStorage.setItem('language', language);
    this.translations = await loadTranslations(language);
    
    document.documentElement.lang = language;
    
    this.notifyListeners();
  }
  
  public translate(key: string, defaultValue: string = key): string {
    return getTranslation(this.translations, key, defaultValue);
  }
  
  public addListener(listener: () => void) {
    this.listeners.push(listener);
  }
  
  public removeListener(listener: () => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }
  
  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}

export const languageService = new LanguageService();

export function t(key: string, defaultValue: string = key): string {
  return languageService.translate(key, defaultValue);
}