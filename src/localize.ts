import i18Next from 'i18next'
import { T } from './types'
const Backend = require('i18next-fs-backend')
class Localizer {
  private locales = `${__dirname}/../locales`
  public readonly localize = i18Next

  constructor() {
    this.localize.on('initialized', (options: any) => {
      console.log(
        `Localisation has started. Current language is ${options.lng}`
      )
    })
    this.localize.on('onLanguageChanged', (lng: any) => {
      console.log(`Localisation has changed to ${lng}`)
    })
    this.localize.on(
      'onLanguageChanged',
      (lngs: any, namespace: any, key: any, res: any) => {
        console.log(
          `${this.t('error.unspecific.localize')}: ${lngs}/${namespace}/${key}`
        )
      }
    )
    this.localize.use(Backend).init({
      lng: 'en',
      backend: {
        loadPath: `${this.locales}/{{lng}}.json`, // `${this.locales}/{{lng}}/{{ns}}.json`,
        addPath: `${this.locales}/{{lng}}.missing.json`
      },
      fallbackLng: {
        'de-CH': ['fr', 'it'],
        'zh-Hant': ['zh-Hans', 'en'],
        es: ['fr'],
        default: ['en']
      },
      supportedLngs: [
        'es',
        'ja',
        'fr',
        'it',
        'en',
        'zh',
        'ko',
        'en-GB',
        'en-US',
        'de-CH',
        'zh-Hant',
        'zh-Hans'
      ],
      saveMissing: true,
      saveMissingTo: 'current',
      returnEmptyString: false,
      returnNull: false,
      initImmediate: false
    })
  }

  t = (input: string, options?: T): string => {
    if (!options) options = {}
    if (!options.replace) options.replace = []
    options.replace.push('what', input)
    return this.localize.t([input, 'error.unspecific.localize'], options)
  }
}
export const locales = new Localizer()
export const i18 = {
  t: (input: string, options?: T): string => locales.t(input, options),
  exists: locales.localize.exists,
  getFixedT: locales.localize.getFixedT,
  changeLanguage: locales.localize.changeLanguage,
  language: locales.localize.language,
  languages: locales.localize.languages,
  loadNamespaces: locales.localize.loadNamespaces,
  loadlanguages: locales.localize.loadLanguages,
  reloadResources: locales.localize.reloadResources,
  setDefaultNamespace: locales.localize.setDefaultNamespace,
  dir: locales.localize.dir,
  format: locales.localize.format
}
