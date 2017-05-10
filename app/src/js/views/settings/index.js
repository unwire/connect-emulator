const $         = require("jquery");
const emulators = require("emulators");
const serial    = require("core/serial");

const template  = require("./view.pug");

const intAsBool = {
    "0": false,
    "1": true,
};

/**
 * Variables
 */
var updateHandler, isEnabled = false, settings = {
    version: 0,

    mode: 0,

    secondaryId: "0deadbeef0",

    isUsingMagnets: false,
    isConnectable:  false,
    isAdvertising:  false,

    isBlacklistEnabled:       false,
    isRssiVerficationEnabled: false,
};

/**
 * Elements
 */
const $settings = $(template());

$settings.find("input:not(input[type='text']), button").click(function() {
    settings.mode = parseInt($settings.find("input[name='mode']:checked").val(), 10) || 0;

    settings.secondaryId = $settings.find("input.secondary").val();

    settings.isUsingMagnets = $settings.find("input.usesMagnets").is(":checked");
    settings.isConnectable  = $settings.find("input.connectable").is(":checked");
    settings.isAdvertising  = $settings.find("input.advertising").is(":checked");
    settings.isBackgroundSupported = $settings.find("input.background").is(":checked");

    settings.isBlacklistEnabled       = $settings.find("input[name='blacklist']:checked").attr("id").indexOf("On") !== -1;
    settings.isRssiVerficationEnabled = $settings.find("input[name='rssiVerification']:checked").attr("id").indexOf("On") !== -1;

    if (updateHandler && typeof(updateHandler) === "function") {
        updateHandler(settings);
    }
});

module.exports = exports = $settings;

Object.defineProperty(exports, "settings", {
    get: function() { return settings; },
    set: function(newSettings) {
        settings = Object.assign({}, settings, newSettings);

        if (["0", "1", "2", "3"].indexOf(settings.mode.toString()) === -1) {
            settings.mode = 0;
        }

        $settings.find(".version").html(settings.version);

        $settings.find(`input[id='mode${settings.mode}']`).prop("checked", true);

        $settings.find("input.secondary").val(settings.secondaryId);

        $settings.find("input.usesMagnets").prop("checked", settings.isUsingMagnets);
        $settings.find("input.connectable").prop("checked", settings.isConnectable);
        $settings.find("input.advertising").prop("checked", settings.isAdvertising);
        $settings.find("input.background").prop("checked", settings.isBackgroundSupported);

        $settings.find(`input.blacklist${settings.isBlacklistEnabled ? "On" : "Off"}`).prop("checked", true);
        $settings.find(`input.rssiVerification${settings.isRssiVerficationEnabled ? "On" : "Off"}`).prop("checked", true);
    }
});

Object.defineProperty(exports, "updateHandler", {
    get: function() { return updateHandler; },
    set: function(handler) {
        updateHandler = handler;
    }
});

Object.defineProperty(exports, "isEnabled", {
    get: function() { return isEnabled; },
    set: function(enabled) {
        isEnabled = enabled;
        $settings.find("input, button").prop("enabled", isEnabled);
    }
});

exports.isEnabled = false;
