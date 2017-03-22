const {EventEmitter} = require("events");
const Command = require("./command");
const Buffer  = require("./buffer");
const Header  = require("./header");
const utils   = require("../utils");
const Settings = require("../../elements/settings");

class Terminal extends EventEmitter {

    constructor(path, emulator) {
        super();

        this._path = path;
        this._buffer = new Buffer();
        this._header = null;
        this._emulator = new emulator(this);
        this._settings = new Settings(this);
    }

    /**
     * Properties
     */

    get id() {
        return (this._connectionInfo || { connectionId: -1 }).connectionId;
    }

    get emulator() {
        return this._emulator;
    }

    get settings() {
        return this._settings;
    }

    get path() {
        return this._path;
    }

    get connectionInfo() {
        return this._connectionInfo;
    }

    get buffer() {
        return this._buffer;
    }

    get currentHeader() {
        return this._header;
    }

    /**
     * Methods: Handlers
     */

    didReceiveBytes(bytes) {
        this.buffer.push(bytes);

        if (!this.currentHeader) {
            this._header = Header.fromBytes(this.buffer.consume(4));

            if (this.currentHeader) {
                this.didReceiveBytes(new Uint8Array());
            }
        } else {
            const packet = this.buffer.consume(this.currentHeader.expectedLength);

            if (packet) {
                this.emulator.handle(this.currentHeader, packet);
                this.settings.handle(this.currentHeader, packet);
                this._header = null;
            }
        }
    }

    /**
     * Methods: Control
     */

    connect() {
        return new Promise((resolve, reject) => {
            if (this.connectionInfo) {
                return resolve(false);
            }
            console.debug("Connecting to: " + this.path);
            chrome.serial.connect(this.path, {
                bitrate: 115200,
            }, (connectionInfo) => {
                this._connectionInfo = connectionInfo;

                if (this.connectionInfo) {
                    chrome.serial.setControlSignals(this.id, { dtr: true, rts: true }, (success) => {
                        resolve(success);
                    });
                    console.debug("Connected..");
                    this.settings.getSettings;
                } else {
                    reject(chrome.runtime.lastError);
                }
            });
        });
    }

    disconnect() {
        return new Promise((resolve, reject) => {
            chrome.serial.disconnect(this.id, (success) => {
                this._connectionInfo = null;
                resolve();
            });
        });
    }

    write(bytes) {
        return new Promise((resolve, reject) => {
            chrome.serial.send(this.id, utils.uint8arr2ab(bytes), (info) => {
                if (info && info.bytesSent === bytes.length) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }
}

module.exports = exports = {
    fromPathAndEmulator: function(path, emulator) {
        return new Terminal(path, emulator);
    },
    Command,
};
