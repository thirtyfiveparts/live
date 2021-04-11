import {Service} from 'typedi'
import {BaseService} from '@live/sequelize-typescript-helpers/src/base.service'
import {InjectModel} from '@live/sequelize-typescript-helpers/src/sequelize.decorators'
import {ModelCtor} from 'sequelize-typescript'
import {User} from '@sidekicks/core.db/src/models/user.model'
import bcrypt from 'bcryptjs'

@Service()
export class UserService extends BaseService<User> {
  @InjectModel(type => User)
  model: ModelCtor<User>

  //async login(input: UserLogin): Promise<User | string> {
  //  const {email, password} = input
  //  return 'user found'
  //}

  async getByEmail(email: string): Promise<User> {
    const res = await this.model.findOne({where: {email}})
    return res
  }

  async addUser(input) {

    const item = await this.get(input)
    // TODO(vjpr): This should print the original model class name - not the table name or else its confusing.
    if (item) {
      const modelName = this.model.constructor.name
      const msg = `Model: ${modelName} already exists`
      throw Error(msg)
    }
    const hashedPassword = await hashPassword(input.password)
    const newUser = await this.model.create({...input, password: hashedPassword})
    return newUser

  }

}

////////////////////////////////////////////////////////////////////////////////

const hashPassword = (password) => {
  if (password.length < 8) {
    throw new Error('Password must be 8 characters or longer.')
  }

  return bcrypt.hash(password, 10)
}

export {hashPassword as default}
