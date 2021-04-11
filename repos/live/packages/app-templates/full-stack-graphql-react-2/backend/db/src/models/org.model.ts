import {
  AllowNull,
  Column,
  Default,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  DataType,
} from 'sequelize-typescript'
import short from 'short-uuid'
import restoreSequelizeAttributesOnClass from '@src/util/helper'
import {Field, ObjectType} from 'type-graphql/dist/decorators'
import {User} from '@src/models//user.model'

@ObjectType()
@Table({tableName: 'orgs', modelName: 'org', schema: 'core'})
export class Org extends Model<Org> {
  @AllowNull
  @PrimaryKey
  @Default(() => short.uuid())
  @Column
  id: string

  @Field()
  @Column
  name: string

  @Field(() => User)
  @HasMany(() => User, {foreignKey: 'orgId'})
  users: string

  constructor(...args) {
    super(...args)
    restoreSequelizeAttributesOnClass(new.target, this)
  }
}
