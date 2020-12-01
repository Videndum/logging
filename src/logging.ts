import { Log, Logging } from '@google-cloud/logging'
import { RewriteFrames } from '@sentry/integrations'
import * as Sentry from '@sentry/node'
import * as fs from 'fs'
import os from 'os'
import { i18 } from './localize'
import {
  ConstructData,
  constructPair,
  fileData,
  GCPData,
  loggingData,
  LoggingLevels,
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
    default: chalk.inverse,
    debug: chalk.grey,
    info: chalk.green,
    notice: chalk.green,
    warn: chalk.white,
    error: chalk.yellow,
    critical: chalk.yellow,
    alert: chalk.red,
    emergency: chalk.red
  }
}

/**
 * Main class used for package
 * @author TGTGamer
 * @since 1.0.0-alpha
 */
export class Logger {
  private gcp: Logging = new Logging()
  protected constructData: ConstructData
  public loglevel: number = 1
  public readonly sentry = Sentry
  public readonly loglevels = [
    'DEFAULT',
    'DEBUG',
    'INFO',
    'NOTICE',
    'WARN',
    'ERROR',
    'CRITICAL',
    'ALERT',
    'EMERGENCY'
  ]
  private constructorLogs: constructPair[] = []
  gcpLogger: Log | undefined
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
      this.log(log.data)
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
  setloglevel(level: LoggingLevels) {
    if (Number(level) == undefined) {
      this.loglevel = this.loglevels.indexOf(level)
    } else {
      this.loglevel = Number(level) / 100
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
  async log(loggingData: loggingData) {
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
    if (!loggingData.userData)
      loggingData.userData = {
        username: os.userInfo().username
      }
    ;(loggingData.userData.platform = os.platform()),
      (loggingData.userData.arch = os.arch()),
      (loggingData.userData.release = os.release())

    // Defines log type
    let type = Number(loggingData.name)
    if (type != NaN) type = type / 100
    else type = this.loglevels.indexOf(loggingData.name)

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
      // @ts-expect-error
      loggingData.name = style.log[this.loglevels[type].toLowerCase()](
        loggingData.name
      )

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
            new Error('Logger successfully shutdown - safe to end all process')
          )
          resolve()
        })
        .catch(_ => reject(_))
    })
  }
}
