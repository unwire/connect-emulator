const $ = require("jquery");
const {EventEmitter} = require("events");

module.exports = exports = class Base extends EventEmitter {

    static get name() { return "Unnamed"; }

    /**
     * Lifecycle
     */

    constructor(terminal) {
        super();

        this._terminal = terminal;
    }

    /**
     * Methods: Control
     */

    write(bytes) {
        return this.terminal.write(bytes);
    }

    handle(header, bytes) { }

    /**
     * Properties
     */

    get terminal() {
        return this._terminal;
    }

    get $el() {
        return this._$el;
    }

    get el() {
        return this._el;
    }

};
