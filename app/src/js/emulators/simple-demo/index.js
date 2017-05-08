const $          = require("jquery");
const Emulator   = require("core/emulator");
const Command    = require("core/terminal/command");

const template = require("./view.pug");

module.exports = exports = class extends Emulator {

    static get name() { return "Simple Demo"; }

    /**
     * Lifecycle
     */

    constructor(terminal) {
        super(terminal);

        this._el  = template();
        this._$el = $(this._el);

        this._$el.find("button").click(this.commit.bind(this));

        $(document).keydown(this.handleKeyPress.bind(this));
        $(document).keypress(this.handleKeyPress.bind(this));

        this.deactivate();
    }

    /**
     * Methods: Internal
     */

    activate(){
        this._$el.find("button, .message").attr("disabled", false);
        this._$el.find(".message").focus();
    }

    deactivate(){
        this._$el.find("button, .message").attr("disabled", true);
        this.log("Tap terminal to proceed...")
    }

    log(msg){
        const $log = this.$el.find(".log");

        $log.append(`${msg}\n`);
        $log.scrollTop($log.get(0).scrollHeight);
    }

    commit() {
        const $msg = this._$el.find(".message");
        const msg  = $msg.val();

        this.log(`Sending: ${msg}`);
        this.writeCommand(Command.transmitRequest, 1, msg);
        $msg.val("");
        $msg.focus();
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

    /**
     * Methods: Handlers
     */

    handleState(packet) {
        const bytes = packet.slice(2);

        this.log(`Received: ${utils.ab2str(bytes)}`);
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
        this.activate();

        return this.setColor(1, 1, 0);
    }

    onDeviceDisconnected() {
        this.deactivate();

        return this.setColor(0, 0, 1);
    }

    onReceive(header, packet) {
        return this.handleState(packet);
    }

    onTransmit() {
        return this.setColor(1, 1, 0);
    }

}
