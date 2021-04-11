# Interesting

- https://michaelavila.com/knex-querylab/

# Troubleshooting

```
(node:30749) UnhandledPromiseRejectionWarning: Error: ConnectionManager.getConnection was called after the connection manager was closed!
```

You have missed an `await` somewhere when making a db call. Set a breakpoint at the tip of this stack trace.

# Graphql

```
CannotDetermineGraphQLTypeError: Cannot determine GraphQL input type for 'id' of 'CreateCompanyInput' class. Does the value used as its TS type or explicit type is decorated with a proper decorator or is it a proper input value?
```
