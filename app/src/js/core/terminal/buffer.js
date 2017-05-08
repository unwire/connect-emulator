module.exports = exports = class Buffer {

    constructor() {
        this._buffer = new Uint8Array(0);
    }

    push(bytes) {
        var arr = bytes;

        if (bytes instanceof ArrayBuffer) {
            arr = new Uint8Array(bytes);
        }

        if (!(arr instanceof Uint8Array)) {
            throw new Error("You can only push a Uint8Array or an ArrayBuffer.");
        }

        const newBuffer = new Uint8Array(this._buffer.length + arr.length);

        newBuffer.set(this._buffer);
        newBuffer.set(arr, this._buffer.length);

        this._buffer = newBuffer;
    }

    peek(length) {
        if (this._buffer.length >= length) {
            return this._buffer.slice(0, length);
        }

        return false;
    }

    consume(length) {
        if (this._buffer.length >= length) {
            const result = this._buffer.slice(0, length);

            this._buffer = this._buffer.slice(length);

            return result;
        }

        return false;
    }

};
