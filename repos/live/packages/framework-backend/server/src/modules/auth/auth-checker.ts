import {AuthChecker} from 'type-graphql'
import {Context} from 'graphql-passport/lib/buildContext'

export const customAuthChecker: AuthChecker<Context> = (
  {root, args, context, info},
  roles,
) => {

  const user = context.getUser()

  console.log('req.user', context.req.user)
  console.log('req.headers', context.req.headers)

  // here we can read the user from context
  // and check his permission in the db against the `roles` argument
  // that comes from the `@Authorized` decorator, eg. ["ADMIN", "MODERATOR"]
  console.log('hello!')
  return true // or false if access is denied
}
