const $ = require("jquery");
const Command = require("../../core/terminal/command");
const utils   = require("../../core/utils");
const template = require("./settings.pug");
// const {EventEmitter} = require("events");

module.exports = exports = class Settings {//extends EventEmitter {

    static get name() { return "Settings"; }

    constructor(terminal) {
        this.terminal = terminal;
        this._el = template();
        this._$el = $(this._el);
        const self = this;

        this._$el.find(".ability input, .mode input").click(function() {
            var sendSettings = 0;
        	if($("#mode1").is(":checked")) {
        		sendSettings = 1;
        	} else if($("#mode2").is(":checked")) {
        		sendSettings = 2;
        	} else if($("#mode3").is(":checked")) {
        		sendSettings = 3;
        	}

        	if($("#magnet").is(":checked")) {
        		sendSettings = sendSettings | 0x10;
        	}
        	if($("#connectable").is(":checked")) {
        		sendSettings = sendSettings | 0x20;
        	}
        	if($("#advertising").is(":checked")) {
        		sendSettings = sendSettings | 0x40;
        	}
            self.write(Command.settings, "", [sendSettings]);
        });

        this._$el.find(".security input").click(function() {
            var securitySettings = 0;
        	if($("#blacklistOn").is(":checked")) {
        		securitySettings = 1;
        	}

        	if($("#rssiVerificationOn").is(":checked")) {
        		securitySettings = securitySettings | 2;
        	}

            self.write(Command.securitySetting, "", [securitySettings]);
        });

        this._$el.find(".secondaryTerminalId button").click(function() {
            var setting = $(".secondaryTerminalIdInput").val();
            console.log(setting);
            console.log(utils.toByteArray(setting));
            self.write(Command.secondaryTerminalId, "", utils.toByteArray(setting));
        });
    }

    get $el() {
        return this._$el;
    }

    get el() {
        return this._el;
    }

    get getSettings(){
      this.write(Command.versionNumber);
    }

    showVersion(value){
      this._$el.find("#version").html(value);
    }

    showSettings(value){
      this._$el.find("#magnet").prop('checked', ((value & 0x10) != 0));
      this._$el.find("#connectable").prop('checked', ((value & 0x20) != 0));
      this._$el.find("#advertising").prop('checked', ((value & 0x40) != 0));

      if ((value & 0x0F) == 1) {
        this._$el.find("#mode1").prop('checked', true);
      } else if ((value & 0x0F) == 2) {
        this._$el.find("#mode2").prop('checked', true);
      } else if ((value & 0x0F) == 3) {
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
                this.showVersion(version);
                this.write(Command.settings);
                break;
            case Command.settings:
                this.showSettings(packet[0]);
                this.write(Command.secondaryTerminalId);
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

    // didConnect() {
    //     this.write(Command.versionNumber);
    // }

};
