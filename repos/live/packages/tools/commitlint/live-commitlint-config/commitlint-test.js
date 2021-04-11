const lint = require('@commitlint/lint');

lint('foo: bar').then(report => console.log(report));
// => { valid: true, errors: [], warnings: [] }

lint('foo: bar', {'type-enum': [1, 'always', ['foo']]}).then(report =>
  console.log(report)
);
// => { valid: true, errors: [], warnings: [] }

lint('foo: bar', {'type-enum': [1, 'always', ['bar']]}).then(report =>
  console.log(report)
);
/* =>
    { valid: true,
      errors: [],
      warnings:
      [ { level: 1,
          valid: false,
          name: 'type-enum',
          message: 'type must be one of [bar]' } ] }
  */

const opts = {
  parserOpts: {
    headerPattern: /^(\w*)-(\w*)/,
    headerCorrespondence: ['type', 'scope']
  }
};

lint('foo-bar', {'type-enum': [2, 'always', ['foo']]}, opts).then(report =>
  console.log(report)
);
// => { valid: true, errors: [], warnings: [] }
