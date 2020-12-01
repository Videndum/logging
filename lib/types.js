"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggingData = void 0;
class loggingData extends Error {
    constructor(name, message, errors, options) {
        super(message);
        this.name = name;
        this.errors = errors;
        this.translate = options === null || options === void 0 ? void 0 : options.translate;
        this.userData = options === null || options === void 0 ? void 0 : options.userData;
        this.T = options === null || options === void 0 ? void 0 : options.T;
        this.metadata = options === null || options === void 0 ? void 0 : options.metadata;
        // restore prototype chain
        const actualProto = new.target.prototype;
        Object.setPrototypeOf(this, actualProto);
    }
}
exports.loggingData = loggingData;
//# sourceMappingURL=types.js.map