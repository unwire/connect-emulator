const $ = require("jquery");
const {EventEmitter} = require("events");
const utils = require("core/utils");
const settingsView = require("views/settings");
const Command = require("core/terminal/command");

module.exports = exports = class Base extends EventEmitter {

    static get name() { return "Unnamed"; }

    /**
     * Lifecycle
     */

    constructor(terminal) {
        super();

        settingsView.updateHandler = this.handleSettingsUpdated.bind(this);

        this._terminal = terminal;

        this._terminal.on(Command.connectionInitiated, this.onDeviceConnecting.bind(this));
        this._terminal.on(Command.connectionEvent, () => this.onDeviceConnected.bind(this));
        this._terminal.on(Command.disconnectionEvent, this.onDeviceDisconnected.bind(this));
        this._terminal.on(Command.receiveEvent, this.onReceive.bind(this));
        this._terminal.on(Command.transmitRequest, this.onTransmit.bind(this));

        [Command.versionNumber, Command.settings, Command.secondaryTerminalId, Command.securitySetting].forEach(cmd => {
            this._terminal.on(cmd, (header, packet) => this.handleSettingsReceived(cmd, packet));
        });

        this._terminal.on("serialConnected", (data) => this.writeCommand(Command.versionNumber));
    }

    /**
     * Methods: Settings handling
     */

    handleSettingsUpdated(settings) {
        var config;
        // 1: General settings
        config  = 0;
        config += settings.mode;

        if (settings.isUsingMagnets) {
            config |= 0x10;
        }

        if (settings.isConnectable) {
            config |= 0x20;
        }

        if (settings.isAdvertising) {
            config |= 0x40;
        }

        if (settings.isBackgroundSupported) {
            config |= 0x80;
        }

        this.writeCommand(Command.settings, "", [config])
        // Secondary terminal ID
        .then(() => this.writeCommand(Command.secondaryTerminalId, "", utils.toByteArray(settings.secondaryId).reverse()))
        // Security
        .then(() => {
            config = 0;

            if (settings.isBlacklistEnabled) {
                config += 1;
            }

            if (settings.isRssiVerficationEnabled) {
                config |= 2;
            }

            return this.writeCommand(Command.securitySetting, "", [config]);
        });
    }

    handleSettingsReceived(type, packet) {
        const settings = settingsView.settings;

        switch (type) {
        case Command.versionNumber:
            settings.version = ((packet[0] << 8) & 0xFF00) + (packet[1] & 0x00FF);

            this.writeCommand(Command.settings);
            break;

        case Command.settings:
            settings.isUsingMagnets = (packet[0] & 0x10) !== 0;
            settings.isConnectable  = (packet[0] & 0x20) !== 0;
            settings.isAdvertising  = (packet[0] & 0x40) !== 0;
            settings.isBackgroundSupported = (packet[0] & 0x80) !== 0;

            if (!this._didGetInitialSettings) {
                this.isConnectable = true;
            }

            settings.mode = (packet[0] & 0x0F);

            this.writeCommand(Command.secondaryTerminalId);
            break;

        case Command.secondaryTerminalId:
            settings.secondaryId = utils.toHexString(packet.reverse());

            this.writeCommand(Command.securitySetting);
            break;

        case Command.securitySetting:
            settings.isBlacklistEnabled = (packet[0] & 0x01) === 1;
            settings.isRssiVerficationEnabled = (packet[0] & 0x02) === 2;
            break;

        default:
            break;
        }

        settingsView.settings = settings;
    }

    /**
     * Methods: Control
     */

    writeCommand(command, state, data) {
        const dataArr = typeof(data || "") === "string" ? utils.str2uint8arr(data || "") : data;
        const dataLength = dataArr.length;

        // Build header
        const isTransmission = command === Command.transmitRequest;
        const bytes = new Uint8Array(isTransmission ? 6 : 4);

        bytes[0] = Command.magicByte;
        bytes[1] = command;
        bytes[2] = ((dataLength >> 8) & 0x00FF);
        bytes[3] = dataLength & 0x00FF;

        if (isTransmission) {
            bytes[4] = ((state >> 8) & 0x00FF);
            bytes[5] = state & 0x00FF;
        }

        // Concat header + data
        const buffer = new Uint8Array(bytes.length + dataLength);

        buffer.set(bytes);
        buffer.set(dataArr, bytes.length);

        // Send it
        return this.write(buffer);
    }

    write(bytes) {
        return this.terminal.write(bytes);
    }

    handle(header, bytes) { }

    setColor(r, g, b) {
        const bytes = new Uint8Array(3);

        bytes[0] = r;
        bytes[1] = g;
        bytes[2] = b;

        return this.writeCommand(Command.pwmColor, 0, bytes);
    }

    /**
     * Methods: Event handlers
     */

    onDeviceConnecting(header, packet) { }

    onDeviceConnected(header, packet) { }

    onDeviceDisconnected(header, packet) { }

    onReceive(header, packet) { }

    onTransmit(header, packet) { }

    onSerialDisconnect() { return this.writeCommand(0x04, 0x04, "failure"); }

    /**
     * Properties
     */

    get terminal() {
        return this._terminal;
    }

    get $el() {
        return this._$el;
    }

    get el() {
        return this._el;
    }

};
