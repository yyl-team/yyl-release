# yyl-release
## install
```bash
yarn add yyl-release --dev
```
## usage
添加配置 到 `package.json`
```json
{
  "script": {
    "release": "yyr"
  },
  "yyr": {
    /** 自动 npm publish */
    "publish": true,
    /** 自动打 tag */
    "tag": true
  }
}
```
