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
        this.log("Tap terminal to proceed...")

        const $muted = this._$el.find("#muted");
        $muted.click(() => {
            this._muted = $muted.is(":checked");
            console.log("Muted: " + this._muted);
        });


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
        const msg = utils.ab2str(bytes);
        if (this._muted){
          const $log = this.$el.find(".log");
          $log.append(".");
        } else {
          this.log(`Echo: ${msg}`);
          this.log(` - ${bytes} (${bytes.length}b)`);
        }
        this.writeCommand(Command.transmitRequest, 1, bytes);
    }

    /**
     * Methods: Event handlers
     */

    onDeviceConnecting(header, packet) {
        const a = packet[0];
        const b = a === 0 ? 1 : 0;
        this.log("Device connecting...")
        return this.setColor(1, 1, 0);
    }

    onDeviceConnected() {
        this.log("Device connected...")
        return this.setColor(1, 1, 0);
    }

    onDeviceDisconnected() {
        this.log("Device disconnected...")
        return this.setColor(0, 0, 1);
    }

    onReceive(header, packet) {
        return this.handleState(packet);
    }

    onTransmit() {
        return this.setColor(1, 1, 0);
    }

}
