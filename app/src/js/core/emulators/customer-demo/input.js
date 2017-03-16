module.exports = exports = class Input {
    constructor($el) {
        this._$el = $el;
        this.cancel();
    }

    get value() {
        const float = parseFloat(`${this._first}.${this._second}`);

        return (isNaN(float) ? 0.0 : float).toFixed(4);
    }

    _update() {
        var formatted = this.value.replace(/0{0,2}$/, "").replace(/./g, function(c, i, a) {
            return i && c !== "." && ((a.length - i) % 3 === 0) ? ',' + c : c;
        });

        this._$el.html(formatted);
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
