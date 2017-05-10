const $              = require("jquery");
const {EventEmitter} = require("events");

const template = require("./view.pug");

module.exports = exports = class Input extends EventEmitter {

    /**
     * Lifecycle
     */

    constructor($el) {
        super();

        const self = this;

        this._$el = $(template());
        this._$el.find("button").click(function() {
            const input = $(this).data("input");

            switch (input) {
                case "commit":
                    self.emit("commit");
                    break

                case "decimal":
                    self.emit("decimal");
                    break

                default:
                    self.emit("number", input);
                    break
            }
        });
    }

    /**
     * Properties
     */

    get $el() {
        return this._$el;
    }

    get el() {
        return this._$el.get(0);
    }

    set isEnabled(value) {
        this._$el.find("button").prop("disabled", !value);
    }

};
