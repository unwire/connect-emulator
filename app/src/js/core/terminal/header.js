const Command = require("./command");

module.exports = exports = class Header {

    static fromBytes(bytes) {
        if (bytes && bytes.length === 4) {
            return new Header(bytes);
        }

        return false;
    }

    constructor(bytes) {
        const cmd = bytes[1];
        var len   = (bytes[2] << 8) | bytes[3];

        if (cmd === Command.receiveEvent) {
            len += 2;
        }

        this._cmd = cmd;
        this._len = len;
    }

    get command() {
        return this._cmd;
    }

    get expectedLength() {
        return this._len;
    }

};
