const $          = require("jquery");
const Emulator   = require("core/emulator");
const Command    = require("core/terminal/command");
const utils      = require("core/utils");

const template = require("./view.pug");

module.exports = exports = class extends Emulator {

    static get name() { return "Echo Demo"; }

    /**
     * Lifecycle
     */

    constructor(terminal) {
        super(terminal);

        this._el  = template();
        this._$el = $(this._el);
    }

    /**
     * Methods: Internal
     */

    log(msg){
        const $log = this.$el.find(".log");

        $log.append(`${msg}\n`);
        $log.scrollTop($log.get(0).scrollHeight);
    }


    /**
     * Methods: Handlers
     */

    handleState(packet) {
        const bytes = packet.slice(2);

        this.log(`Received: ${utils.ab2str(bytes)}`);
        const msg = utils.ab2str(bytes);
        this.log(`Sending: ${msg}`);
        this.writeCommand(Command.transmitRequest, 1, msg);
    }

    /**
     * Methods: Event handlers
     */

    onDeviceConnecting(header, packet) {
        const a = packet[0];
        const b = a === 0 ? 1 : 0;

        return this.setColor(1, 1, 0);
    }

    onDeviceConnected() {

        return this.setColor(1, 1, 0);
    }

    onDeviceDisconnected() {
        return this.setColor(0, 0, 1);
    }

    onReceive(header, packet) {
        return this.handleState(packet);
    }

    onTransmit() {
        return this.setColor(1, 1, 0);
    }

}
