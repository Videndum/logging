"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.i18 = exports.locales = void 0;
const tslib_1 = require("tslib");
const i18next_1 = tslib_1.__importDefault(require("i18next"));
const Backend = require('i18next-fs-backend');
class Localizer {
    constructor() {
        this.locales = `${process.cwd()}/locales`;
        this.localize = i18next_1.default;
        this.t = (input, options) => {
            if (!options)
                options = {};
            if (!options.replace)
                options.replace = [];
            options.replace.push('what', input);
            return this.localize.t([input, 'error.unspecific.localize'], options);
        };
        this.localize.on('initialized', (options) => {
            console.log(`Localisation has started. Current language is ${options.lng}`);
        });
        this.localize.on('onLanguageChanged', (lng) => {
            console.log(`Localisation has changed to ${lng}`);
        });
        this.localize.on('onLanguageChanged', (lngs, namespace, key, res) => {
            console.log(`${this.t('error.unspecific.localize')}: ${lngs}/${namespace}/${key}`);
        });
        this.localize.use(Backend).init({
            lng: 'en',
            backend: {
                loadPath: `${this.locales}/{{lng}}.json`,
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
        });
    }
}
exports.locales = new Localizer();
exports.i18 = {
    t: (input, options) => exports.locales.t(input, options),
    exists: exports.locales.localize.exists,
    getFixedT: exports.locales.localize.getFixedT,
    changeLanguage: exports.locales.localize.changeLanguage,
    language: exports.locales.localize.language,
    languages: exports.locales.localize.languages,
    loadNamespaces: exports.locales.localize.loadNamespaces,
    loadlanguages: exports.locales.localize.loadLanguages,
    reloadResources: exports.locales.localize.reloadResources,
    setDefaultNamespace: exports.locales.localize.setDefaultNamespace,
    dir: exports.locales.localize.dir,
    format: exports.locales.localize.format
};
//# sourceMappingURL=localize.js.map