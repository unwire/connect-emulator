require("../css/main.styl");
// Core
const $ = require("jquery");

$(document).ready(() => {
    const $body = $("body");

    require("views").forEach(element => $body.append(element));

    $body.find(".emulatorVersion").html(`${__VERSION__}`);
    console.log("Ready.");
});
