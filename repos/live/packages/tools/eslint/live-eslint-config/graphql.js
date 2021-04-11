// Apollo
// From: https://github.com/apollographql/eslint-plugin-graphql#example-config-for-apollo
module.exports = {
  'graphql/template-strings': ['error', {
    env: 'apollo',
    //projectName: 'default',
  }],
}

/*

Regarding `projectName`. Some rough notes:

IT SHOULD FIND IT!!! We have to debug IntelliJ eslint plugin.

Finding `.graphqlconfig`.

`eslint-graphql-plugin` uses `graphql-config#loadConfigSync` to find our config.

If we run `eslint path/to/file` then it will find the local graphqlconfig. The `projectName` should be `default` if no projects are specified.

But normally it will pull from root.

---

// NOTE: Schema file will be taken from the root `.graphqlconfig` file which we generate.
// TODO(vjpr): Currently we have to specify one single schema.
//   To get around this we would have to use overrides to specify specific graphql rules for each project dir.
// Could also use separate tag names to specify different schemas.

*/
