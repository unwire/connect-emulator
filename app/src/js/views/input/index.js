const $              = require("jquery");
const {EventEmitter} = require("events");

const template = require("./view.pug");

module.exports = exports = class Input extends EventEmitter {

    /**
     * Lifecycle
     */

    constructor($el) {
        super();

        this._$el = $(template());
        this.cancel();

        $(document).keydown(this._handleKeyPress.bind(this));
        $(document).keypress(this._handleKeyPress.bind(this));
    }

    /**
     * Methods: Internal
     */

    _update() {
        var formatted = this.value.replace(/0{0,2}$/, "").replace(/./g, function(c, i, a) {
            return i && c !== "." && ((a.length - i) % 3 === 0) ? ',' + c : c;
        });

        this._$el.html(formatted);

        this.emit("changed", this.value);
    }

    _handleKeyPress(event) {
        if (event.target.nodeName != "INPUT") {
            if (this._commited) {
                return;
            }

            const code = event.keyCode;

            if (code === 8) {
                this.backspace();
            } else if (code === 27) {
                this.cancel();
            } else if (code === 13) {
                this.commit();
            } else if (!(code != 43 && code > 31 && (code < 48 || code > 57))) {
                this.number(String.fromCharCode(code));
            } else if ([110, 188, 190].indexOf(code) !== -1) {
                this.decimal();
            }

            return false;
        }
    }

    /**
     * Properties
     */

    get value() {
        const float = parseFloat(`${this._first}.${this._second}`);

        return (isNaN(float) ? 0.0 : float).toFixed(4);
    }

    get $el() {
        return this._$el;
    }

    get el() {
        return this._$el.get(0);
    }

    get committed() {
        return this._commited || false;
    }

    set committed(value) {
        this._commited = value;
    }

    /**
     * Methods: Control
     */

    commit() {
        this._commited = true;
        this.emit("commit", this.value);
    }

    cancel() {
        this._first    = "";
        this._second   = "";
        this._pastDecimal = false;
        this._update();
    }

    number(num) {
        if (this._pastDecimal) {
            if (this._second.length === 2) {
                return;
            }

            this._second += num;
        } else {
            this._first += num;
        }

        this._update();
    }

    decimal() {
        if (this._pastDecimal) {
            return;
        }

        this._pastDecimal = true;
    }

    backspace() {
        if (this._pastDecimal) {
            if (this._second.length === 0) {
                this._pastDecimal = false;
            } else {
                this._second = this._second.substr(0, this._second.length - 1);
            }
        } else {
            this._first = this._first.substr(0, this._first.length - 1);
        }

        this._update();
    }

};
