import { Metadata } from '@google-cloud/logging/build/src/log';
export interface ConstructData {
    gcp?: GCPData;
    sentry?: SentryData;
    file?: fileData;
    console?: consoleData;
}
export interface fileData {
    enabled: boolean;
    config: {
        logDirectory: string;
        fileNamePattern: string;
        dateFormat: string;
    };
}
export interface consoleData {
    enabled: boolean;
}
export interface GCPData {
    enabled: boolean;
    projectid: string;
    logname: string;
}
export interface SentryData {
    enabled: boolean;
    config: {
        dsn: string;
        debug?: boolean;
        release?: string;
        environment?: string;
        serverName?: string;
        sampleRate?: number;
        maxBreadcrumbs?: number;
        attachStacktrace?: boolean;
        tracesSampleRate?: number;
        normalizeDepth?: number;
    };
    extras?: {
        user?: {
            email?: string;
        };
        tags?: StringPair[];
        context?: SentryContext[];
    };
}
declare type SentryContext = {
    name: string;
    data: Record<string, unknown>;
};
declare type StringPair = {
    key: string;
    value: string;
};
export declare type constructPair = {
    data: loggingData;
    level: number;
};
export declare class loggingData extends Error {
    errors?: Error[] | Error;
    translate?: boolean;
    userData?: userData;
    T?: T;
    metadata?: Metadata;
    constructor(name: LoggingLevels, message?: string, errors?: Error[] | Error, options?: {
        translate?: boolean;
        userData?: userData;
        T?: T;
        metadata?: Metadata;
    });
}
declare type userData = {
    id?: string;
    email?: string;
    username?: string;
    platform?: string;
    arch?: string;
    release?: string;
};
export declare type LoggingLevels = 'DEFAULT' | '0' | 'DEBUG' | '100' | 'INFO' | '200' | 'NOTICE' | '300' | 'WARN' | '400' | 'ERROR' | '500' | 'CRITICAL' | '600' | 'ALERT' | '700' | 'EMERGENCY' | '800';
export declare type T = {
    defaultValue?: string[];
    count?: number;
    context?: string;
    replace?: string[];
    lng?: string;
    lngs?: string[];
    fallbackLng?: string;
    ns?: string;
    keySeparator?: string;
    nsSeparator?: string;
    returnObjects?: boolean;
    joinArrays?: string;
    postProcess?: string | string[];
    interpolation?: interpolation;
    skipInterpolation?: boolean;
};
declare type interpolation = {
    format?: () => string;
    formatSeparator?: string;
    escape?: (str?: string) => string;
    escapeValue?: boolean;
    useRawValueToEscape?: boolean;
    prefix?: string;
    suffix?: string;
    prefixEscaped?: string;
    suffixEscaped?: string;
    unescapeSuffix?: string;
    unescapePrefix?: string;
    nestingPrefix?: string;
    nestingSuffix?: string;
    nestingPrefixEscaped?: string;
    nestingSuffixEscaped?: string;
    nestingOptionsSeparator?: string;
    defaultVariables?: any[] | {};
    maxReplaces?: number;
    skipOnVariables?: boolean;
};
export {};
