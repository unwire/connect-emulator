const $          = require("jquery");
const Emulator   = require("core/emulator");
const utils      = require("core/utils");
const Command    = require("core/terminal/command");
const InputView  = require("views/input");
const NumpadView = require("views/numpad");

const template = require("./view.pug");
const State = require("./state");

module.exports = exports = class extends Emulator {

    static get name() { return "Customer Demo"; }

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

        this._$el.find(".container-input").append(this._inputView.$el);
        this._$el.find(".container-numpad").append(this._numpadView.$el);

        this._inputView.on("commit", (value) => {
            this._amount = value;
            this._numpadView.isEnabled = false;
        });

        this._numpadView.on("decimal", (num) => this._inputView.decimal());
        this._numpadView.on("commit", (num) => this._inputView.commit());
        this._numpadView.on("number", (num) => this._inputView.number(num));

        const $autoMode = this._$el.find("#autoMode");
        $autoMode.click(() => {
            this._auto = $autoMode.is(":checked");
            this.reset();
        });
    }

    reset() {
        this._amount = false;
        this._inputView.cancel();
        this._numpadView.isEnabled = true;

        if(this._auto){
            if(! env.AUTO_COUNTER) {
              this._inputView.number(Math.floor((Math.random() * 15) + 190));
            } else {
              this._inputView.number(this._count++);
            }
            this._inputView.commit();
        }
    }

    /**
     * Methods: Handlers
     */

    handleState(packet) {
        const bytes = packet.slice(2);
        var state   = (packet[0] << 8), state = state | packet[1];

        switch (state) {
            case State.init:
                break

            case State.waitingForTransaction:
                this.writeCommand(
                    Command.transmitRequest,
                    State.waitingForTransactionAcknowledgement,
                    "1234567890123456789012"
                );
                break;

            case State.waitingForAmount:
                const commitAmount = () => {
                    this.writeCommand(
                        Command.transmitRequest,
                        State.waitingForAcknowledgement,
                        `${this._amount}|CAD|18`
                    );
                };

                if (this._amount) {
                    commitAmount();
                } else {
                    this._inputView.once("commit", (value) => {
                        this._amount = value;
                        commitAmount();
                    });
                }
                break;

            case State.waitingForCompleteTransaction:
                const status = utils.ab2str(bytes);
                var response = "failure";

                switch (status) {
                    case "accept":
                        response = Math.floor(Math.random() * 10) === 0 ? "decline" : "success";
                        break;
                    case "decline":
                        response = "decline";
                        break;

                    default:
                        break;
                }

                this.writeCommand(Command.transmitRequest, State.waitingForTermination, response);
                this.reset();
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

        if (err){
          return this.setColor(0, 0, 1);
        } else {
          return this.setColor(1, 1, 0);
        }
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
