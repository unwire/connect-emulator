module.exports = {
    magicByte: 0x0A,
    versionNumber: 0x00,
    connectionEvent: 0x01,
    disconnectionEvent: 0x02,
    receiveEvent: 0x03,
    transmitRequest: 0x04,
    settings: 0x05,
    secondaryTerminalId: 0x06,
    pwmColor: 0x07,
    bootDone: 0x08,
    hardwareVersion: 0x09,
    bluetoothAddress: 0x0A,
    serialNumber: 0x0B,
    connectionInitiated: 0x0C,
    securitySetting: 0x0D,
    invalidCommand: 0xfe,
    dfuMode: 0xff,

    stringFromCommand: function(cmd) {
        switch (cmd) {
            case this.magicByte:
                return "magicByte";
            case this.versionNumber:
                return "versionNumber";
            case this.connectionEvent:
                return "connectionEvent";
            case this.disconnectionEvent:
                return "disconnectionEvent";
            case this.receiveEvent:
                return "receiveEvent";
            case this.transmitRequest:
                return "transmitRequest";
            case this.settings:
                return "settings";
            case this.secondaryTerminalId:
                return "secondaryTerminalId";
            case this.pwmColor:
                return "pwmColor";
            case this.bootDone:
                return "bootDone";
            case this.hardwareVersion:
                return "hardwareVersion";
            case this.bluetoothAddress:
                return "bluetoothAddress";
            case this.serialNumber:
                return "serialNumber";
            case this.connectionInitiated:
                return "connectionInitiated";
            case this.securitySetting:
                return "securitySetting";
            case this.invalidCommand:
                return "invalidCommand";
            case this.dfuMode:
                return "dfuMode";
            default:
                return "unknown";
        }
    }
};
