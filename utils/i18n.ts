import { createInstance } from 'i18next'
import { initReactI18next } from 'react-i18next/initReactI18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import i18nextBrowserLanguageDetector from 'i18next-browser-languagedetector'

export const fallbackLng = 'en'
export const languages = [fallbackLng, 'zh']
export const defaultNS = 'translation'

const instance = createInstance()

instance
    .use(initReactI18next)
    .use(resourcesToBackend((language: string, namespace: string) => import(`./locales/${language}/${namespace}.json`)))
    .use(i18nextBrowserLanguageDetector)
    .init({
        fallbackLng,
        supportedLngs: languages,
        defaultNS,
        ns: ['translation'],
    })

export default instance
