const utils = require("../../utils");
const {Command} = require("../../terminal");
const BaseEmulator = require("../base");
// ...
const State = require("./state");
const CustomerDemoView = require("./view");

module.exports = exports = class CustomerDemo extends BaseEmulator {

    static get name() { return "Customer Demo"; }

    constructor(terminal) {
        super(terminal);

        this._view = new CustomerDemoView();

        this._el  = this._view.el;
        this._$el = this._view.$el;

        this.terminal.on(Command.connectionEvent, this.onConnectionEvent.bind(this));
        this.terminal.on(Command.disconnectionEvent, this.onDisconnectionEvent.bind(this));
        this.terminal.on(Command.connectionInitiated, this.onConnectionInitiated.bind(this));
        this.terminal.on(Command.receiveEvent, this.onReceiveEvent.bind(this));
        this.terminal.on(Command.transmitRequest, this.onTransmitRequest.bind(this));
    }

    /**
     * Methods: Control
     */

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
        super.write(buffer);
    }

    setColor(r, g, b) {
        const bytes = new Uint8Array(3);

        bytes[0] = r;
        bytes[1] = g;
        bytes[2] = b;

        this.write(Command.pwmColor, 0, bytes);
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
                this.write(
                    Command.transmitRequest,
                    State.waitingForTransactionAcknowledgement,
                    "1234567890123456789012"
                );
                this._view.status("Waiting for transaction...");
                break

            case State.waitingForTransactionAcknowledgement:
                console.log("waitingForTransactionAcknowledgement");
                break

            case State.waitingForCompleteTransaction:
                const status = utils.ab2str(bytes);
                var response = "failure";

                switch (status) {
                    case "accept":
                        response = "success";
                        break
                    case "decline":
                        response = "decline";
                        break

                    default:
                        break
                }

                this.write(Command.transmitRequest, State.waitingForTermination, response);
                this._view.reset();
                this._view.status("Transaction completed.");
                break

            case State.waitingForTermination:
                console.log("waitingForTermination");
                break

            case State.waitingForTerminationAcknowledgement:
                console.log("waitingForTerminationAcknowledgement");
                break

            case State.waitingForAmount:
                const commitAmount = () => {
                    this.write(
                        Command.transmitRequest,
                        State.waitingForAcknowledgement,
                        `${this._view.amount.toString()}|CAD|18`
                    );

                    this._view.status("Waiting for transaction acceptance...");
                };

                if (this._view.amount) {
                    commitAmount();
                } else {
                    this._view.once("amount", commitAmount);
                    this._view.status("Waiting for amount...");
                }
                break

            default:
                console.log("Unknown state:", state);
                break
        }
    }

    onConnectionEvent(header, packet){
        this.setColor(1, 1, 0);
        this._view.status("Device connected...");
    }

    onDisconnectionEvent(header, packet){
        this.setColor(0, 0, 1);
        this._view.status("Ready.");
    }

    onConnectionInitiated(header, packet){
        if (packet[0] === 0) {
            this.setColor(1, 1, 0);
        this._view.status("Device connecting...");
        } else {
            this.setColor(0, 0, 1);
        this._view.status("Device disconnecting...");
        }
    }

    onReceiveEvent(header, packet){
        this.handleState(packet);
    }

    onTransmitRequest(header, packet){
        this.setColor(1, 1, 0);
        this._view.status("Device connected...");
    }
};
