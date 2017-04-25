const $ = require("jquery");
const {EventEmitter} = require("events");

const utils = require("../../utils");
const {Command} = require("../../terminal");
const BaseEmulator = require("../base");

const template = require("./view.pug");


module.exports = exports = class SimpleDemo extends BaseEmulator {

static get name() { return "Simple Demo"; }

    constructor(terminal) {
        super(terminal);

        this._el    = template();
        this._$el   = $(this._el);
        var self = this;

        this._$el.find("button").click(this.commit.bind(this));

        this._$el.find(".message").focus();

        this.terminal.on(Command.settings, this.onSettings.bind(this));
        this.terminal.on(Command.connectionEvent, this.onConnectionEvent.bind(this));
        this.terminal.on(Command.disconnectionEvent, this.onDisconnectionEvent.bind(this));
        this.terminal.on(Command.connectionInitiated, this.onConnectionInitiated.bind(this));
        this.terminal.on(Command.receiveEvent, this.onReceiveEvent.bind(this));
        this.terminal.on(Command.transmitRequest, this.onTransmitRequest.bind(this));

        $(document).keydown(this.handleKeyPress.bind(this));
        $(document).keypress(this.handleKeyPress.bind(this));

        this.deactivate();

    }

    handleKeyPress(event) {
        const code = event.keyCode;

        if (code === 13 && this._$el.find("button").attr("disabled") != "disabled" ) {
            this.commit();
            return false;
        } else {
            return true;
        }
    }

    commit() {
        var msg = $(".message").val();
        this.log("Sending: " + msg);
        this.write(Command.transmitRequest, 1, msg);
        this._$el.find(".message").val("");
        this._$el.find(".message").focus();
    }

    write(command, state, data) {
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
        return super.write(buffer);
    }

    setColor(r, g, b) {
        const bytes = new Uint8Array(3);

        bytes[0] = r;
        bytes[1] = g;
        bytes[2] = b;

        return this.write(Command.pwmColor, 0, bytes);
    }

    onSettings(header, packet){
        if (!this._didGetInitialSettings) {
            this._didGetInitialSettings = true;
            const settings = new Uint8Array(1);
            settings[0] = packet[0] | 0x20;
            this.write(Command.settings, 0, settings);
        }
    }


    onConnectionEvent(header, packet){
        this.setColor(1, 1, 0);
        this.log("Device connected...");
        this.activate();
    }

    onDisconnectionEvent(header, packet){
        this.setColor(0, 0, 1);
        this.log("Device disconnected...");
        this.deactivate();
    }

    onConnectionInitiated(header, packet){
        if (packet[0] === 0) {
            this.setColor(1, 1, 0);
            this.log("Device connecting...");
        } else {
            this.setColor(0, 0, 1);
            this.log("Device disconnecting...");
        }
    }

    onReceiveEvent(header, packet){
        const bytes = packet.slice(2);
        this.log("Received: " + utils.ab2str(bytes));
    }

    onTransmitRequest(header, packet){
        this.setColor(1, 1, 0);
        // this.log("Transmitting...");
    }

    async onSerialDisconnect() {
        await this.write(0x04, 0x04, "failure");
        await this.setColor(0, 0, 1);
    }

    log(msg){
        var elem = this._$el.find("#simpleLog");
        elem.append(msg + "\n");
        elem.scrollTop(elem[0].scrollHeight);
    }

    activate(){
        this._$el.find("button, .message").attr("disabled", false);
        this._$el.find(".message").focus();
    }

    deactivate(){
        this._$el.find("button, .message").attr("disabled", true);
        this.log("Tap terminal to proceed...")
    }

}
