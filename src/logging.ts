import { Log, Logging } from '@google-cloud/logging'
import { Metadata } from '@google-cloud/logging/build/src/log'
import { RewriteFrames } from '@sentry/integrations'
import * as Sentry from '@sentry/node'
import chalk from 'chalk'
import * as fs from 'fs'
import os from 'os'
import {
  consoleData,
  constructPair,
  fileData,
  GCPData,
  LoggingLevels,
  SentryData,
  T,
  userData
} from 'types'
import { i18, Localizer } from './localize'

global.__rootdir__ = __dirname || process.cwd()

/**
 * Configures Chalk
 * @author TGTGamer
 * @since 1.0.0-alpha
 */
export const style = {
  brand: {
    videndumPurple: chalk.hex('4B428E')
  }
}
type logLevels = {
  name: logTypes
  chalk: any
}[]
type logTypes =
  | 'DEFAULT'
  | 'DEBUG'
  | 'INFO'
  | 'NOTICE'
  | 'WARN'
  | 'ERROR'
  | 'CRITICAL'
  | 'ALERT'
  | 'EMERGENCY'

/**
 * Main class used for package
 * @author TGTGamer
 * @since 1.0.0-alpha
 */
export class Logger {
  private gcp: Logging = new Logging()
  protected constructData: ConstructData | undefined
  public loglevel: number = 1
  public readonly sentry = Sentry
  public readonly loglevels: logLevels = [
    {
      name: 'DEFAULT',
      chalk: chalk.inverse
    },
    {
      name: 'DEBUG',
      chalk: chalk.grey
    },
    {
      name: 'INFO',
      chalk: chalk.green
    },
    {
      name: 'NOTICE',
      chalk: chalk.greenBright
    },
    {
      name: 'WARN',
      chalk: chalk.white
    },
    {
      name: 'ERROR',
      chalk: chalk.yellow
    },
    {
      name: 'CRITICAL',
      chalk: chalk.yellow
    },
    {
      name: 'ALERT',
      chalk: chalk.red
    },
    {
      name: 'EMERGENCY',
      chalk: chalk.red
    }
  ]
  private constructorLogs: constructPair[] = []
  gcpLogger: Log | undefined
  public configured: boolean = false
  i18: Localizer = new Localizer()

  constructor(options: { i18?: i18; logger: ConstructData }) {
    this.main(options)
  }
  async main(options: { i18?: i18; logger: ConstructData }) {
    this.constructData = options.logger
    await this.i18.main(options.i18)
    if (options.logger.logLevel) this.setloglevel(options.logger.logLevel)
    else if (process.env.LOGLEVEL) this.loglevel = +process.env.LOGLEVEL
    this.configureLogger(options.logger)
  }

  async configureLogger(constructData: ConstructData) {
    if (constructData.gcp?.enabled) await this.configureGCP(constructData.gcp)
    if (constructData.sentry?.enabled)
      await this.configureSentry(constructData.sentry)
    if (constructData.file?.enabled)
      await this.configureFile(constructData.file)
    await this.constructorLogs.forEach(log => {
      this.log(log.data)
    })
    this.configured = true
  }

  async configureGCP(gcpData: GCPData) {
    this.constructorLogs.push({
      data: {
        name: '200',
        message: 'videndum:logging.gcp.constructor',
        translate: true
      },
      level: 1
    })
    this.gcp = new Logging({ projectId: gcpData.projectid })
    this.gcpLogger = this.gcp.log(gcpData.logname)
  }

  async configureSentry(SentryData: SentryData) {
    this.constructorLogs.push({
      data: {
        name: '200',
        message: 'videndum:logging.sentry.constructor',
        translate: true
      },
      level: 1
    })
    try {
      this.sentry.init({
        ...SentryData.config,
        integrations: [
          new Sentry.Integrations.Console(),
          new Sentry.Integrations.Modules(),
          new Sentry.Integrations.Http({ tracing: true }),
          new RewriteFrames({ root: global.__rootdir__ })
        ],
        tracesSampleRate: 0.2
      })
      this.sentry.configureScope(scope => {
        if (SentryData.extras?.user) scope.setUser(SentryData.extras.user)
        if (SentryData.extras?.tags)
          SentryData.extras.tags.forEach(tag => {
            scope.setTag(tag.key, tag.value)
          })
        if (SentryData.extras?.context)
          SentryData.extras.context.forEach(context => {
            scope.setContext(context.name, context.data)
          })
      })
    } catch (_) {
      this.constructorLogs.push({
        data: {
          name: '200',
          message: 'videndum:logging.sentry.error',
          errors: _,
          translate: true
        },
        level: 6
      })
    }
  }

  /**
   * Sets up local logging to file
   * @author TGTGamer
   * @since 1.0.0-alpha
   */
  async configureFile(fileData: fileData) {
    this.constructorLogs.push({
      data: {
        name: '200',
        message: 'videndum:logging.file.constructor',
        translate: true
      },
      level: 1
    })
    fs.access(fileData.config.logDirectory, fs.constants.F_OK, (err: any) => {
      if (!err) {
        return
      } else {
        this.constructorLogs.push({
          data: {
            name: '200',
            message: 'videndum:errors.fileDirectory.caught',
            errors: err,
            translate: true
          },
          level: 6
        })
        fs.mkdir(
          fileData.config.logDirectory,
          { recursive: false },
          async (err: any) => {
            if (err)
              this.constructorLogs.push({
                data: {
                  name: '200',
                  message: 'videndum:errors.fileDirectory.thrown',
                  errors: err,
                  translate: true
                },
                level: 6
              })
            else
              this.constructorLogs.push({
                data: {
                  name: '200',
                  message: 'videndum:errors.fileDirectory.solved',
                  errors: err,
                  translate: true
                },
                level: 3
              })
          }
        )
        return
      }
    })
  }

  /**
   * Change the logging level.
   * @param {number | string} level - Logging level to use.
   */
  async setloglevel(level: LoggingLevels) {
    this.loglevel = Number(level) / 100
  }

  /**
   * Log your information or error to all platforms
   * @param  {loggingData} loggingData
   * @param  {number | string} type Optional types. Accepts both Numbers & String values. 1=debug, 2=info, 3=notice, 4=warn, 5=error, 6=critical, 7=alert, 8=emergency
   * @example
   * try {
   *  core.user.getUserID(core.license.license_holder_email)
   *  } catch(response){
   *    core.log(response, 1)
   *  }
   * @return logs data to console, sentry and log file as appropriate
   */
  async log(loggingData: loggingData) {
    if (this.constructData == undefined) return
    if (loggingData.translate)
      loggingData.message = this.i18.t(loggingData.message, loggingData.T)
    if (loggingData.errors) {
      if (!Array.isArray(loggingData.errors))
        loggingData.message = loggingData.message + ' ' + loggingData.errors
      else {
        loggingData.errors.forEach(
          error => (loggingData.message = loggingData.message + ' ' + error)
        )
      }
    }
    if (!loggingData.userData)
      loggingData.userData = {
        username: os.userInfo().username
      }
    ;(loggingData.userData.platform = os.platform()),
      (loggingData.userData.arch = os.arch()),
      (loggingData.userData.release = os.release())

    // Defines log type
    let type = Number(loggingData.name) / 100

    // log to cloud logger
    if (this.constructData.gcp?.enabled) {
      try {
        if (!this.gcpLogger)
          throw new Error(
            "Can't log to google cloud platform without valid log configuration"
          )
        if (!loggingData.metadata)
          loggingData.metadata = {
            resource: {
              type: 'global'
            },
            severity: loggingData.name
          }
        let entry = this.gcpLogger.entry(
          loggingData.metadata,
          loggingData.message
        )
        await this.gcpLogger.write(entry)
      } catch (err) {
        this.log(err)
        this.constructData.gcp.enabled = false
      }
    }
    // Translate the metadata
    loggingData.name = this.loglevels[type].name.toLowerCase()
    loggingData.name = await this.translate(
      `videndum:logging.${loggingData.name}`
    )
    if (loggingData.name) loggingData.name = loggingData.name.toUpperCase()

    if (type >= this.loglevel || process.env.DEBUG == 'true') {
      // Log to local logger
      if (this.constructData.file?.enabled) {
        try {
          fs.appendFile(
            `${this.constructData.file?.config.logDirectory}/${this.constructData.file?.config.fileNamePattern}`,
            `[${loggingData.name}]  ` + loggingData.message + '\r\n',
            err => {
              if (err) throw err
            }
          )
        } catch (err) {
          this.log(err)
          this.constructData.file.enabled = false
        }
      }

      // Log to sentry
      if (type >= 4 && this.constructData.sentry?.enabled) {
        try {
          const t: number = type,
            data = loggingData
          data.name = loggingData.message
          this.sentry.withScope(scope => {
            scope.setUser({
              username: loggingData.userData?.username,
              email: loggingData.userData?.email
            })
            scope.setContext('platform', {
              string: loggingData.userData?.platform
            })
            scope.setContext('arch', { string: loggingData.userData?.arch })
            scope.setContext('platform release', {
              string: loggingData.userData?.release
            })
            if (t == 4) scope.setLevel(this.sentry.Severity.Warning)
            else if (t == 5) scope.setLevel(this.sentry.Severity.Error)
            else if (t == 6) scope.setLevel(this.sentry.Severity.Critical)
            else if (t >= 7) scope.setLevel(this.sentry.Severity.Fatal)
            this.sentry.captureException(data)
          })
        } catch (_) {
          this.log(_)
          this.constructData.sentry.enabled = false
        }
      }
      loggingData.name = this.loglevels[type].chalk(loggingData.name)

      // if (!!this.constructData.console?.enabled)
      console.log(`[${loggingData.name}]  ` + loggingData.message)
    }
    return
  }

  async translate(name: string): Promise<string> {
    return this.i18.t(name)
  }

  /**
   * Used to shutdown logging - to ensure that all logs are processed
   * @author TGTGamer
   * @since 1.0.0-alpha
   */
  async shutdown(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.sentry
        .close(2000)
        .then(async () => {
          await this.log(
            new Error('Logger successfully shutdown - safe to end all process')
          )
          resolve()
        })
        .catch(_ => reject(_))
    })
  }
}
export interface loggingOptions {
  name: LoggingLevels
  message?: string
  options?: {
    errors?: Error
    translate?: boolean
    userData?: userData
    T?: T
    metadata?: Metadata
  }
}

export class loggingData extends Error {
  errors?: Error
  translate?: boolean
  userData?: userData
  T?: T
  metadata?: Metadata
  constructor(
    name: loggingOptions['name'],
    message?: loggingOptions['message'],
    options?: loggingOptions['options']
  ) {
    super(message)
    this.name = name
    this.errors = options?.errors
    this.translate = options?.translate
    this.userData = options?.userData
    this.T = options?.T
    this.metadata = options?.metadata

    // restore prototype chain
    // @ts-ignore
    const actualProto = new.target.prototype
    if (actualProto) Object.setPrototypeOf(this, actualProto)
  }
}
export interface ConstructData {
  gcp?: GCPData
  sentry?: SentryData
  file?: fileData
  console?: consoleData
  logLevel?: LoggingLevels
}
