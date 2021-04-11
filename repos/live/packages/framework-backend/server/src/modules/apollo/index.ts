import {ApolloServer} from 'apollo-server-express'
import {apolloLogging, formatError} from '@src/modules/logging'
import {buildContext} from 'graphql-passport'

export function makeApolloServer({schema, logger, models}) {
  return new ApolloServer({
    schema,
    formatError: formatError({logger}),
    introspection: true,
    plugins: [apolloLogging({logger})],
    context: ({req, res}) => {
      const ctx = buildContext({req, res, User: models.User})
      return ctx
    },
    // We setup playground with express-middleware.
    playground: {
      settings: {
        'request.credentials': 'same-origin',
      },
    },
    // ---

  })
}
