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

    stringFromCommand: (cmd) => {
        switch (cmd) {
            case Command.magicByte:
                return "magicByte";
            case Command.versionNumber:
                return "versionNumber";
            case Command.connectionEvent:
                return "connectionEvent";
            case Command.disconnectionEvent:
                return "disconnectionEvent";
            case Command.receiveEvent:
                return "receiveEvent";
            case Command.transmitRequest:
                return "transmitRequest";
            case Command.settings:
                return "settings";
            case Command.secondaryTerminalId:
                return "secondaryTerminalId";
            case Command.pwmColor:
                return "pwmColor";
            case Command.bootDone:
                return "bootDone";
            case Command.hardwareVersion:
                return "hardwareVersion";
            case Command.bluetoothAddress:
                return "bluetoothAddress";
            case Command.serialNumber:
                return "serialNumber";
            case Command.connectionInitiated:
                return "connectionInitiated";
            case Command.securitySetting:
                return "securitySetting";
            case Command.invalidCommand:
                return "invalidCommand";
            case Command.dfuMode:
                return "dfuMode";
            default:
                return "unknown";
        }
    }
};
