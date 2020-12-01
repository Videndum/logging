"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.style = void 0;
const tslib_1 = require("tslib");
const logging_1 = require("@google-cloud/logging");
const integrations_1 = require("@sentry/integrations");
const Sentry = tslib_1.__importStar(require("@sentry/node"));
const fs = tslib_1.__importStar(require("fs"));
const os_1 = tslib_1.__importDefault(require("os"));
const localize_1 = require("./localize");
const chalk = require('chalk');
global.__rootdir__ = __dirname || process.cwd();
/**
 * Configures Chalk
 * @author TGTGamer
 * @since 1.0.0-alpha
 */
exports.style = {
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
};
/**
 * Main class used for package
 * @author TGTGamer
 * @since 1.0.0-alpha
 */
class Logger {
    constructor(constructData) {
        this.gcp = new logging_1.Logging();
        this.loglevel = 1;
        this.sentry = Sentry;
        this.loglevels = [
            'DEFAULT',
            'DEBUG',
            'INFO',
            'NOTICE',
            'WARN',
            'ERROR',
            'CRITICAL',
            'ALERT',
            'EMERGENCY'
        ];
        this.constructorLogs = [];
        this.configured = false;
        this.constructData = constructData;
        if (process.env.LOGLEVEL)
            this.loglevel = +process.env.LOGLEVEL;
        this.configureLogger(constructData);
    }
    async configureLogger(constructData) {
        var _a, _b, _c;
        if ((_a = constructData.gcp) === null || _a === void 0 ? void 0 : _a.enabled)
            await this.configureGCP(constructData.gcp);
        if ((_b = constructData.sentry) === null || _b === void 0 ? void 0 : _b.enabled)
            await this.configureSentry(constructData.sentry);
        if ((_c = constructData.file) === null || _c === void 0 ? void 0 : _c.enabled)
            await this.configureFile(constructData.file);
        await this.constructorLogs.forEach(log => {
            this.log(log.data);
        });
        this.configured = true;
    }
    configureGCP(gcpData) {
        this.constructorLogs.push({
            data: {
                name: 'INFO',
                message: 'logging.gcp.constructor',
                translate: true
            },
            level: 1
        });
        this.gcp = new logging_1.Logging({ projectId: gcpData.projectid });
        this.gcpLogger = this.gcp.log(gcpData.logname);
    }
    configureSentry(SentryData) {
        this.constructorLogs.push({
            data: {
                name: 'INFO',
                message: 'logging.sentry.constructor',
                translate: true
            },
            level: 1
        });
        try {
            this.sentry.init(Object.assign(Object.assign({}, SentryData.config), { integrations: [
                    new Sentry.Integrations.Console(),
                    new Sentry.Integrations.Modules(),
                    new Sentry.Integrations.Http({ tracing: true }),
                    new integrations_1.RewriteFrames({ root: global.__rootdir__ })
                ], tracesSampleRate: 0.2 }));
            this.sentry.configureScope(scope => {
                var _a, _b, _c;
                if ((_a = SentryData.extras) === null || _a === void 0 ? void 0 : _a.user)
                    scope.setUser(SentryData.extras.user);
                if ((_b = SentryData.extras) === null || _b === void 0 ? void 0 : _b.tags)
                    SentryData.extras.tags.forEach(tag => {
                        scope.setTag(tag.key, tag.value);
                    });
                if ((_c = SentryData.extras) === null || _c === void 0 ? void 0 : _c.context)
                    SentryData.extras.context.forEach(context => {
                        scope.setContext(context.name, context.data);
                    });
            });
        }
        catch (_) {
            this.constructorLogs.push({
                data: {
                    name: 'INFO',
                    message: 'logging.sentry.error',
                    errors: _,
                    translate: true
                },
                level: 6
            });
        }
    }
    /**
     * Sets up local logging to file
     * @author TGTGamer
     * @since 1.0.0-alpha
     */
    configureFile(fileData) {
        this.constructorLogs.push({
            data: {
                name: 'INFO',
                message: 'logging.file.constructor',
                translate: true
            },
            level: 1
        });
        fs.access(fileData.config.logDirectory, fs.constants.F_OK, (err) => {
            if (!err) {
                return;
            }
            else {
                this.constructorLogs.push({
                    data: {
                        name: 'INFO',
                        message: 'errors.fileDirectory.caught',
                        errors: err,
                        translate: true
                    },
                    level: 6
                });
                fs.mkdir(fileData.config.logDirectory, { recursive: false }, async (err) => {
                    if (err)
                        this.constructorLogs.push({
                            data: {
                                name: 'INFO',
                                message: 'errors.fileDirectory.thrown',
                                errors: err,
                                translate: true
                            },
                            level: 6
                        });
                    else
                        this.constructorLogs.push({
                            data: {
                                name: 'INFO',
                                message: 'errors.fileDirectory.solved',
                                errors: err,
                                translate: true
                            },
                            level: 3
                        });
                });
                return;
            }
        });
    }
    /**
     * Change the logging level.
     * @param {number | string} level - Logging level to use.
     */
    setloglevel(level) {
        if (Number(level) == undefined) {
            this.loglevel = this.loglevels.indexOf(level);
        }
        else {
            this.loglevel = Number(level) / 100;
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
    async log(loggingData) {
        var _a, _b, _c, _d, _e, _f;
        if (loggingData.translate)
            loggingData.message = localize_1.i18.t(loggingData.message, loggingData.T);
        if (loggingData.errors) {
            if (!Array.isArray(loggingData.errors))
                loggingData.message = loggingData.message + ' ' + loggingData.errors;
            else {
                loggingData.errors.forEach(error => (loggingData.message = loggingData.message + ' ' + error));
            }
        }
        if (!loggingData.userData)
            loggingData.userData = {
                username: os_1.default.userInfo().username
            };
        (loggingData.userData.platform = os_1.default.platform()),
            (loggingData.userData.arch = os_1.default.arch()),
            (loggingData.userData.release = os_1.default.release());
        // Defines log type
        let type = Number(loggingData.name);
        if (type != NaN)
            type = type / 100;
        else
            type = this.loglevels.indexOf(loggingData.name);
        // log to cloud logger
        if ((_a = this.constructData.gcp) === null || _a === void 0 ? void 0 : _a.enabled) {
            try {
                if (!this.gcpLogger)
                    throw new Error("Can't log to google cloud platform without valid log configuration");
                if (!loggingData.metadata)
                    loggingData.metadata = {
                        resource: {
                            type: 'global'
                        },
                        severity: loggingData.name
                    };
                let entry = this.gcpLogger.entry(loggingData.metadata, loggingData.message);
                await this.gcpLogger.write(entry);
            }
            catch (err) {
                this.log(err);
                this.constructData.gcp.enabled = false;
            }
        }
        // Translate the metadata
        loggingData.name = await this.translate(`logging.${loggingData.name.toLowerCase()}`);
        // add spacing
        if (loggingData.name.length < 15) {
            for (let i = loggingData.name.length; i < 15; i++) {
                loggingData.name += ' ';
            }
        }
        if (type >= this.loglevel || process.env.DEBUG == 'true' || type == 1) {
            // Log to local logger
            if ((_b = this.constructData.file) === null || _b === void 0 ? void 0 : _b.enabled) {
                try {
                    fs.appendFile(`${(_c = this.constructData.file) === null || _c === void 0 ? void 0 : _c.config.logDirectory}/${(_d = this.constructData.file) === null || _d === void 0 ? void 0 : _d.config.fileNamePattern}`, `${loggingData.name}     ` + loggingData.message + '\r\n', err => {
                        if (err)
                            throw err;
                    });
                }
                catch (err) {
                    this.log(err);
                    this.constructData.file.enabled = false;
                }
            }
            // Log to sentry
            if (type >= 4 && ((_e = this.constructData.sentry) === null || _e === void 0 ? void 0 : _e.enabled)) {
                try {
                    const t = type, data = loggingData;
                    data.name = loggingData.message;
                    this.sentry.withScope(scope => {
                        var _a, _b, _c, _d, _e;
                        scope.setUser({
                            username: (_a = loggingData.userData) === null || _a === void 0 ? void 0 : _a.username,
                            email: (_b = loggingData.userData) === null || _b === void 0 ? void 0 : _b.email
                        });
                        scope.setContext('platform', {
                            string: (_c = loggingData.userData) === null || _c === void 0 ? void 0 : _c.platform
                        });
                        scope.setContext('arch', { string: (_d = loggingData.userData) === null || _d === void 0 ? void 0 : _d.arch });
                        scope.setContext('platform release', {
                            string: (_e = loggingData.userData) === null || _e === void 0 ? void 0 : _e.release
                        });
                        if (t == 4)
                            scope.setLevel(this.sentry.Severity.Warning);
                        else if (t == 5)
                            scope.setLevel(this.sentry.Severity.Error);
                        else if (t == 6)
                            scope.setLevel(this.sentry.Severity.Critical);
                        else if (t >= 7)
                            scope.setLevel(this.sentry.Severity.Fatal);
                        this.sentry.captureException(data);
                    });
                }
                catch (_) {
                    this.log(_);
                    this.constructData.sentry.enabled = false;
                }
            }
            // @ts-expect-error
            loggingData.name = exports.style.log[this.loglevels[type].toLowerCase()](loggingData.name);
            if (!!((_f = this.constructData.console) === null || _f === void 0 ? void 0 : _f.enabled))
                console.log(`${loggingData.name}     ` + loggingData.message);
        }
        return;
    }
    translate(name) {
        return localize_1.i18.t(name);
    }
    /**
     * Used to shutdown logging - to ensure that all logs are processed
     * @author TGTGamer
     * @since 1.0.0-alpha
     */
    shutdown() {
        return new Promise((resolve, reject) => {
            this.sentry
                .close(2000)
                .then(async () => {
                await this.log(new Error('Logger successfully shutdown - safe to end all process'));
                resolve();
            })
                .catch(_ => reject(_));
        });
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logging.js.map