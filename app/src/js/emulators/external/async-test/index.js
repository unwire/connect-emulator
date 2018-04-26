const $          = require("jquery");
const Emulator   = require("core/emulator");
const utils      = require("core/utils");
const Command    = require("core/terminal/command");
const InputView  = require("views/input");
const NumpadView = require("views/numpad");

const template = require("./view.pug");
const State = require("./state");

module.exports = exports = class extends Emulator {

    static get name() { return "Async Test"; }

    /**
     * Lifecycle
     */

    constructor(terminal) {
        super(terminal);

        this._count = 1;

        this._inputView  = new InputView();
        this._numpadView = new NumpadView();

        this._el  = template();
        this._$el = $(this._el);

        this.setColor(0, 0, 1);
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
        const merge = (a, b) => {
            const c = new Int8Array(a.length + b.length);

            c.set(a);
            c.set(b, a.length);

            return c;
        };

        const bytes = packet.slice(2);
        const dv    = new DataView(utils.uint8arr2ab(bytes), 0);
        var state   = (packet[0] << 8), state = state | packet[1];

        switch (state) {
            case State.request:
                let value, outgoing = new Uint8Array();

                this.log("> Received request for:");

                var pos = 0;

                while(pos < bytes.length) {
                    const id = dv.getUint16(pos, true);

                    switch (id) {
                        case 0: // Version
                            this.log(`- Version`);
                            value = utils.str2uint8arr("one-thousand!");
                            outgoing = merge(outgoing, utils.uint162uint8arr(id));
                            outgoing = merge(outgoing, utils.uint162uint8arr(value.length));
                            outgoing = merge(outgoing, value);
                            break;

                        case 1: // User-agent
                            this.log(`- User agent`);
                            value = utils.str2uint8arr(navigator.userAgent);
                            outgoing = merge(outgoing, utils.uint162uint8arr(id));
                            outgoing = merge(outgoing, utils.uint162uint8arr(value.length));
                            outgoing = merge(outgoing, value);
                            break;

                        case 2: // Epoch time
                            this.log(`- Epoch time`);
                            value = utils.str2uint8arr(Math.round((Date.now() / 1000)).toString());
                            outgoing = merge(outgoing, utils.uint162uint8arr(id));
                            outgoing = merge(outgoing, utils.uint162uint8arr(value.length));
                            outgoing = merge(outgoing, value);
                            break;

                        default:
                            this.log(`- Unknown tag #${id}`);
                            break;
                    }

                    pos += 2;
                }

                this.log(`< Responding to request`);
                this.writeCommand(Command.transmitRequest, State.response, outgoing);
                break

            case State.response:
                this.log("> Received response");
                break;

            default:
                console.log("Unknown state:", state);
                break;
        }
    }

    /**
     * Methods: Event handlers
     */

    onDeviceConnecting(header, packet) {
        const a = packet[0];
        const err = a === 1 ? 1 : 0;

        this.log("Device connecting...")

        if (err) {
          return this.setColor(0, 0, 1);
        } else {
          return this.setColor(1, 1, 0);
        }
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
