const path = require('path')
const fs = require('fs')
const { LANG } = require('./lang/index')
module.exports.release = ({ target }) => {
  const pkgPath = path.join(target, 'package.json')
  if (fs.existsSync(pkgPath)) {
    throw new Error(LANG.PKG_NOT_EXISTS)
  }
  const pkg = require(pkgPath)
  const option = Object.assign(
    {
      tag: true
    },
    pkg.yyr
  )
}
