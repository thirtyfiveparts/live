import {
  Table,
  Column,
  HasMany,
  AllowNull,
  Default,
  PrimaryKey,
  BelongsToMany,
} from 'sequelize-typescript'
import short from 'short-uuid'
import restoreSequelizeAttributesOnClass from '@src/util/helper'
import {Field, ID, ObjectType, InputType} from 'type-graphql'
import Model from '@src/util/base.model'

@InputType('TagInput')
@ObjectType()
@Table({modelName: 'tag', schema: 'core'})
export class Tag extends Model<Tag> {
  @AllowNull
  @PrimaryKey
  @Default(() => short.uuid())
  @Column
  @Field(() => ID)
  id: string

  @Field()
  @Column
  name: string

  @Field()
  @Column
  parentId: string

  @Field()
  @Column
  hierarchyLevel: number

  @Column
  @Field()
  type: string

  @Field(() => [Tag])
  ancestors: [Tag]

  constructor(...args) {
    super(...args)
    restoreSequelizeAttributesOnClass(new.target, this)
  }
}
