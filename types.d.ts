import { loggingData } from 'src'

declare global {
  namespace NodeJS {
    interface Global {
      __rootdir__: string
      logging: any
    }
  }
}

export interface fileData {
  enabled: boolean
  config: {
    logDirectory: string
    fileNamePattern: string
    dateFormat?: string
  }
}
export interface consoleData {
  enabled: boolean
}
export interface GCPData {
  enabled: boolean
  projectid: string
  logname: string
}
export interface SentryData {
  enabled: boolean
  config: {
    dsn: string
    debug?: boolean
    release?: string
    environment?: string
    serverName?: string
    sampleRate?: number
    maxBreadcrumbs?: number
    attachStacktrace?: boolean
    tracesSampleRate?: number
    normalizeDepth?: number
  }
  extras?: {
    user?: {
      email?: string
    }
    tags?: StringPair[]
    context?: SentryContext[]
  }
}
export type SentryContext = {
  name: string
  data: Record<string, unknown>
}
export type StringPair = {
  key: string
  value: string
}
export type constructPair = {
  data: loggingData
  level: number
}

export type userData = {
  id?: string
  email?: string
  username?: string
  platform?: string
  arch?: string
  release?: string
}

export type LoggingLevels =
  | '0' // the log entry has no assigned severity level.
  | '100' //  Debug or trace information.
  | '200' //  Routine information, such as ongoing status or performance.
  | '300' //  Normal but significant events, such as start up, shut down, or a configuration change.
  | '400' //  Warning events might cause problems.
  | '500' //  Error events are likely to cause problems.
  | '600' //  Critical events cause more severe problems or outages.
  | '700' //  A person must take an action immediately.
  | '800' //  One or more systems are unusable.

export type T = {
  defaultValue?: string[]
  count?: number
  context?: string
  replace?: any[] | {}
  lng?: string
  lngs?: string[]
  fallbackLng?: string
  ns?: string
  keySeparator?: string
  nsSeparator?: string
  returnObjects?: boolean
  joinArrays?: string
  postProcess?: string | string[]
  interpolation?: interpolation
  skipInterpolation?: boolean
}

export type interpolation = {
  format?: () => string
  formatSeparator?: string
  escape?: (str?: string) => string
  escapeValue?: boolean
  useRawValueToEscape?: boolean
  prefix?: string
  suffix?: string
  prefixEscaped?: string
  suffixEscaped?: string
  unescapeSuffix?: string
  unescapePrefix?: string
  nestingPrefix?: string
  nestingSuffix?: string
  nestingPrefixEscaped?: string
  nestingSuffixEscaped?: string
  nestingOptionsSeparator?: string
  defaultVariables?: any[] | {}
  maxReplaces?: number
  skipOnVariables?: boolean
}
