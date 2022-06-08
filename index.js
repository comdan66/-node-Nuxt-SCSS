/**
 * @author      OA Wu <comdan66@gmail.com>
 * @copyright   Copyright (c) 2015 - 2022, @oawu/nuxt-scss
 * @license     http://opensource.org/licenses/MIT  MIT License
 * @link        https://www.ioa.tw/
 */

require('@oawu/xterm').stringPrototype()
require('@oawu/cli-progress').option.color = true

const { println, access, isFile, argv, Typeof, exists, isDirectory, mkdir, scanDir, during } = require('@oawu/helper')
const { create: Queue } = require('@oawu/queue')
const { title, done, fail } = require('@oawu/cli-progress')

const Path = require('path')
const FileSystem = require('fs')
const startAt = Date.now()

let ready = false

const PathRoot = Path.resolve(__dirname, ('..' + Path.sep).repeat(0)) + Path.sep
const cmdColor = (desc, action = null) => desc.lightGray.dim + (action !== null ? '：'.dim + action.lightGray.dim.italic : '')

Queue()
  .enqueue(next => {
    process.on('SIGINT', _ => process.exit(1))
    println(`\n ${'§'.dim} ${'啟動 OA\'s Nuxt.js SCSS、icon 轉化器'.bold}`)
    println("\n" + ' 【檢查開發環境】'.yellow)
    next()
  })
  .enqueue(next => {
    title('檢查參數', cmdColor('執行動作', 'check argvs'))
    const css = Path.resolve(PathRoot + Typeof.str.notEmpty.or(argv(['-C', '--css']), 'assets/css/')) + Path.sep
    const scss = Path.resolve(PathRoot + Typeof.str.notEmpty.or(argv(['-S', '--scss']), 'assets/scss/')) + Path.sep
    const icon = Path.resolve(PathRoot + Typeof.str.notEmpty.or(argv(['-I', '--icon']), 'assets/icon/')) + Path.sep
    done();

    const r = FileSystem.constants.R_OK
    const rw = r | FileSystem.constants.W_OK

    title('檢查設定檔內容', cmdColor('執行動作', 'verify Serve\'s config file'))
    exists(css) || mkdir(css)
    access(css, r) || fail(null, '沒有 ' + Path.relative(PathRoot, css) + Path.sep + ' ' + (r == rw ? '讀寫' : '讀取') + '權限')
    isDirectory(css) || fail(null, '路徑 ' + Path.relative(PathRoot, css) + Path.sep + ' 不是一個目錄')
    
    exists(scss) || mkdir(scss)
    access(scss, rw) || fail(null, '沒有 ' + Path.relative(PathRoot, scss) + Path.sep + ' ' + (rw == rw ? '讀寫' : '讀取') + '權限')
    isDirectory(scss) || fail(null, '路徑 ' + Path.relative(PathRoot, scss) + Path.sep + ' 不是一個目錄')

    exists(icon) || mkdir(icon)
    access(icon, r) || fail(null, '沒有 ' + Path.relative(PathRoot, icon) + Path.sep + ' ' + (r == rw ? '讀寫' : '讀取') + '權限')
    isDirectory(icon) || fail(null, '路徑 ' + Path.relative(PathRoot, icon) + Path.sep + ' 不是一個目錄')
    next({ css, scss, icon }, done());
  })
  .enqueue((next, config) => {
    println("\n 【編譯檔案】".yellow)
    const Process = require('child_process')
      
    const Factory = require('./Factory')
    Factory.config = config
    Factory.root = PathRoot

    Queue()
      .enqueue(next => title('清空 CSS 目錄', cmdColor('執行指令', 'rm -rf ' + Path.relative(PathRoot, config.css) + Path.sep + '*'))
        && Process.exec('rm -rf ' + config.css + '*', error => error ? fail(null, error) : next(done())))

      .enqueue(next => title('檢查 ICON 功能', cmdColor('執行動作', 'verify icon/*/style.css'))
        && Promise.all(scanDir(config.icon, false)
          .map(path => path + Path.sep + 'style.css')
          .filter(file => exists(file))
          .map(file => new Promise((resolve, reject) => Factory.Icon('first', file).build(errors => errors.length
            ? reject(errors)
            : resolve()))))
        .then(_ => next(done()))
        .catch(errors => fail(null, ...errors)))

      .enqueue(next => title('檢查 SCSS 功能', cmdColor('執行動作', 'verify scss/*/*.scss'))
        && setTimeout(_ => Promise.all(scanDir(config.scss)
          .filter(file => Path.extname(file) == '.scss')
          .map(file => new Promise((resolve, reject) => Factory.Scss('first', file).build(errors => errors.length
            ? reject(errors)
            : resolve()))))
        .then(_ => next(Factory, config, done()))
        .catch(errors => fail(null, ...errors)), 500))
      .enqueue(_ => next(Factory, config, done()))
  })
  .enqueue((next, Factory, config) => {
    
    title('監控 FILE 檔案', cmdColor('執行動作', 'watch files'))
    
    require('chokidar')
      .watch([config.scss + '**' + Path.sep + '*', config.icon + '**' + Path.sep + '*'])
      .on('add', file    => ready && Factory('create', file))
      .on('change', file => ready && Factory('update', file))
      .on('unlink', file => ready && Factory('delete', file))
      .on('error', error => ready ? title('監聽 FILE 檔案時發生錯誤！').fail(null, error) : fail(null, error))
      .on('ready', _ => next(done()))
  })
  .enqueue(next => {
    println("\n 【準備開發】".yellow)
    println(' '.repeat(3) + '🎉 Yes! 環境已經就緒惹！')
    println(' '.repeat(3) + '⏰ 啟動耗費時間' + '：'.dim + during(startAt).lightGray)
    println(' '.repeat(3) + '🚀 Go! Go! Go! 趕緊來開發囉！')
    println("\n 【開發紀錄】".yellow)
    ready = true
  })
