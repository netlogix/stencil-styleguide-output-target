# @netlogix/stencil-styleguide-output-target

A stencil output target which also builds Patternlab and processes scss

## Usage

To use this output target, add it to your `stencil.config.ts`:

```typescript  
import {Config, } from '@stencil/core';
import { sass } from '@stencil/sass';
import watchGlobs from 'rollup-plugin-watch-globs';
import {PatternlabOutput} from "./patternlab";
import postcss from "rollup-plugin-postcss";

export const config: Config = {
    namespace: 'stencil',
    srcDir: 'source/script',
    watchIgnoredRegex: /dependencyGraph.json/, // important for watching for changes in patternlab
    outputTargets: [
         // ... other output targets
         PatternlabOutput({}),
         // ...
    ],
    devServer: {
        openBrowser: false,
        reloadStrategy: "pageReload", // important for hot reload to work with patternlab
        root: 'public',
    },
    plugins: [
        sass(),
    ],
    // ...
};
```
## Configuration
The PatternlabOutput function takes an optional configuration object with the following properties:

`rollupOptions`:

An object with rollup options to be merged with the default options.

Default:
```
rollupOptions: {
      input: 'source/scss/style.scss',
      plugins: [
        postcss({
          modules: true,
          extract: true
        })
      ]
    },
```
#
`rollupOutputOptions`:

An object with rollup output options to be merged with the default options.

Default:
```
rollupOutputOptions: {
      name: 'style',
      dir: './public/css',
      format: 'es'
    },
```
#
`sourceDir`: the directory which will be watched. Default: `source/**/*`


## License
This package is licensed under the MIT license.