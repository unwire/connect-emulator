const $          = require("jquery");
const Emulator   = require("core/emulator");
const Command    = require("core/terminal/command");
const utils      = require("core/utils");
const crypt      = require("core/utils/crypt");
const Forge = require('node-forge');

const template = require("./view.pug");

module.exports = exports = class extends Emulator {

    static get name() { return "Encrypted Demo"; }

    /**
     * Lifecycle
     */

    constructor(terminal) {
        super(terminal);

        let keypair = Forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 });

        // this.localPrivateKey = "MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCarwEq3Gks/PW4mzqymPOT2e0YQhrmXCWRbUFSacdwG25ciIiglKveZasJ64Z2NbdTmrOZO1R8LFUn0/2kJe6qsgTp4S3pzTZy82lPX/sLPkalSIaA83L3ub3y8TDQNW2dM5OazaN50rlPTXh3HBnWbPBIaM00OBeyDuspG1hIL76RLkfp19Y2qRl+HaA1my7NVdzbma+su+GmGfhsUj3L8W9gtys7gyS+Xfwsdtfc+2XQMxYcfG8EWRy4AdLngWiCgE88ee1CwB3Zzk0HYcu89cBUOfU009VRUCFGoeeUfA5AeT2YnXpHBrWuy7wAZ4ErFSKKtjTbdj8qYrA99V1JAgMBAAECggEAQH3Ogsw6naMp37n4kxXqGC64B3EoPfsVPrjKj03C9R66uKHENQ9HSQYidZRZD1f+A0Fwt+ZgpxTkvCJKkfGuvERUgB5+QghpNyv9MDbYOCvS0H6YdZMKz/YFGBEvRN/Bv9UNKXGrQtN0p3epTh/NNfVdiRMI20i3uGk36n+YIx/+wJUz+dqAMclLbKOUkyQHBlgYkceYHVZvurwRPkJAGymJ3O5kg+/+Srkd4PlaN4P62XGx0/Y/y425jn7Tt5ggJ7AlQMGw2ivvVC0pvRHTKE5WC2dyZ70LKENTPzOpduHY96VMCcPUxqtqcZiSGdewXX/MmozBTfjdpwTHbzW6AQKBgQDP2c72GOXyhUvmMJo5Fb1wiXaEY2RIuc6jI2/1ZwgKQk8erEJdjuDkOnRfGM/wKd3idvQHNGogVR2KH0Mc2wdhLe2wV03h9M1q3nq5PF33SscEdkXgktwQ41lYhZsyAisI147TfW7TDZxwm4KeJy0LRlT4HWRylxmUhRY4f6vM+QKBgQC+hDe9Toq8VxHmO8ve1eHrltDHC1azZES0IyOfT+jkEygFUS3sHuTdI/EHOi9J4RP40r01wPusi6dObOTqh7zGr4ZR1e3bJhp8HZM7QNghZvaSjUpoqXffEBmt3CG5LtLXE0LmFhYx5np8kXCU9nsC58jgw6beYtjnW7XKV0q20QKBgGIEuz7/OuGFzuc9IF2vTOkXSlbgcFiDl1kDyzaVYgtEff9fCOUKDjBTCLIYB2egtsyngCktpKaevRF38LRY7j/74s14PnhCc+TkCkf0mfOWxgfqpsVjPHiSXn4Kc8e/kf/Xd7lwu6S4FIBeNdjTbMCWaFehtM79Rsjtgi8etiwxAoGBAJ+q1cAdLB6uZjzrjnACFqZILk8yzIXqGb5S2M7yvL8w4tCZ+X+zYKGJNr6U3/7t2LwnehWr2AECxcPvdWatPePSRSMexIpvA7FTZAo7zScpUKsAKQVQSjszFiJkpAq8GE3SQbXtesp1W+A8T/s4G14S/YKJ1rb4Zsp3TQL4Z5CRAoGAAoRVI6lRQ8YWR5yDetAYLuvFTcxMcKWzlOhKIjJPEEKKE0Jfg837QVuD1KP2A4C49g4RnJi3BcN5tif9wimn9fv2Jwl90W6RUZvUdUwzAKpXqlFflcmwBFxdHPbnt7Lw8EiKKjLgFm+immJ+3T4CFimrZkKhQV8mdks/jPhekME=";
        // this.localPublicKey = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmq8BKtxpLPz1uJs6spjzk9ntGEIa5lwlkW1BUmnHcBtuXIiIoJSr3mWrCeuGdjW3U5qzmTtUfCxVJ9P9pCXuqrIE6eEt6c02cvNpT1/7Cz5GpUiGgPNy97m98vEw0DVtnTOTms2jedK5T014dxwZ1mzwSGjNNDgXsg7rKRtYSC++kS5H6dfWNqkZfh2gNZsuzVXc25mvrLvhphn4bFI9y/FvYLcrO4Mkvl38LHbX3Ptl0DMWHHxvBFkcuAHS54FogoBPPHntQsAd2c5NB2HLvPXAVDn1NNPVUVAhRqHnlHwOQHk9mJ16Rwa1rsu8AGeBKxUiirY023Y/KmKwPfVdSQIDAQAB";
        this.localPrivateKey = crypt.getPrivateKeyDer(keypair);
        this.localPublicKey = crypt.getPublicKeyDer(keypair);
        // this.remotePublicKey = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAl5Ltn9mhNbugzpZZP4tTOL8HDa8ADQEhQRJruFGRUihjR2zdGN05IrmNmkI3HKkDBIKMYTEkbvVG3yKRgawsjztO1Tb7AGrkPHeTKNBWC5OsoREwg+a+qR76XzEkBoh+T9189rz3NSMvMXQHgisIUVKPct+p6Rlqp+TanQh4tkf3w+x0fqVsYCmCFajhJYQbuh1XFTZcO2sQ8AN3WfjFa3+aqAes+vWkuEhG4dxL3AgWn3nXbB7Q0nd9QG3kl2MYoC7PXss5mv2xEemCa9G+KsfH/GDW+NEKPlLplrwi158x7rQ8KrkeChPt2aaU4IMxHoVlv4bRBCSUnR+hjt97ywIDAQAB";

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

        // let encrypted = CryptoJS.AES.encrypt(msg, this.encryptionKey, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
        let encrypted = crypt.encrypt(msg, this.remotePublicKey);

        this.writeCommand(Command.transmitRequest, 3, encrypted.toString());
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

        var state   = (packet[0] << 8), state = state | packet[1];
        switch (state) {
            case 0x00:
                var remotePublicKey = utils.ab2str(bytes);
                this.remotePublicKey = remotePublicKey.toString();
                this.writeCommand(Command.transmitRequest, 0x01, this.localPublicKey);
                break;
            case 0x02:
                const msg = utils.ab2str(bytes);
                let decrypted = crypt.decrypt(msg.toString(), this.localPrivateKey);
                this.log(`Received: ${decrypted}`);
                this.activate();
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
        const b = a === 0 ? 1 : 0;

        return this.setColor(1, 1, 0);
    }

    onDeviceConnected() {
        // this.activate();

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
