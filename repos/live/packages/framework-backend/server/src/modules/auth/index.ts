import passport from 'passport'
import {GraphQLLocalStrategy} from 'graphql-passport'
import {Service, Inject} from 'typedi'
import bcrypt from 'bcryptjs'
import IUserService from "@src/modules/auth/interfaces/IUserService"

@Service()
export class AuthService {
  constructor(@Inject('userService') private readonly userService: IUserService) {}

  setup(app) {
    const that = this

    passport.serializeUser(function (user, done) {
      // Don't serialize password.
      console.log('serializeUser', user.id)
      done(null, user.id)
    })

    passport.deserializeUser(function (userId, done) {
      async function foo() {
        const user = await that.userService.get({id: userId})
        // TODO(vjpr): Check if user doesn't exist.
        done(null, user)
      }
      foo().then().catch(e => {
        throw e
      })
    })

    passport.use(
      new GraphQLLocalStrategy(
        {passReqToCallback: true},
        (req, email, password, done) => {
          that.validateUser(email, password, done).then()
        },
      ),
    )
    app.use(passport.initialize())
    app.use(passport.session())
  }

  async validateUser(email, password, done) {
    const user = await this.userService.getByEmail(email)
    if (!user) return done(new Error('no matching user'))
    const passwordMatches = await bcrypt.compare(password, user.password)

    if (!passwordMatches) {
      return done(new Error('invalid password'))
    }
    return done(null, user.toJSON())
  }
}
