import {BuildCtx, CompilerCtx, OutputTargetCustom} from '@stencil/core/internal'
import {Config} from '@stencil/core'
import {Entry, stream} from 'fast-glob'
import {rollup} from 'rollup'
import postcss from 'rollup-plugin-postcss'
import pl from '@pattern-lab/core'
import fs from 'fs'

const copyFiles = async () => {
  fs.copyFile('source/_uiExtend/index.html', 'public/index.html', () => {})
  var dir = 'public/styleguide/js'
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
  fs.copyFile('source/_uiExtend/js/nlx-ui-extend.js', dir + '/nlx-ui-extend.js', () => {})
}

//source: https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge
/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item)
}

/**
 * Deep merge two objects.
 * @param target
 * @param sources
 */
export function mergeDeep(target, ...sources) {
  if (!sources.length) return target
  const source = sources.shift()
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, {[key]: {}})
        mergeDeep(target[key], source[key])
      } else {
        Object.assign(target, {[key]: source[key]})
      }
    }
  }
  return mergeDeep(target, ...sources)
}

export const PatternlabOutput = (outputTargetOptions: any): OutputTargetCustom => {
  const defaultOutputTargetOptions: any = {
    rollupOptions: {
      input: 'source/scss/style.scss',
      plugins: [
        postcss({
          modules: true,
          extract: true
        })
      ]
    },
    rollupOutputOptions: {
      name: 'style',
      dir: './public/css',
      format: 'es'
    },
    sourceDir: 'source/**/*'
  }
  mergeDeep(defaultOutputTargetOptions, outputTargetOptions)
  return {
    type: 'custom',
    name: 'patternlab-output',

    validate(_config: Config) {},

    generator: async function (config: Config, compilerCtx: CompilerCtx, _buildCtx: BuildCtx) {
      if (!_buildCtx.isRebuild) {
        try {
          this.patternlabConfig = require('./patternlab-config-build.json')
        } catch (e) {
          this.patternlabConfig = require('./patternlab-config.json')
        }
        this.patternLab = pl(this.patternlabConfig)
      }
      if (_buildCtx.buildId == 1) {
        this.patternlabConfig = require('./patternlab-config.json')
        this.patternLab = pl(this.patternlabConfig)
      }

      //addWatchDir is not working with recursive option. When creating a new file npm run start needs to be launched again for it to watch the new file
      if (config.watch && !_buildCtx.isRebuild) {
        for await (const stats of stream(defaultOutputTargetOptions.sourceDir, {
          objectMode: true,
          unique: true,
          absolute: true
        })) {
          const {path, dirent} = stats as unknown as Entry
          if (dirent.isFile()) {
            compilerCtx.addWatchFile(path)
          } else if (dirent.isDirectory()) {
            compilerCtx.addWatchDir(path, false)
          }
        }
      }
      await this.patternLab.build(this.patternlabConfig)

      //not being able to extract CSS separately for every file of rollup entry points is a known issue this is a workaround which builds multiple rollup instances
      //https://github.com/egoist/rollup-plugin-postcss/issues/160
      //https://github.com/egoist/rollup-plugin-postcss/pull/276
      if (!defaultOutputTargetOptions.rollupOptions.length) {
        const rollupAppBuild = await rollup(defaultOutputTargetOptions.rollupOptions)
        await rollupAppBuild.write(defaultOutputTargetOptions.rollupOutputOptions)
      } else {
        await Promise.all(
          defaultOutputTargetOptions.rollupOptions.map(async (options, key) => {
            const rollupAppBuild = await rollup(options)
            if (defaultOutputTargetOptions.rollupOutputOptions[key]) {
              await rollupAppBuild.write(defaultOutputTargetOptions.rollupOutputOptions[key])
            } else {
              await rollupAppBuild.write(defaultOutputTargetOptions.rollupOutputOptions)
            }
          })
        )
      }

      copyFiles()
    }
  }
}