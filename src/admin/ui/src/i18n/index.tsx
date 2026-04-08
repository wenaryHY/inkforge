import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { Language, I18nContextValue, TFunction } from './types';
import { dictionary } from './dict';
import { detectLanguage, saveLanguage } from './detector';

// 创建 Context
const I18nContext = createContext<I18nContextValue | null>(null);

interface I18nProviderProps {
  children: ReactNode;
  initialLang?: Language;
}

/**
 * i18n Provider 组件
 * 为整个应用提供语言状态和翻译函数
 */
export function I18nProvider({ children, initialLang }: I18nProviderProps) {
  const [lang, setLangState] = useState<Language>(() => initialLang || detectLanguage());

  // 切换语言
  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    saveLanguage(newLang);
  }, []);

  // 翻译函数
  const t: TFunction = useCallback(
    (key: string, fallback?: string): string => {
      const dict = dictionary[lang];
      return (dict[key as keyof typeof dict] as string) || fallback || key;
    },
    [lang]
  );

  const format = useCallback(
    (key: string, params: Record<string, string | number> = {}, fallback?: string): string => {
      const template = t(key, fallback);
      return Object.entries(params).reduce(
        (result, [paramKey, value]) => result.replaceAll(`{${paramKey}}`, String(value)),
        template
      );
    },
    [t]
  );

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t,
      format,
    }),
    [lang, setLang, t, format]
  );

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * 使用 i18n 的 Hook
 */
export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

// 导出类型和工具
export type { Language, TFunction } from './types';
export { dictionary, detectLanguage, saveLanguage };
