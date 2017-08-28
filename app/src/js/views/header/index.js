const $         = require("jquery");
const emulators = require("emulators");
const serial    = require("core/serial");

const template  = require("./view.pug");

/**
 * Elements
 */
const $header    = $(template());
const $emulators = $header.find("select.emulators");
const $devices   = $header.find("select.devices");
const $button    = $header.find("button");

/**
 * Listen for changes in the serial connection
 */
serial.on("devices", (devices) => {
    $devices.html("");

    for(const device of devices) {
        $devices.append(`<option value="${device.path}">${device.name}</option>`);
    }

    if (devices.length === 0) {
        $devices.append(`<option disabled="disabled">No devices available</option>`);
    }
});

serial.on("activeTerminal", (terminal) => {
    const hasTerminal = !!terminal;

    $devices.prop("disabled", hasTerminal);
    $emulators.prop("disabled", hasTerminal);
    $button.html(hasTerminal ? "Disconnect" : "Connect");

    if (hasTerminal) {
        $header.addClass("connected");
    } else {
        $header.removeClass("connected");
    }
});

/**
 * Hook up the click event on our button
 */
$button.click(async () => {
    if (serial.activeTerminal) {
        serial.disconnect();
    } else {
        const path = $devices.val();
        const idx  = parseInt($emulators.val(), 10);

        if (path && path !== "" && idx >= 0) {
            serial.connect(path, emulators[idx]);
        }
    }
});

/**
 * Populate emulator tab
 */

const sortedEmulators = emulators.sort(function(a, b) {
   var nameA = a.name.toUpperCase();
   var nameB = b.name.toUpperCase();
   if (nameA < nameB) { return -1;}
   if (nameA > nameB) { return 1;}
   return 0;
 });

for(var i = 0; i < sortedEmulators.length; i++) {
    $emulators.append(`<option value="${i}">${sortedEmulators[i].name}</option>`);
}

if (sortedEmulators.length==1){
    $emulators.hide();
}


module.exports = exports = $header;
