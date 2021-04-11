# path-descends-from

> Check if a file or directory is a descendant of a directory.

## Highlights

- Uses a simple regex.
- Handles all cases including `./` relative paths and absolute paths.

## Install

```
npm i -S path-descends-from
```

## Usage

```js
import pathDescendsFrom from 'path-descends-from'

const path = 'node_modules/foo'
pathDescendsFrom(path, 'node_modules')
// => true

// No.
/node_modules
./node_modules
node_modules
bar/node_modules
a/foo_node_modules/b
a/node_modules_foo/b

// Yes.
node_modules/foo
a/node_modules/b
```

## API

### pathDescendsFrom(path, directory)

#### path

Type: `string`

Path you want to check is a descendant.

E.g. `app/packages/node_modules/foo`

#### directory

Type: `string`

Directory you want to check `path` descends from.

E.g. `node_modules`

## License

MIT © [Vaughan Rouesnel](https://vaughan.io)
