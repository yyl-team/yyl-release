const path = require('path')
const fs = require('fs')
const { release } = require('../../')
const extOs = require('yyl-os')
const extFs = require('yyl-fs')

const GITCASE_PATH = path.join(__dirname, '../__gitcase')
const PJ_PATH = path.join(GITCASE_PATH, 'yyl-release-test')

const changeVersion = (str) => {
  const arr = str.split('.')
  return `${arr.slice(0, arr.length - 1).join('.')}.${+arr.pop() + 1}`
}
describe('usage test', () => {
  beforeEach(async () => {
    if (fs.existsSync(PJ_PATH)) {
      await extOs.runCMD('git reset --hard', PJ_PATH)
      await extOs.runCMD('git pull', PJ_PATH)
      await extOs.runCMD('git checkout test', PJ_PATH)
    } else {
      await extFs.removeFiles(GITCASE_PATH, true)
      await extFs.mkdirSync(GITCASE_PATH)
      await extOs.runCMD(
        'git clone https://github.com/jackness1208/yyl-release-test.git',
        GITCASE_PATH
      )
    }
  })

  it('git ctrl test', async () => {
    /** 修改 文件 */
    const editPath = path.join(PJ_PATH, 'index.js')
    const pkgPath = path.join(PJ_PATH, 'package.json')
    const editCnt = fs.readFileSync(editPath).toString()
    const pkg = require(pkgPath)
    pkg.version = changeVersion(pkg.version)
    fs.writeFileSync(editPath, `${editCnt}\nconsole.log('test ${+new Date()}')`)
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
    await release({ target: PJ_PATH })
  })
})
