const $ = require("jquery");
const SettingsView = require("./view");
const Command = require("../../core/terminal/command");
const utils   = require("../../core/utils");

module.exports = exports = class Settings {

    static get name() { return "Settings"; }

    constructor(terminal) {
        this.terminal = terminal;
        this.meta = {};
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

    get getSettings(){
      this.write(Command.settings,"","");
    }

    showVersion(value){
      this._$el.find("#version").html(value);
    }

    showSettings(value){
      this._$el.find("#magnet").prop('checked', (value[0] & 0x10) == 0);
      this._$el.find("#connectable").prop('checked', (value[0] & 0x20) == 0);
      this._$el.find("#advertising").prop('checked', (value[0] & 0x30) == 0);

      if ((value[0] & 0x0F) == 1) {
        this._$el.find("#mode1").prop('checked', true);
      } else if ((value[0] & 0x0F) == 2) {
        this._$el.find("#mode2").prop('checked', true);
      } else if ((value[0] & 0x0F) == 3) {
        this._$el.find("#mode3").prop('checked', true);
      } else {
        this._$el.find("#mode0").prop('checked', true);
      }
    }

    showSecondayTerminalId(value){
      this._$el.find(".secondaryTerminalIdInput").val(utils.toHexString(value));
    }

    showSecuritySettings(value){
      if ((value[0] & 0x01) == 1) {
        this._$el.find("#blacklistOn").prop('checked', true);
      } else {
        this._$el.find("#blacklistOff").prop('checked', true);
      }

      if ((value[0] & 0x02) == 2) {
        this._$el.find("#rssiVerificationOn").prop('checked', true);
      } else {
        this._$el.find("#rssiVerificationOff").prop('checked', true);
      }
    }


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
        this.terminal.write(buffer);
    }

    handle(header, packet) {
        switch (header.command) {
            case Command.versionNumber:
                const version = ((packet[0] << 8) & 0xFF00) + (packet[1] & 0x00FF);
                console.debug("Version:", version);
                this.showVersion(version);
                this.meta.version = version;
                this.write(Command.settings);
                break;
            case Command.settings:
                if (!this._didGetInitialSettings) {
                    this._didGetInitialSettings = true;
                    const settings = new Uint8Array(1);
                    // settings[0] = packet[0] | 0x20;
                    this.showSettings(packet[0]);
                    this.write(Command.secondaryTerminalId);
                } else {
                    console.debug("Got settings", packet);
                }
                break;
            case Command.secondaryTerminalId:
                this.showSecondayTerminalId(packet);
                this.write(Command.securitySetting);
                break;
            case Command.securitySetting:
                this.showSecuritySettings(packet);
                break;
        }
    }
};
