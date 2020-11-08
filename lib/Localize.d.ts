import { T } from './types';
declare class Localizer {
    private locales;
    readonly localize: import("i18next").i18n;
    constructor();
    t: (input: string, options?: T | undefined) => string;
}
export declare const locales: Localizer;
export declare const i18: {
    t: (input: string, options?: T | undefined) => string;
    exists: import("i18next").ExistsFunction<string, import("i18next").StringMap>;
    getFixedT: {
        (lng: string | string[], ns?: string | string[] | undefined): import("i18next").TFunction;
        (lng: null, ns: string | string[]): import("i18next").TFunction;
    };
    changeLanguage: (lng: string, callback?: import("i18next").Callback | undefined) => Promise<import("i18next").TFunction>;
    language: string;
    languages: string[];
    loadNamespaces: (ns: string | string[], callback?: import("i18next").Callback | undefined) => Promise<void>;
    loadlanguages: (lngs: string | string[], callback?: import("i18next").Callback | undefined) => Promise<void>;
    reloadResources: {
        (lngs?: string | string[] | undefined, ns?: string | string[] | undefined, callback?: (() => void) | undefined): Promise<void>;
        (lngs: null, ns: string | string[], callback?: (() => void) | undefined): Promise<void>;
    };
    setDefaultNamespace: (ns: string) => void;
    dir: (lng?: string | undefined) => "ltr" | "rtl";
    format: import("i18next").FormatFunction;
};
export {};
