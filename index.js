const path = require('path')
const fs = require('fs')
const extOs = require('yyl-os')
const chalk = require('chalk')
const print = require('yyl-print')

print.log.init({
  cmd: {
    text: 'CMD>',
    color: chalk.bgBlack.white
  }
})

const { LANG } = require('./lang/index')
module.exports.release = async ({ target }) => {
  const pkgPath = path.join(path.resolve(process.cwd(), target), 'package.json')
  if (!fs.existsSync(pkgPath)) {
    throw new Error(`${LANG.PKG_NOT_EXISTS}: ${pkgPath}`)
  }
  const pkg = require(pkgPath)
  const option = Object.assign(
    {
      tag: true,
      publish: true,
      mergeToMaster: true
    },
    pkg.yyr
  )

  /** 执行npm publish */
  if (option.publish) {
    print.log.cmd('npm publish')
    await extOs.runCMD('npm publish', target)
  }

  const { version } = pkg
  /** 获取当前 分支 */
  const curBranch = (await extOs.runCMD('git branch --contains', target, false))
    .trim()
    .replace(/^\* /, '')
  print.log.info(`${LANG.CUR_BRANCH}: ${chalk.cyan(curBranch)}`)

  /** 提交 */
  const changefileLog = (
    await extOs.runCMD('git status -s', target, false)
  ).trim()

  const changeTotal = changefileLog ? changefileLog.split(/[\r\n]+/g).length : 0
  print.log.info(`${LANG.STAGED_FILES}: ${chalk.cyan(changeTotal)}`)

  // 有更新
  if (changeTotal > 0) {
    print.log.info(`${LANG.PUSH_CUR_BRANCH_START}: ${curBranch}`)
    const cmds = [
      'git add .',
      `git commit -m "build: release ${version}"`,
      'git push'
    ]

    for (let i = 0; i < cmds.length; i++) {
      print.log.cmd(cmds[i])
      await extOs.runCMD(cmds[i], target)
    }

    print.log.success(`${LANG.PUSH_CUR_BRANCH_FINISHED}: ${curBranch}`)
  }

  /** 合并到 master */
  if (curBranch !== 'master' && option.mergeToMaster) {
    print.log.info(`${LANG.MERGE_TO_MASTER_START}: ${curBranch}`)
    const cmds = [
      'git checkout master',
      'git pull',
      `git merge ${curBranch}`,
      'git push'
    ]
    for (let i = 0; i < cmds.length; i++) {
      print.log.cmd(cmds[i])
      await extOs.runSpawn(cmds[i], target)
    }
    print.log.success(`${LANG.MERGE_TO_MASTER_FINISHED}: ${curBranch}`)
  }

  if (option.tag) {
    print.log.info(`${LANG.BUILD_TAG_START}`)
    const cmds = [`git tag -a v${version} -m "release ${version}"`]

    for (let i = 0; i < cmds.length; i++) {
      print.log.cmd(cmds[i])
      await extOs.runCMD(cmds[i], target).catch((er) => {
        print.log.error(er)
      })
    }
    print.log.success(`${LANG.BUILD_TAG_FINISHED}`)
  }
  print.log.success(LANG.ALL_IS_DONE)
}
