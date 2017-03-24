const {EventEmitter} = require("events");
const Terminal = require("../terminal");

class Serial extends EventEmitter {

    constructor() {
        super();

        this._devices  = [];
        this._terminal = false;

        setTimeout(() => {
            this._refreshDevices();
        }, 0);
    }

    /**
     * Properties
     */

    get activeTerminal() {
        return this._terminal;
    }

    set activeTerminal(value) {
        this._terminal = value;
        this.emit("activeTerminal", value);
    }

    get devices() {
        return this._devices.slice(0);
    }

    /**
     * Methods: Internal
     */

    _refreshDevices() {
        clearTimeout(this._devicesTimer);

        const newDevices = [];

        chrome.serial.getDevices((ports) => {
            var didChange = false;

            for(var port of ports) {
                if (!port.vendorId || (port.path.indexOf("/cu.") === -1 && port.path.indexOf("COM") === -1)) {
                    continue;
                }

                newDevices.push({
                    name: port.displayName,
                    path: port.path,
                    vendorId: port.vendorId,
                });
            }

            if (this._devices.length != newDevices.length) {
                didChange = true;
            } else {
                this._devices.forEach(device => {
                    didChange = !didChange && !newDevices.find(d => d.path === device.path);
                })
            }

            if (didChange) {
                this._devices = newDevices;
                this.emit("devices", this.devices);
            }

            this._devicesTimer = setTimeout(() => {
                this._refreshDevices();
            }, 1000);
        });
    }

    /**
     * Methods: Control
     */

    async connect(path, emulator) {
        await this.disconnect();
        const terminal = Terminal.fromPathAndEmulator(path, emulator);

        terminal.on("disconnect", () => { this.activeTerminal = nil; });

        await terminal.connect();

        this.activeTerminal = terminal;

        return terminal;
    }

    async disconnect() {
        if (this.activeTerminal) {
            try {
                await this.activeTerminal.disconnect();
            }
            catch(e) {
                console.error("Error occurred while trying to disconnect from serial device:", e.toString());
            }

            this.activeTerminal = null;
        }
    }

}

chrome.serial.onReceive.addListener((event) => {
    if (exports.activeTerminal && event.data) {
        const bytes = new Uint8Array(event.data);
        exports.activeTerminal.didReceiveBytes(bytes);
    }
});

chrome.serial.onReceiveError.addListener((event) => {
    serial.disconnect();
});

module.exports = exports = new Serial();
