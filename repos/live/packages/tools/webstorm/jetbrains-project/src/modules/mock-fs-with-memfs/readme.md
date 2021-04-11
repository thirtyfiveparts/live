# mock-fs-with-memfs

> Patches `fs` to allow back certain paths with `memfs`.

See https://github.com/streamich/fs-monkey

## Install

```
npm i -S mock-fs-with-memfs
```

## Usage

```js
import mockFsWithMemfs, {vol} from 'mock-fs-with-memfs'
// `vol` is a `memfs` instance singleton that all your tests will share.
```

## Examples

### Ava

```js
import test from 'ava'
import {vol} from 'mock-fs-with-memfs'

test('find-closest-iml-spec', function(t) {
  vol.fromJSON({'/app.js': 'hey'})
  const str = require('fs').readFileSync('/app.js', 'utf8')
  t.is(str, 'hey') 
  vol.reset()  
})
```
