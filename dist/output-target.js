"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.patternLabOutputTarget = exports.mergeDeep = exports.isObject = void 0;
const fast_glob_1 = require("fast-glob");
const rollup_1 = require("rollup");
const rollup_plugin_postcss_1 = require("rollup-plugin-postcss");
const core_1 = require("@pattern-lab/core");
const fs_1 = require("fs");
const injectUiExtend = () => __awaiter(void 0, void 0, void 0, function* () {
    fs_1.default.copyFile('source/_uiExtend/index.html', 'public/index.html', () => { });
    const dir = 'public/styleguide/js';
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir);
    }
    fs_1.default.copyFile('source/_uiExtend/js/nlx-ui-extend.js', dir + '/nlx-ui-extend.js', () => { });
});
//source: https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge
function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}
exports.isObject = isObject;
function mergeDeep(target, ...sources) {
    if (!sources.length)
        return target;
    const source = sources.shift();
    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key])
                    Object.assign(target, { [key]: {} });
                mergeDeep(target[key], source[key]);
            }
            else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }
    return mergeDeep(target, ...sources);
}
exports.mergeDeep = mergeDeep;
const patternLabOutputTarget = (outputTargetOptions) => {
    const defaultOutputTargetOptions = {
        rollupOptions: {
            input: 'source/scss/style.scss',
            plugins: [
                (0, rollup_plugin_postcss_1.default)({
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
    };
    mergeDeep(defaultOutputTargetOptions, outputTargetOptions);
    return {
        type: 'custom',
        name: 'patternlab-output',
        validate(_config) { },
        generator: function (config, compilerCtx, _buildCtx) {
            var _a, e_1, _b, _c;
            return __awaiter(this, void 0, void 0, function* () {
                if (!_buildCtx.isRebuild) {
                    this.patternlabConfig = require('./patternlab-config.json');
                    this.patternLab = (0, core_1.default)(this.patternlabConfig);
                }
                //addWatchDir is not working with recursive option. When creating a new file npm run start needs to be launched again for it to watch the new file
                if (config.watch && !_buildCtx.isRebuild) {
                    try {
                        for (var _d = true, _e = __asyncValues((0, fast_glob_1.stream)(defaultOutputTargetOptions.sourceDir, {
                            objectMode: true,
                            unique: true,
                            absolute: true
                        })), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                            _c = _f.value;
                            _d = false;
                            const stats = _c;
                            const { path, dirent } = stats;
                            if (dirent.isFile()) {
                                compilerCtx.addWatchFile(path);
                            }
                            else if (dirent.isDirectory()) {
                                compilerCtx.addWatchDir(path, false);
                            }
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
                yield this.patternLab.build(this.patternlabConfig);
                //not being able to extract CSS separately for every file of rollup entry points is a known issue this is a workaround which builds multiple rollup instances
                //https://github.com/egoist/rollup-plugin-postcss/issues/160
                //https://github.com/egoist/rollup-plugin-postcss/pull/276
                if (!defaultOutputTargetOptions.rollupOptions.length) {
                    const rollupBuild = yield (0, rollup_1.rollup)(defaultOutputTargetOptions.rollupOptions);
                    yield rollupBuild.write(defaultOutputTargetOptions.rollupOutputOptions);
                }
                else {
                    yield Promise.all(defaultOutputTargetOptions.rollupOptions.map((options, key) => __awaiter(this, void 0, void 0, function* () {
                        const rollupBuild = yield (0, rollup_1.rollup)(options);
                        if (defaultOutputTargetOptions.rollupOutputOptions[key]) {
                            yield rollupBuild.write(defaultOutputTargetOptions.rollupOutputOptions[key]);
                        }
                        else {
                            yield rollupBuild.write(defaultOutputTargetOptions.rollupOutputOptions);
                        }
                    })));
                }
                injectUiExtend();
            });
        }
    };
};
exports.patternLabOutputTarget = patternLabOutputTarget;
