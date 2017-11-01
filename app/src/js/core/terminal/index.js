const {EventEmitter} = require("events");
const utils          = require("core/utils");
const Settings       = require("views/settings");

const Command = require("./command");
const Buffer  = require("./buffer");
const Header  = require("./header");

var ReadWriteLock = require('rwlock');
var lock = new ReadWriteLock();



class Terminal extends EventEmitter {

    constructor(path, emulator) {
        super();

        this._path = path;
        this._buffer = new Buffer();
        this._header = null;
        this._emulator = new emulator(this);
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
            console.debug(">", Command.stringFromCommand(this.currentHeader.command), Array.from(bytes));

            if (this.currentHeader) {
                this.didReceiveBytes(new Uint8Array());
            }
        } else {
            const packet = this.buffer.consume(this.currentHeader.expectedLength);

            if (packet) {
                console.debug(">>", Command.stringFromCommand(this.currentHeader.command), Array.from(packet));
                this.emit(this.currentHeader.command, this.currentHeader, packet);
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
            chrome.serial.connect(this.path, {
                bitrate: 115200,
            }, (connectionInfo) => {
                this._connectionInfo = connectionInfo;

                if (this.connectionInfo) {
                    chrome.serial.setControlSignals(this.id, { dtr: true, rts: true }, (success) => {
                        this.emit("serialConnected", true);
                        resolve(success);
                    });

                } else {
                    reject(chrome.runtime.lastError);
                }
            });
        });
    }

    flush() {
        return new Promise((resolve) => {
            const self = this;
            chrome.serial.flush(this.id, function(){
                setTimeout(function(){ // #NASTYHACK
                    chrome.serial.disconnect(self.id, (success) => {
                         this._connectionInfo = null;
                    });
                }, 25);

                resolve();
            });
        });
    }
    async disconnect() {
        try {
            await new Promise((resolve) => {
                const self = this;
                self._emulator.onSerialDisconnect();
                setTimeout(function(){ // #NASTYHACK
                    resolve();
                }, 25);
            });

            await this._emulator.writeCommand(Command.disconnectionEvent);

            await this.flush();
        }
        catch (e) {
            console.error(`Error: ${e.toString()}`);
        }
    }

    async write(bytes) {
        if (bytes.length > 1030){
            console.error("Error: Packet size too big. Sending failed.")
            return;
        }
        lock.writeLock(async (release) => {
            console.debug("<", Command.stringFromCommand(bytes[1]));
            const chunkSize = 1024;

            var buckets = [];
            var pos = 0;
            while (pos < bytes.length) {
                buckets.push(bytes.slice(pos, pos + chunkSize));
                pos += chunkSize;
            }
            for (var i = 0; i < buckets.length; i++) {
                var bucket = buckets[i];
                await this.writePart(bucket);
            }

            if (bytes[1] != Command.disconnectionEvent) {
                var timeoutMs = bytes.length * 6;
                if (timeoutMs < 1000)
                    timeoutMs = 1000;

                var timer = setTimeout(function () {
                    console.log(`Error: No response from dongle within timeout(${timeoutMs})`)
                    release();
                }, timeoutMs);

                this.once(bytes[1], (header, packet) => {
                    release();
                    clearTimeout(timer);
                });
            } else {
                release();
            }

        });
    }

    writePart(bytes) {
        return new Promise((resolve, reject) => {
            chrome.serial.send(this.id, utils.uint8arr2ab(bytes), (info) => {
                  console.debug("<<", Array.from(bytes));
                  if (info && info.bytesSent === bytes.length) {
                      resolve(true);
                  } else {
                      console.debug("<", "sending failed", info);
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
