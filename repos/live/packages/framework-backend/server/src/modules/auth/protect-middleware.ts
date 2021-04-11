import {MiddlewareInterface, NextFn, ResolverData} from 'type-graphql'
import { Service } from 'typedi'

export default function protectMiddleware() {
  return (req, res, next) => {
    //if (req.isAuthenticated()) {
    //  console.log('authenticated')
    //  return next()
    //}
    return next()
  }
}

//export function authMiddleware(resolve, root, args, context, info) {
//
//  console.log(resolve)
//
//}

type TContext = {}

@Service()
export class AuthMiddleware implements MiddlewareInterface<TContext> {
  async use(data: ResolverData<TContext>, next: NextFn) {
    //const username: string = context.username || "guest";
    //this.logger.log(`Logging access: ${username} -> ${info.parentType.name}.${info.fieldName}`);

    if (parseInt(process.env.DISABLE_AUTH)) {
      return next()
    }

    const {context, info} = data

    // Always allow login.
    ////////////////////

    if (info.fieldName === 'userLogin') {
      return next()
    }

    // TODO(vjpr): Not the best. Restricts to only allowing one level of fields.
    if (info.path.prev?.key === 'userLogin') {
      return next()
    }

    if (info.fieldName === 'createScout') {
      return next()
    }
    if (info.path.prev?.key === 'createScout') {
      return next()
    }

    ////////////////////

    if (context.req.headers['x-api-key'] === 'thirtyfive2020') {
      return next()
    }

    if (!context.isAuthenticated()) {
      throw new Error('Not authenticated')
    }

    return next()
  }
}
