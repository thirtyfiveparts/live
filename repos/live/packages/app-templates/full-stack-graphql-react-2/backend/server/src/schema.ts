import {buildSchema} from 'type-graphql'
import {Container} from 'typedi'
import UserResolver from '@sidekicks/core.api/src/modules/user/user.resolver'
import {customAuthChecker} from '@live/server/src/modules/auth/auth-checker'
import {AuthMiddleware} from '@live/server/src/modules/auth/protect-middleware'

export default async function getSchema() {
  const schema = await buildSchema({
    // TODO(vjpr): Add a directory glob to warn about missing ones.
    //   Or use a barrel file? But we want references in code for traceability.
    resolvers: [
      UserResolver,
    ],
    //validate: false,
    nullableByDefault: true,
    container: Container,
    // Map types to scalars.
    scalarsMap: [
      //{
      //  type: Record,
      //  scalar: GraphQLJSONObject,
      //},
    ],
    authChecker: customAuthChecker,
    globalMiddlewares: [AuthMiddleware],
  })
  return schema
}
