import { Logging } from '@google-cloud/logging'
import { RewriteFrames } from '@sentry/integrations'
import * as Sentry from '@sentry/node'
import * as fs from 'fs'
import { i18 } from './localize'
import {
  ConstructData,
  constructPair,
  fileData,
  GCPData,
  loggingData,
  SentryData
} from './types'

const chalk = require('chalk')

declare global {
  namespace NodeJS {
    interface Global {
      __rootdir__: string
    }
  }
}

global.__rootdir__ = __dirname || process.cwd()

/**
 * Configures Chalk
 * @author TGTGamer
 * @since 1.0.0-alpha
 */
export const style = {
  brand: {
    videndumPurple: chalk.hex('4B428E')
  },
  log: {
    default: chalk.inverse, // (0) The log entry has no assigned severity level.
    debug: chalk.grey, // (100) Debug or trace information.
    info: chalk.green, // (200) Routine information, such as ongoing status or performance.
    notice: chalk.green, // (300) Normal but significant events, such as start up, shut down, or a configuration change.
    warn: chalk.white, // (400) Warning events might cause problems.
    error: chalk.yellow, // (500) Error events are likely to cause problems.
    critical: chalk.yellow, // (600) Critical events cause more severe problems or outages.
    alert: chalk.red, // (700) A person must take an action immediately.
    emergency: chalk.red // (800) One or more systems are unusable.
  }
}

/**
 * Main class used for package
 * @author TGTGamer
 * @since 1.0.0-alpha
 */
export class Log {
  private gcp: Logging = new Logging()
  protected constructData: ConstructData
  public loglevel: number = 1
  public readonly sentry = Sentry
  public readonly loglevels = [
    'default', // (0) The log entry has no assigned severity level.
    'debug', // (100) Debug or trace information.
    'info', // (200) Routine information, such as ongoing status or performance.
    'notice', // (300) Normal but significant events, such as start up, shut down, or a configuration change.
    'warn', // (400) Warning events might cause problems.
    'error', // (500) Error events are likely to cause problems.
    'critical', // (600) Critical events cause more severe problems or outages.
    'alert', // (700) A person must take an action immediately.
    'emergency' // (800) One or more systems are unusable.
  ]
  private constructorLogs: constructPair[] = []
  gcpLogger: any
  public configured: boolean = false

  constructor(constructData: ConstructData) {
    this.constructData = constructData
    if (process.env.LOGLEVEL) this.loglevel = +process.env.LOGLEVEL
    this.configureLogger(constructData)
  }

  async configureLogger(constructData: ConstructData) {
    if (constructData.gcp?.enabled) await this.configureGCP(constructData.gcp)
    if (constructData.sentry?.enabled)
      await this.configureSentry(constructData.sentry)
    if (constructData.file?.enabled)
      await this.configureFile(constructData.file)
    await this.constructorLogs.forEach(log => {
      this.log(log.data, log.level)
    })
    this.configured = true
  }

  configureGCP(gcpData: GCPData) {
    this.constructorLogs.push({
      data: {
        name: 'INFO',
        message: 'logging.gcp.constructor',
        translate: true
      },
      level: 1
    })
    this.gcp = new Logging({ projectId: gcpData.projectid })
    this.gcpLogger = this.gcp.log(gcpData.logname)
  }

  configureSentry(SentryData: SentryData) {
    this.constructorLogs.push({
      data: {
        name: 'INFO',
        message: 'logging.sentry.constructor',
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
          new Sentry.Integrations.Http(),
          new RewriteFrames({ root: global.__rootdir__ })
        ]
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
          name: 'INFO',
          message: 'logging.sentry.error',
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
  configureFile(fileData: fileData) {
    this.constructorLogs.push({
      data: {
        name: 'INFO',
        message: 'logging.file.constructor',
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
            name: 'INFO',
            message: 'errors.fileDirectory.caught',
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
                  name: 'INFO',
                  message: 'errors.fileDirectory.thrown',
                  errors: err,
                  translate: true
                },
                level: 6
              })
            else
              this.constructorLogs.push({
                data: {
                  name: 'INFO',
                  message: 'errors.fileDirectory.solved',
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
  setloglevel(level: number | string) {
    if (typeof level == 'string') {
      if (this.loglevels.indexOf(level) != -1) {
        this.loglevel = this.loglevels.indexOf(level)
      } else {
        this.loglevel = 2
      }
    } else {
      this.loglevel = level
    }
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
  async log(loggingData: loggingData, type?: number | string) {
    if (loggingData.translate)
      loggingData.message = i18.t(loggingData.message, loggingData.T)
    if (loggingData.errors) {
      if (!Array.isArray(loggingData.errors))
        loggingData.message = loggingData.message + ' ' + loggingData.errors
      else {
        loggingData.errors.forEach(
          error => (loggingData.message = loggingData.message + ' ' + error)
        )
      }
    }

    // Defines log type
    if (type && typeof type == 'string') {
      if (this.loglevels.indexOf(type) != -1) {
        loggingData.name = type.toUpperCase()
        type = this.loglevels.indexOf(type)
      } else {
        loggingData.name = 'DEFAULT'
        type = 0
      }
    } else if (typeof type == 'number' && type < this.loglevels.length) {
      loggingData.name = this.loglevels[type].toUpperCase()
      type = type
    } else {
      loggingData.name = `DEFAULT`
      type = 0
    }

    // log to cloud logger
    if (this.constructData.gcp?.enabled) {
      if (!loggingData.metadata)
        loggingData.metadata = {
          resource: {
            type: 'global'
          },
          severity: loggingData.name
        }
      let entry = this.gcpLogger.entry(loggingData.metadata, loggingData)
      try {
        await this.gcpLogger.write(entry)
      } catch (err) {
        this.log(err, 5)
        this.constructData.gcp.enabled = false
      }
    }

    // Translate the metadata
    loggingData.name = await this.translate(
      `logging.${loggingData.name.toLowerCase()}`
    )

    // add spacing
    if (loggingData.name.length < 15) {
      for (let i = loggingData.name.length; i < 15; i++) {
        loggingData.name += ' '
      }
    }

    if (type >= this.loglevel || process.env.DEBUG == 'true' || type == 1) {
      // Log to local logger
      if (this.constructData.file?.enabled) {
        try {
          fs.appendFile(
            `${this.constructData.file?.config.logDirectory}/${this.constructData.file?.config.fileNamePattern}`,
            `${loggingData.name}     ` + loggingData.message + '\r\n',
            err => {
              if (err) throw err
            }
          )
        } catch (err) {
          this.log(err, 5)
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
            if (t == 4) scope.setLevel(this.sentry.Severity.Warning)
            else if (t == 5) scope.setLevel(this.sentry.Severity.Error)
            else if (t == 6) scope.setLevel(this.sentry.Severity.Critical)
            else if (t >= 7) scope.setLevel(this.sentry.Severity.Fatal)
            this.sentry.captureException(data)
          })
        } catch (_) {
          this.log(_, 5)
          this.constructData.sentry.enabled = false
        }
      }

      // @ts-expect-error Colorise
      loggingData.name = style.log[this.loglevels[type]](loggingData.name)

      if (!!this.constructData.console?.enabled)
        console.log(`${loggingData.name}     ` + loggingData.message)
    }
    return
  }

  translate(name: string): string {
    return i18.t(name)
  }

  /**
   * Used to shutdown logging - to ensure that all logs are processed
   * @author TGTGamer
   * @since 1.0.0-alpha
   */
  shutdown(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.sentry
        .close(2000)
        .then(async () => {
          await this.log(
            new Error('Logger successfully shutdown - safe to end all process'),
            2
          )
          resolve()
        })
        .catch(_ => reject(_))
    })
  }
}
