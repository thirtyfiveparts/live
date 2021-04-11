import {Service} from 'typedi'
import {ResourceResolver} from '@live/sequelize-typescript-helpers/src/resource/base.resolver'
import {User, UserDto} from '@sidekicks/core.db/src/models/user.model'
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
} from 'type-graphql'
import {UserService} from './user.service'
import {Context} from 'graphql-passport/lib/buildContext'

@InputType()
export class UserLoginInput {
  @Field()
  email: string
  @Field()
  password?: string
}

@Service()
@Resolver()
export default class UserResolver extends ResourceResolver(User, UserDto) {
  constructor(private readonly service: UserService) {
    super()
  }

  @Query(returns => UserDto)
  async currentUser(@Ctx() ctx: Context<UserDto>) {
    // Get user from passport session.
    //console.log(ctx.req)
    return ctx.getUser()
  }

  @Mutation(returns => UserDto, {name: `createUser`})
  async addUser(
    @Arg('input', type => UserDto) input: Partial<UserDto>,
  ): Promise<UserDto> {
    return await this.service.addUser(input)
  }

  @Mutation(returns => Boolean)
  async logout(@Ctx() ctx) {
    const res = await logoutP(ctx)
    return res
  }

  @Mutation(returns => UserDto)
  async userLogin(
    @Arg('input') input: UserLoginInput,
    @Ctx() ctx,
  ): Promise<UserDto | string> {
    const {user, info} = await ctx.authenticate('graphql-local', {
      email: input.email,
      password: input.password,
    })

    //const res = await logoutP(ctx)

    await loginP()
    function loginP() {
      return new Promise((resolve, reject) => {
        ctx.login(user, () => {
          resolve()
        })
      })
    }

    console.log({user, info})
    return user
  }
}

////////////////////////////////////////////////////////////////////////////////

function logoutP(ctx) {
  return new Promise((resolve, reject) => {
    ctx.logout(() => {
      console.log('Logged out!')
      resolve(true)
    })
  })
}
