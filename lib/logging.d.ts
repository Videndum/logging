import * as Sentry from '@sentry/node';
import { ConstructData, fileData, GCPData, loggingData, SentryData } from './types';
declare global {
    namespace NodeJS {
        interface Global {
            __rootdir__: string;
        }
    }
}
/**
 * Configures Chalk
 * @author TGTGamer
 * @since 1.0.0-alpha
 */
export declare const style: {
    brand: {
        videndumPurple: any;
    };
    log: {
        default: any;
        debug: any;
        info: any;
        notice: any;
        warn: any;
        error: any;
        critical: any;
        alert: any;
        emergency: any;
    };
};
/**
 * Main class used for package
 * @author TGTGamer
 * @since 1.0.0-alpha
 */
export declare class Log {
    private gcp;
    protected constructData: ConstructData;
    loglevel: number;
    readonly sentry: typeof Sentry;
    readonly loglevels: string[];
    private constructorLogs;
    gcpLogger: any;
    configured: boolean;
    constructor(constructData: ConstructData);
    configureLogger(constructData: ConstructData): Promise<void>;
    configureGCP(gcpData: GCPData): void;
    configureSentry(SentryData: SentryData): void;
    /**
     * Sets up local logging to file
     * @author TGTGamer
     * @since 1.0.0-alpha
     */
    configureFile(fileData: fileData): void;
    /**
     * Change the logging level.
     * @param {number | string} level - Logging level to use.
     */
    setloglevel(level: number | string): void;
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
    log(loggingData: loggingData, type?: number | string): Promise<void>;
    translate(name: string): string;
    /**
     * Used to shutdown logging - to ensure that all logs are processed
     * @author TGTGamer
     * @since 1.0.0-alpha
     */
    shutdown(): Promise<void>;
}
