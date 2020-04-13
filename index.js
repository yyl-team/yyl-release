const path = require('path')
const fs = require('fs')
const extOs = require('yyl-os')

const { LANG } = require('./lang/index')
module.exports.release = async ({ target }) => {
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

  /** 执行npm publish */
  await extOs.runCMD('npm publish', target)

  const { version } = pkg
  /** 获取当前 分支 */
  const curBranch = (await extOs.runCMD('git branch --contains', target, false))
    .trim()
    .replace(/^\* /, '')
  print.log.info(`当前分支 ${curBranch}`)

  /** 提交 */
  const changefiles = (await extOs.runCMD('git status -s', target)).trim()

  // 有更新
  if (changefiles.length) {
    print.log.info(`提交当前分支(${curBranch}) 开始`)
    await extOs.runCMD('git add .', target)
    await extOs.runCMD(`git commit -m "build: release ${version}"`, target)
    await extOs.runCMD('git push', target)
    print.log.success(`提交当前分支(${curBranch}) 完成`)
  }

  /** 合并到 master */
  if (curBranch !== 'master') {
    print.log.info(`合并当前分支(${curBranch}) 到 master 开始`)
    await extOs.runCMD('git checkout master', target)
    await extOs.runCMD(`git pull`, target)
    await extOs.runCMD(`git merge ${curBranch}`, target)
    await extOs.runCMD('git push', target)
    print.log.success(`合并当前分支(${curBranch}) 到 master 完成`)
  }

  if (option.tag) {
    await extOs.runCMD(
      `git tag -a v${version} -m "build: release ${version}"`,
      target
    )
    print.log.success(`新建 v${version} tag 完成`)
  }
  print.log.success(`all is done`)
}
