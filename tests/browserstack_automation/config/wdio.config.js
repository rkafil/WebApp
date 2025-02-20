const { driver } = require('@wdio/globals');
const { readFileSync } = require('fs');
const browserStackConfig = require('./browserstack.config');
const browserCapabilities = require('../capabilities/browser.json');

let mobileCapabilities = [];

try {
  const data = readFileSync('./tests/browserstack_automation/capabilities/mobile.json', { encoding: 'utf8' });
  mobileCapabilities = JSON.parse(data);
} catch (error) {
  // Run `npm run wdio:setup`
}

const capabilities = [...browserCapabilities, ...mobileCapabilities];

const date = new Date();

const dateForDisplay = date.toDateString();

const buildName = `${browserStackConfig.NAME}: ${dateForDisplay}`;

// https://webdriver.io/docs/configurationfile

module.exports.config = {
  user: browserStackConfig.BROWSERSTACK_USER,
  key: browserStackConfig.BROWSERSTACK_KEY,
  injectGlobals: false,
  updateJob: true,
  reporters: [
    [
      'spec',
      {
        onlyFailures: true,
      },
    ],
  ],
  specs: [
    '../specs/*.js',
  ],
  capabilities,
  commonCapabilities: {
    'bstack:options': {
      buildName,
      debug: 'true',
      // geoLocation is only available under Enterprise plans
      // geoLocation: 'US-CA',
      // gpsLocation is only available under Paid plans
      // Oakland, CA, USA
      gpsLocation: '37.804363,-122.271111',
      maskCommands: 'setValues, getValues, setCookies, getCookies',
      // video: 'false',
    },
  },
  maxInstances: 1,
  exclude: [],
  logLevel: 'error',
  coloredLogs: true,
  baseUrl: browserStackConfig.WEB_APP_ROOT_URL,
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 1,
  services: [['browserstack']],
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
  },
  // https://webdriver.io/docs/customcommands#examples
  before: function before () {
    driver.addCommand('findAndClick', async function findAndClick () {
      await this.scrollIntoView({ block: 'center', inline: 'center' });
      await this.click();
    }, true);
  },
};

module.exports.config.capabilities.forEach((capability) => {
  const device = capability;
  const keys = Object.keys(device);
  keys.forEach((key) => {
    if (key in module.exports.config.commonCapabilities) {
      device[key] = {
        ...device[key],
        ...module.exports.config.commonCapabilities[key],
      };
    }
  });
});
