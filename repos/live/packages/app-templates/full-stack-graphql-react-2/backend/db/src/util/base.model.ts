import {Model} from 'sequelize-typescript'
import restoreSequelizeAttributesOnClass from './helper'

export default Model

// TODO: This is not working - and it also doesn't do anything.
//export default class BaseModel<T = any, T2 = any> extends Model<T, T2> {
//  constructor(...args) {
//    super(...args)
//    // Not working - complaining about redefiniting properties.
//    //restoreSequelizeAttributesOnClass(new.target, this)
//  }
//}
