'use strict'

process.env.NODE_ENV = 'production'

const _ = require('lodash')
const ora = require('ora')
const rm = require('rimraf')
const path = require('path')
const chalk = require('chalk')
const parallelWebpack = require('parallel-webpack')
const utils = require('./utils')
let deleteDirs = []

if (utils.deployModule.length) {
  deleteDirs = utils.deployModule.map(module =>
    path.posix.join(__dirname, '../dist', `${module}-dist`)
  )
} else {
  console.log(chalk.red('  There are no modules can be builded.\n'))
  process.exit(1)
}

utils.deployModule.forEach(module => {
  console.log(
    chalk.cyan(`parallel building [${module} Module] for production...\n`)
  )
})

// const spinner = ora(`parallel building for production...\n`);
// spinner.start();

deleteDirs.forEach((path, index) => {
  rm(path, err => {
    if (err) throw err
    if (index === deleteDirs.length - 1) {
      const run = parallelWebpack.run
      run(
        require.resolve('./webpack.prod.parallel.conf.js'),
        {
          watch: false,
          maxRetries: 1,
          stats: true,
          maxConcurrentWorkers: 2
        },
        function(err, stats) {
          // spinner.stop();
          let hasErrors = false
          let statsArr = []
          if (err && err.stats) {
            statsArr.push(err.stats)
          }
          if (Array.isArray(stats)) {
            statsArr = _.concat(statsArr, stats)
          }
          statsArr.forEach(stat => {
            let rs = JSON.parse(stat)
            if (Array.isArray(rs.errors) && rs.errors.length) {
              hasErrors = true
              rs.errors.forEach(err => {
                console.log(chalk.yellow(err.toString()))
              })
            }
          })
          if (hasErrors) {
            console.log(chalk.red('  Build failed with errors.\n'))
            process.exit(1)
          }

          console.log(chalk.cyan('  Build complete.\n'))
          console.log(
            chalk.yellow(
              '  Tip: built files are meant to be served over an HTTP server.\n' +
                "  Opening index.html over file:// won't work.\n"
            )
          )
          process.exit(0)
        }
      )
    }
  })
})
