import en from './en'
import zhCN from './zh-cn'

export type Translation = typeof en
export type I18nTable = typeof i18nTable

export const i18nTable: { [key: string]: Translation } = {
    en,
    'zh-CN': zhCN
}

export default function l(id: keyof Translation, lang?: keyof I18nTable): string {
    const langs = lang ? [lang, 'en'] : navigator.languages
    for (let i = 0; i < langs.length; i++) {
        const thisLang = langs[i]
        if (thisLang in i18nTable) {
            if (id in i18nTable[thisLang]) {
                return i18nTable[thisLang][id]
            }
        }
    }
    console.warn('[OneUI-I18N]', 'Unknown translation id:', id, ', checked these languages: ', langs, i18nTable)
    return id
}
