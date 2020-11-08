"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = exports.style = void 0;
const tslib_1 = require("tslib");
const logging_1 = require("@google-cloud/logging");
const integrations_1 = require("@sentry/integrations");
const Sentry = tslib_1.__importStar(require("@sentry/node"));
const fs = tslib_1.__importStar(require("fs"));
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
        emergency: chalk.red // (800) One or more systems are unusable.
    }
};
/**
 * Main class used for package
 * @author TGTGamer
 * @since 1.0.0-alpha
 */
class Log {
    constructor(constructData) {
        this.gcp = new logging_1.Logging();
        this.loglevel = 1;
        this.sentry = Sentry;
        this.loglevels = [
            'default',
            'debug',
            'info',
            'notice',
            'warn',
            'error',
            'critical',
            'alert',
            'emergency' // (800) One or more systems are unusable.
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
            this.log({ name: log.data }, log.level);
        });
        this.configured = true;
    }
    configureGCP(gcpData) {
        this.constructorLogs.push({ data: 'logging.gcp.constructor', level: 1 });
        this.gcp = new logging_1.Logging({ projectId: gcpData.projectid });
        this.gcpLogger = this.gcp.log(gcpData.logname);
    }
    configureSentry(SentryData) {
        this.constructorLogs.push({ data: 'logging.sentry.constructor', level: 1 });
        try {
            this.sentry.init(Object.assign(Object.assign({}, SentryData.config), { integrations: [new integrations_1.RewriteFrames({ root: global.__rootdir__ })] }));
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
            this.constructorLogs.push({ data: 'logging.sentry.error' + _, level: 6 });
        }
    }
    /**
     * Sets up local logging to file
     * @author TGTGamer
     * @since 1.0.0-alpha
     */
    configureFile(fileData) {
        this.constructorLogs.push({ data: 'logging.file.constructor', level: 1 });
        fs.access(fileData.config.logDirectory, fs.constants.F_OK, (err) => {
            if (!err) {
                return;
            }
            else {
                this.constructorLogs.push({
                    data: 'errors.fileDirectory.caught' + err,
                    level: 6
                });
                fs.mkdir(fileData.config.logDirectory, { recursive: false }, async (err) => {
                    if (err)
                        this.constructorLogs.push({
                            data: 'errors.fileDirectory.thrown' + err,
                            level: 6
                        });
                    else
                        this.constructorLogs.push({
                            data: `errors.fileDirectory.solved`,
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
        if (typeof level == 'string') {
            if (this.loglevels.indexOf(level) != -1) {
                this.loglevel = this.loglevels.indexOf(level);
            }
            else {
                this.loglevel = 2;
            }
        }
        else {
            this.loglevel = level;
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
    async log(loggingData, type) {
        var _a, _b, _c, _d, _e, _f;
        // Meta for Cloud Logging
        let metadata = {
            resource: {
                type: 'global'
            },
            severity: 'INFO'
        };
        let data;
        if (loggingData.error)
            data = loggingData.error;
        else if (loggingData.name)
            data = localize_1.i18.t(loggingData.name, loggingData.translate);
        else if (loggingData.raw)
            data = loggingData.raw;
        else {
            this.log({ name: 'errors.logging' });
            return false;
        }
        // Defines log type
        if (type && typeof type == 'string') {
            if (this.loglevels.indexOf(type) != -1) {
                metadata.severity = type.toUpperCase();
                type = this.loglevels.indexOf(type);
            }
            else {
                metadata.severity = 'DEFAULT';
                type = 0;
            }
        }
        else if (typeof type == 'number' && type < this.loglevels.length) {
            metadata.severity = this.loglevels[type].toUpperCase();
            type = type;
        }
        else {
            metadata.severity = `DEFAULT`;
            type = 0;
        }
        // log to cloud logger
        if ((_a = this.constructData.gcp) === null || _a === void 0 ? void 0 : _a.enabled) {
            let entry = this.gcpLogger.entry(metadata, data);
            try {
                await this.gcpLogger.write(entry);
            }
            catch (err) {
                this.log({ raw: `Thrown error: ${err}` }, 6);
            }
        }
        // Translate the metadata
        metadata.severity = await this.translate(`logging.${metadata.severity.toLowerCase()}`);
        // add spacing
        if (metadata.severity.length < 15) {
            for (let i = metadata.severity.length; i < 15; i++) {
                metadata.severity += ' ';
            }
        }
        if (type >= this.loglevel || process.env.DEBUG == 'true' || type == 1) {
            // Log to local logger
            if ((_b = this.constructData.file) === null || _b === void 0 ? void 0 : _b.enabled) {
                try {
                    fs.appendFile(`${(_c = this.constructData.file) === null || _c === void 0 ? void 0 : _c.config.logDirectory}/${(_d = this.constructData.file) === null || _d === void 0 ? void 0 : _d.config.fileNamePattern}`, `${metadata.severity}     ` + data + '\r\n', err => {
                        if (err)
                            this.log({ error: err.message }, 5);
                    });
                }
                catch (_g) { }
            }
            // @ts-expect-error Colorise
            metadata.severity = exports.style.log[`${this.loglevels[type]}`](metadata.severity);
            if (!!((_e = this.constructData.console) === null || _e === void 0 ? void 0 : _e.enabled))
                console.log(`${metadata.severity}     ` + data);
            // Log to sentry
            if (type > 4 && ((_f = this.constructData.sentry) === null || _f === void 0 ? void 0 : _f.enabled)) {
                try {
                    const t = type;
                    this.sentry.withScope(scope => {
                        if (t == 5)
                            scope.setLevel(this.sentry.Severity.Error);
                        else if (t > 6)
                            scope.setLevel(this.sentry.Severity.Fatal);
                        this.sentry.captureMessage(data);
                    });
                }
                catch (_) {
                    this.log({ error: _ }, 4);
                }
            }
        }
        return true;
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
                await this.log({ raw: 'Logger successfully shutdown - safe to end all processes' }, 2);
                resolve();
            })
                .catch(_ => reject(_));
        });
    }
}
exports.Log = Log;
//# sourceMappingURL=logging.js.map