const $ = require("jquery");
const {EventEmitter} = require("events");
const template = require("./demo.pug");
const Input = require("./input");

module.exports = exports = class CustomerDemoView extends EventEmitter {
    constructor() {
        super();

        this._el    = template();
        this._$el   = $(this._el);
        this._input = new Input(this._$el.find(".input"));
        this._auto = false;
        this._amount = false;

        $(document).keydown(this.handleKeyPress.bind(this));
        $(document).keypress(this.handleKeyPress.bind(this));

        this._$el.focus();

        const self = this;

        this._$el.find(".numpad button").click(function() {
            const input = $(this).data("input");

            switch (input) {
                case "commit":
                    self.commit();
                    break

                case "decimal":
                    self._input.decimal();
                    break

                default:
                    self._input.number(input);
                    break
            }
        });

        this._$el.find("#autoMode").click(function() {
            self._auto = $(this).is(":checked");
            self.reset();
        });

    }

    /**
     * Methods: Handlers
     */

    handleKeyPress(event) {
        if (event.target.nodeName != "INPUT"){
            if (this._amount) {
                return;
            }

            const code = event.keyCode;

            if (code === 8) {
                this._input.backspace();
            } else if (code === 27) {
                this._input.cancel();
            } else if (code === 13) {
                this.commit();
            } else if (!(code != 43 && code > 31 && (code < 48 || code > 57))) {
                this._input.number(String.fromCharCode(code));
            } else if ([110, 188, 190].indexOf(code) !== -1) {
                this._input.decimal();
            }

            return false;
        }
    }

    commit() {
        this._amount = this._input.value;
        this.emit("amount", this.amount);

        this._$el.find(".numpad button").prop("disabled", true);

        this._$el.focus();
    }

    reset() {
        this._amount = false;
        this._input.cancel();
        this._$el.find(".numpad button").prop("disabled", false);
        if(this._auto == true){
            this._input.number(Math.floor((Math.random() * 15) + 190));
            this.commit();
        }
    }
    status(text) {
        this._$el.find(".status").html(text);
    }

    /**
     * Properties
     */

    get $el() {
        return this._$el;
    }

    get el() {
        return this._el;
    }

    get amount() {
        return this._amount;
    }
}
