const $ = require("jquery");
const SettingsView = require("./view");

module.exports = exports = class Settings {

    static get name() { return "Settings"; }

    constructor(terminal) {
        this._view = new SettingsView(terminal);

        this._el  = this._view.el;
        this._$el = this._view.$el;

    }

    get $el() {
        return this._$el;
    }

    get el() {
        return this._el;
    }

};
