// PREF: This may slow us down startup times for some tools where its used.
require('@live/simple-cli-helper')()
require('./main.ts').default().then().catch(e => console.error(e))
