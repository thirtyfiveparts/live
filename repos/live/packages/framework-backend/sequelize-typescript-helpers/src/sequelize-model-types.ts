//import {Model} from 'sequelize-typescript'
//
//type NonAbstract<T> = {[P in keyof T]: T[P]}
//type StaticMembers = NonAbstract<typeof Model>
//type Constructor<T> = new () => T
//type ModelType<T> = Constructor<T> & StaticMembers
//type Repository<T> = ModelType<T>
//
//function getRepository<T extends Model<T>>(model: ModelType<T>): Repository<T> {
//  return model
//}
