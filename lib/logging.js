'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.loggingData = exports.Logger = exports.style = void 0
const tslib_1 = require('tslib')
const logging_1 = require('@google-cloud/logging')
const integrations_1 = require('@sentry/integrations')
const Sentry = tslib_1.__importStar(require('@sentry/node'))
const chalk_1 = tslib_1.__importDefault(require('chalk'))
const fs = tslib_1.__importStar(require('fs'))
const os_1 = tslib_1.__importDefault(require('os'))
const localize_1 = require('./localize')
global.__rootdir__ = __dirname || process.cwd()
/**
 * Configures Chalk
 * @author TGTGamer
 * @since 1.0.0-alpha
 */
exports.style = {
  brand: {
    videndumPurple: chalk_1.default.hex('4B428E')
  }
}
/**
 * Main class used for package
 * @author TGTGamer
 * @since 1.0.0-alpha
 */
class Logger {
  constructor(options) {
    this.gcp = new logging_1.Logging()
    this.loglevel = 1
    this.sentry = Sentry
    this.loglevels = [
      {
        name: 'DEFAULT',
        chalk: chalk_1.default.inverse
      },
      {
        name: 'DEBUG',
        chalk: chalk_1.default.grey
      },
      {
        name: 'INFO',
        chalk: chalk_1.default.green
      },
      {
        name: 'NOTICE',
        chalk: chalk_1.default.greenBright
      },
      {
        name: 'WARN',
        chalk: chalk_1.default.white
      },
      {
        name: 'ERROR',
        chalk: chalk_1.default.yellow
      },
      {
        name: 'CRITICAL',
        chalk: chalk_1.default.yellow
      },
      {
        name: 'ALERT',
        chalk: chalk_1.default.red
      },
      {
        name: 'EMERGENCY',
        chalk: chalk_1.default.red
      }
    ]
    this.constructorLogs = []
    this.configured = false
    this.i18 = new localize_1.Localizer()
    this.main(options)
  }
  async main(options) {
    this.constructData = options.logger
    await this.i18.main(options.i18)
    if (options.logger.logLevel) this.setloglevel(options.logger.logLevel)
    else if (process.env.LOGLEVEL) this.loglevel = +process.env.LOGLEVEL
    this.configureLogger(options.logger)
  }
  async configureLogger(constructData) {
    var _a, _b, _c
    if (
      (_a = constructData.gcp) === null || _a === void 0 ? void 0 : _a.enabled
    )
      await this.configureGCP(constructData.gcp)
    if (
      (_b = constructData.sentry) === null || _b === void 0
        ? void 0
        : _b.enabled
    )
      await this.configureSentry(constructData.sentry)
    if (
      (_c = constructData.file) === null || _c === void 0 ? void 0 : _c.enabled
    )
      await this.configureFile(constructData.file)
    await this.constructorLogs.forEach(log => {
      this.log(log.data)
    })
    this.configured = true
  }
  async configureGCP(gcpData) {
    this.constructorLogs.push({
      data: {
        name: '200',
        message: 'videndum:logging.gcp.constructor',
        translate: true
      },
      level: 1
    })
    this.gcp = new logging_1.Logging({ projectId: gcpData.projectid })
    this.gcpLogger = this.gcp.log(gcpData.logname)
  }
  async configureSentry(SentryData) {
    this.constructorLogs.push({
      data: {
        name: '200',
        message: 'videndum:logging.sentry.constructor',
        translate: true
      },
      level: 1
    })
    try {
      this.sentry.init(
        Object.assign(Object.assign({}, SentryData.config), {
          integrations: [
            new Sentry.Integrations.Console(),
            new Sentry.Integrations.Modules(),
            new Sentry.Integrations.Http({ tracing: true }),
            new integrations_1.RewriteFrames({ root: global.__rootdir__ })
          ],
          tracesSampleRate: 0.2
        })
      )
      this.sentry.configureScope(scope => {
        var _a, _b, _c
        if (
          (_a = SentryData.extras) === null || _a === void 0 ? void 0 : _a.user
        )
          scope.setUser(SentryData.extras.user)
        if (
          (_b = SentryData.extras) === null || _b === void 0 ? void 0 : _b.tags
        )
          SentryData.extras.tags.forEach(tag => {
            scope.setTag(tag.key, tag.value)
          })
        if (
          (_c = SentryData.extras) === null || _c === void 0
            ? void 0
            : _c.context
        )
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
  async configureFile(fileData) {
    this.constructorLogs.push({
      data: {
        name: '200',
        message: 'videndum:logging.file.constructor',
        translate: true
      },
      level: 1
    })
    fs.access(fileData.config.logDirectory, fs.constants.F_OK, err => {
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
          async err => {
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
  async setloglevel(level) {
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
  async log(loggingData) {
    var _a, _b, _c, _d, _e
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
        username: os_1.default.userInfo().username
      }
    ;(loggingData.userData.platform = os_1.default.platform()),
      (loggingData.userData.arch = os_1.default.arch()),
      (loggingData.userData.release = os_1.default.release())
    // Defines log type
    let type = Number(loggingData.name) / 100
    // log to cloud logger
    if (
      (_a = this.constructData.gcp) === null || _a === void 0
        ? void 0
        : _a.enabled
    ) {
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
      if (
        (_b = this.constructData.file) === null || _b === void 0
          ? void 0
          : _b.enabled
      ) {
        try {
          fs.appendFile(
            `${
              (_c = this.constructData.file) === null || _c === void 0
                ? void 0
                : _c.config.logDirectory
            }/${
              (_d = this.constructData.file) === null || _d === void 0
                ? void 0
                : _d.config.fileNamePattern
            }`,
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
      if (
        type >= 4 &&
        ((_e = this.constructData.sentry) === null || _e === void 0
          ? void 0
          : _e.enabled)
      ) {
        try {
          const t = type,
            data = loggingData
          data.name = loggingData.message
          this.sentry.withScope(scope => {
            var _a, _b, _c, _d, _e
            scope.setUser({
              username:
                (_a = loggingData.userData) === null || _a === void 0
                  ? void 0
                  : _a.username,
              email:
                (_b = loggingData.userData) === null || _b === void 0
                  ? void 0
                  : _b.email
            })
            scope.setContext('platform', {
              string:
                (_c = loggingData.userData) === null || _c === void 0
                  ? void 0
                  : _c.platform
            })
            scope.setContext('arch', {
              string:
                (_d = loggingData.userData) === null || _d === void 0
                  ? void 0
                  : _d.arch
            })
            scope.setContext('platform release', {
              string:
                (_e = loggingData.userData) === null || _e === void 0
                  ? void 0
                  : _e.release
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
  async translate(name) {
    return this.i18.t(name)
  }
  /**
   * Used to shutdown logging - to ensure that all logs are processed
   * @author TGTGamer
   * @since 1.0.0-alpha
   */
  async shutdown() {
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
exports.Logger = Logger
class loggingData extends Error {
  constructor(name, message, options) {
    super(message)
    this.name = name
    this.errors =
      options === null || options === void 0 ? void 0 : options.errors
    this.translate =
      options === null || options === void 0 ? void 0 : options.translate
    this.userData =
      options === null || options === void 0 ? void 0 : options.userData
    this.T = options === null || options === void 0 ? void 0 : options.T
    this.metadata =
      options === null || options === void 0 ? void 0 : options.metadata
    // restore prototype chain
    // @ts-ignore
    const actualProto = new.target.prototype
    if (actualProto) Object.setPrototypeOf(this, actualProto)
  }
}
exports.loggingData = loggingData
//# sourceMappingURL=logging.js.map
