# Getting started for external developers
* Go to [releases](https://github.com/unwire/connect-emulator/releases) and download the latest binary
* Open Chrome
* Type `chrome://extensions` in the address bar
* Drag the downloaded (and unzipped) *.crx file into the Chrome Extensions window
* Launch the `Unwire Connect Emulator` app from within Chrome

# Getting started for internal developers
Clone the repository and ensure you've got access to our internal git hosting server. `cd` into the repository and run `git submodule update --init --recursive`. After that, see the below commands.

### Usage
* Install webpack globally -- `npm install -g webpack`
* Install package modules -- `npm install`
* Run development mode -- `npm run dev`
* Build for production -- `npm run build`
* Create Chrome package -- `npm run crx`
