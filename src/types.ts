import { Metadata } from '@google-cloud/logging/build/src/log'

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
  data: loggingData
  level: number
}

export class loggingData extends Error {
  errors?: Error[] | Error
  translate?: boolean
  userData?: userData
  T?: T
  metadata?: Metadata
  constructor(
    name: LoggingLevels,
    message?: string,
    errors?: Error[] | Error,
    options?: {
      translate?: boolean
      userData?: userData
      T?: T
      metadata?: Metadata
    }
  ) {
    super(message)
    this.name = name
    this.errors = errors
    this.translate = options?.translate
    this.userData = options?.userData
    this.T = options?.T
    this.metadata = options?.metadata

    // restore prototype chain
    const actualProto = new.target.prototype
    Object.setPrototypeOf(this, actualProto)
  }
}

type userData = {
  id?: string
  email?: string
  username?: string
  platform?: string
  arch?: string
  release?: string
}
export type LoggingLevels =
  | 'DEFAULT'
  | '0' // the log entry has no assigned severity level.
  | 'DEBUG'
  | '100' //  Debug or trace information.
  | 'INFO'
  | '200' //  Routine information, such as ongoing status or performance.
  | 'NOTICE'
  | '300' //  Normal but significant events, such as start up, shut down, or a configuration change.
  | 'WARN'
  | '400' //  Warning events might cause problems.
  | 'ERROR'
  | '500' //  Error events are likely to cause problems.
  | 'CRITICAL'
  | '600' //  Critical events cause more severe problems or outages.
  | 'ALERT'
  | '700' //  A person must take an action immediately.
  | 'EMERGENCY'
  | '800' //  One or more systems are unusable.

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
