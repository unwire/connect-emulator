const $ = require("jquery");
const Command = require("../../core/terminal/command");
const utils   = require("../../core/utils");
const template = require("./settings.pug");

module.exports = exports = class Settings {

    static get name() { return "Settings"; }

    constructor(terminal) {
        this.terminal = terminal;
        this._el = template();
        this._$el = $(this._el);
        const self = this;

        this.terminal.on("serialConnected", (data) => {
            this.write(Command.versionNumber);
        });

        this.terminal.on(Command.versionNumber, this.handleVersion.bind(this));
        this.terminal.on(Command.settings, this.handleSettings.bind(this));
        this.terminal.on(Command.secondaryTerminalId, this.handleSecondayTerminalId.bind(this));
        this.terminal.on(Command.securitySetting, this.handleSecuritySettings.bind(this));

        this._$el.find(".ability input, .mode input").click(() => {
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

        this._$el.find(".security input").click(() => {
            var securitySettings = 0;
        	if($("#blacklistOn").is(":checked")) {
        		securitySettings = 1;
        	}

        	if($("#rssiVerificationOn").is(":checked")) {
        		securitySettings = securitySettings | 2;
        	}

            self.write(Command.securitySetting, "", [securitySettings]);
        });

        this._$el.find(".terminalId button").click(() => {
            var setting = $(".terminalId input").val();
            self.write(Command.secondaryTerminalId, "", utils.toByteArray(setting));
        });
    }

    get $el() {
        return this._$el;
    }

    get el() {
        return this._el;
    }

    handleVersion(header, packet){
        const version = ((packet[0] << 8) & 0xFF00) + (packet[1] & 0x00FF);
        this._$el.find("#version").html(version);
        this.write(Command.settings);
    }

    handleSettings(header, packet){
      this._$el.find("#magnet").prop('checked', ((packet[0] & 0x10) != 0));
      this._$el.find("#connectable").prop('checked', ((packet[0] & 0x20) != 0));
      this._$el.find("#advertising").prop('checked', ((packet[0] & 0x40) != 0));

      if ((packet[0] & 0x0F) == 1) {
        this._$el.find("#mode1").prop('checked', true);
      } else if ((packet[0] & 0x0F) == 2) {
        this._$el.find("#mode2").prop('checked', true);
      } else if ((packet[0] & 0x0F) == 3) {
        this._$el.find("#mode3").prop('checked', true);
      } else {
        this._$el.find("#mode0").prop('checked', true);
      }
      this.write(Command.secondaryTerminalId);
    }

    handleSecondayTerminalId(header, packet){
      this._$el.find(".secondaryTerminalIdInput").val(utils.toHexString(packet));
      this.write(Command.securitySetting);
    }

    handleSecuritySettings(header, packet){
      if ((packet[0] & 0x01) == 1) {
        this._$el.find("#blacklistOn").prop('checked', true);
      } else {
        this._$el.find("#blacklistOff").prop('checked', true);
      }

      if ((packet[0] & 0x02) == 2) {
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
};
