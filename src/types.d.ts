export interface ConstructData {
  gcp?: GCPData
  sentry?: SentryData
  file?: fileData
  console?: consoleData
}
export interface fileData {
  enabled: boolean
  config: {
    logDirectory: string
    fileNamePattern: string
    dateFormat: string
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
type SentryContext = {
  name: string
  data: Record<string, unknown>
}
type StringPair = {
  key: string
  value: string
}
export type constructPair = {
  data: string
  level: number
}
type loggingData = {
  name?: string
  raw?: string
  error?: string
  translate?: T
}
export type T = {
  defaultValue?: string[]
  count?: number
  context?: string
  replace?: string[]
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
type interpolation = {
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
