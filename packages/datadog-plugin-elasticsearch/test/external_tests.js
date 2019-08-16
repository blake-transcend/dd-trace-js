'use strict'

const normalizeTestConfigs = require('../../../scripts/helpers/normalizeTestConfigs')

const defaults = {
  integration: '@elastic/elasticsearch',
  repo: 'https://github.com/elastic/elasticsearch-js',
  framework: 'tap',
  args: 'test/unit/*.test.js test/behavior/*.test.js test/integration/index.js -t 300 --no-coverage'
}

const testConfigs = [
  {
    integration: 'elasticsearch',
    repo: 'https://github.com/elastic/elasticsearch-js-legacy',
    framework: 'mocha',
    args: 'test/unit/index.js'
  },
  {
    branch: '5.x'
  },
  {
    branch: '6.x'
  },
  {
    branch: '7.x'
  }
]

module.exports = normalizeTestConfigs(testConfigs, defaults)
