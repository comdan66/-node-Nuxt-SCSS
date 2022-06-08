# OA's Nuxt.js scss 轉換工具

OA's Nuxt.js scss 轉換工具 🔺


## 說明
這是一個給 Nuxt.js 編譯 scss 的轉譯工具！

基於 npm 上的 [@oawu/scss](https://www.npmjs.com/package/@oawu/scss) 開發的應用工具。

## 安裝

```shell
npm install @oawu/nuxt-scss
```

## 使用

1. 於 `~/assets/` 內建立 `css`、`scss`、`icon` 目錄
2. 於專案目錄的終端機內執行 `npx oawu-scss` 即可開始編譯

## 參數

可以指定目錄，預設是在 `assets` 目錄
* 指定 css 目錄 `-C` 或 `--css`，例如專案目錄下的 `assets/oa/css` 就執行 `npx oawu-scss -C assets/oa/css`
* 指定 scss 目錄 `-S` 或 `--scss`，例如專案目錄下的 `assets/oa/scss` 就執行 `npx oawu-scss -S assets/oa/scss`
* 指定 icon 目錄 `-I` 或 `--icon`，例如專案目錄下的 `assets/oa/icon` 就執行 `npx oawu-scss -I assets/oa/icon`

> 如果不存在的路徑，則會幫你建立目錄