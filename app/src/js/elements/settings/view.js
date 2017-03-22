const $ = require("jquery");
const {EventEmitter} = require("events");
const template = require("./settings.pug");
// const serial = require("../../core/serial");
// const Input = require("./input");

module.exports = exports = class SettingsView extends EventEmitter {
    constructor(terminal) {
        super();
        this._el = template();
        this._$el = $(this._el);
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
}
