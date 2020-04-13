const cmder = require('commander')
const pkg = require('../package.json')
const { release } = require('../index')

cmder.version(pkg.version)
cmder.name('yyr')
cmder.arguments('[target]')
cmder.action((target) => {
  release({ target: target || process.cwd() })
})

cmder.parse(process.argv)
