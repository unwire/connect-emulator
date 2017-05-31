const $         = require("jquery");
const serial    = require("core/serial");
const emulators = require("emulators");

const template = require("./view.pug");

/**
 * Elements
 */
const $tabs         = $(template());
const $itemEmulator = $tabs.find("ul.tabs li[data-tab='#tab-emulator']");
const $itemLog      = $tabs.find("ul.tabs li[data-tab='#tab-log']");
const $tabEmulator  = $tabs.find("section.tabs > div#tab-emulator");
const $tabSettings  = $tabs.find("section.tabs > div#tab-settings");
const $tabLog       = $tabs.find("section.tabs > div#tab-log");
const $log          = $tabLog.find("ul.log");
const $allTabs      = $tabs.find("section.tabs > div");
const $allItems     = $tabs.find("ul.tabs li");
const noConnection  = `<h1 class="not-connected">Choose a device ${emulators.length > 1?"and an emulator":""} &mdash; and press Connect.</h1>`;

/**
 * Variables
 */
const origConsole = window.console;
var numberOfUnreadLogEntries = 0, isLogActive = false;

/**
 * Helper methods
 */

function numberOfUnreadLogEntriesUpdated() {
    if (numberOfUnreadLogEntries === 0) {
        $itemLog.removeAttr("data-badge");
    } else {
        $itemLog.attr("data-badge", numberOfUnreadLogEntries);
    }
}

/**
 * Hook up event handlers
 */

serial.on("activeTerminal", (terminal) => {
    if (terminal) {
        $tabEmulator.html("");
        $tabEmulator.append(terminal.emulator.$el);
        $tabSettings.html("");
        $tabSettings.append(require("views/settings"));
    } else {
        $tabEmulator.html(noConnection);
        $tabSettings.html(noConnection);
    }
})

$allItems.click(function() {
    const $this = $(this);
    const tab   = $this.data("tab");
    const $tab  = $tabs.find(`section.tabs > div${tab}`);

    $allItems.removeClass("active");
    $allTabs.hide();

    $this.addClass("active");
    $tab.show();

    isLogActive = tab === "#tab-log";

    if (isLogActive) {
        numberOfUnreadLogEntries = 0;
        numberOfUnreadLogEntriesUpdated();
    }
});

/**
 * Replace global console
 */
window.console = {
    __logIt: (type, args) => {
        const final = [];

        for(const arg of args) {
            if (typeof(arg) !== "string") {
                final.push(JSON.stringify(arg));
            } else {
                final.push(arg);
            }
        }

        $log.prepend(`<li class="log-${type}"><pre>${final.join(" ")}</pre></li>`);

        if (!isLogActive) {
            numberOfUnreadLogEntries += 1;
            numberOfUnreadLogEntriesUpdated();
        }
    },

    log: (...args) => { console.__logIt("info", args); origConsole.log.apply(origConsole, args); },
    error: (...args) => { console.__logIt("error", args); origConsole.error.apply(origConsole, args); },
    warn: (...args) => { console.__logIt("warn", args); origConsole.warn.apply(origConsole, args); },
    debug: (...args) => {
      if(__WEBPACK__env.NODE_ENV != "production"){
        console.__logIt("debug", args);
        origConsole.debug.apply(origConsole, args);
      }
    },
    assert: (condition, ...args) => { if (!condition) { console.__logIt("error", args); }; args.unshift(condition); origConsole.assert.apply(origConsole, args); },
};

$itemEmulator.click();
$tabEmulator.html(noConnection);
$tabSettings.html(noConnection);

module.exports = exports = $tabs;
