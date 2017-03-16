require("../css/main.styl");
// Core
const $ = require("jquery");

$(document).ready(() => {
    const $body = $("body");

    require("./elements").forEach(element => $body.append(element));

    console.log("Ready.");
});
