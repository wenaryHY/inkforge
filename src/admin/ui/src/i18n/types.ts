// 语言类型
export type Language = 'zh' | 'en';

// 翻译函数类型
export type TFunction = (key: string, fallback?: string) => string;

// i18n Context 类型
export interface I18nContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: TFunction;
  format: (key: string, params?: Record<string, string | number>, fallback?: string) => string;
}
