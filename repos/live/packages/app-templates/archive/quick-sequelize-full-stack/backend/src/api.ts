import graphql from 'graphql'
import {ApolloServer, gql} from 'apollo-server'
import _ from 'lodash'
import {resolver, attributeFields, JSONType} from 'graphql-sequelize'
import {GraphQLJSONObject, GraphQLJSON} from 'graphql-type-json'

import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLList,
} from 'graphql'

export default async function ({database, models}) {
  const thingType = new GraphQLObjectType({
    name: 'Thing',
    description: 'A thing',
    fields: {
      ...attributeFields(models.Thing),
    },
  })

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'RootQueryType',
      fields: {
        things: {
          type: new GraphQLList(thingType),
          resolve: async () => {
            const things = await models.Thing.findAll({
              //include: [{model: models.User, as: 'users'}],
            })
            return things
          },
        },
      },
    }),
  })

  const formatError = (err) => {
    // Don't give the specific errors to the client.
    if (err.message.startsWith('Database Error: ')) {
      return new Error('Internal server error')
    }
    console.log({err})
    // Otherwise return the original error.  The error can also
    // be manipulated in other ways, so long as it's returned.
    return err
  }

  const server = new ApolloServer({
    schema,
    formatError,
    introspection: true,
  })

  // The `listen` method launches a web server.
  server.listen({port: process.env.PORT ?? 3010}).then(({url}) => {
    console.log(`🚀  Server ready at ${url}`)
  })
}
