import {Service} from 'typedi'
import {Model, ModelCtor} from 'sequelize-typescript'

// See: https://stackoverflow.com/questions/55166230/sequelize-typescript-typeof-model
//type Constructor<T> = new (...args: any[]) => T
//type ModelType<T extends Model<T>> = Constructor<T> & typeof Model

@Service()
export class BaseService<T extends Model<T>> {
  model: ModelCtor<T>

  constructor(protected relation: ModelCtor<T>) {
    // TODO(vjpr): We could auto-inject the model if we can read the type name from T
    //   with `reflect-metadata`.
    this.model = relation
  }

  getId(input): string {
    return input.id
  }

  async get(input: any, opts?: any): Promise<T> {
    // TODO(vjpr): Not sure this is a good idea. The API shouldn't be dependant on
    //const id = this.model.primaryKeyAttributes.map(key => input[key])
    // --
    const id = this.getId(input)
    return await this.model.findByPk<T>(id, opts)
  }

  async add(input): Promise<T> {
    return await this.model.create<T>(input)
  }

  async getAll({user}): Promise<T[]> {
    // return await this.model.findAll<T>({order: [['createdAt', 'ASC']]})
    return await this.model.findAll<T>({
      order: [['createdAt', 'DESC']],
    })
  }

  async getAllByUser({user}): Promise<T[]> {
    // return await this.model.findAll<T>({order: [['createdAt', 'ASC']]})
    return await this.model.findAll<T>({
      where: {userId: user.id},
      order: [['createdAt', 'DESC']],
    })
  }


  async update(input): Promise<T> {
    const item = await this.get(input)
    // TODO(vjpr): This should print the original model class name - not the table name or else its confusing.
    if (!item) {
      const modelName = this.model.constructor.name
      const msg = `Model: ${modelName} not found for id ${this.getId(input)}`
      throw Error(msg)
    }
    //const {id, data} = input
    // TODO(vjpr): Validate!!!
    return await item.update(input)
  }

  async delete(input): Promise<T> {
    const item = await this.get(input)
    if (!item) throw Error('Company not found')
    //const descendants = await item.g(etDescendents()
    const children = await (item as any).getChildren()
    if (children.length) {
      // TODO(vjpr): Support cascade delete all descendants. Confirm on client-side.
      throw Error('Company has children. Delete the children first.')
    }
    return await item.destroy()
  }

  //async moveCompany(input) {
  //  const item = await this.get(input.id)
  //  if (!item) throw Error('Company not found')
  //  const {parentId} = input
  //  return await item.update({parentId})
  //}
}
