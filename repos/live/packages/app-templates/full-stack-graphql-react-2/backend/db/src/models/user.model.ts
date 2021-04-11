import {
  Table,
  Column,
  Model,
  AllowNull,
  Default,
  PrimaryKey,
  BelongsTo,
  IsEmail,
} from 'sequelize-typescript'
import short from 'short-uuid'
import restoreSequelizeAttributesOnClass from '@src/util/helper'
import {Field, ID, InputType, ObjectType} from 'type-graphql'
import {Org} from '@src/models/org.model'
import {
  IsEmail as IsEmailDto
} from 'class-validator'

@ObjectType()
@Table({modelName: 'user', schema: 'core'})
export class User extends Model<User> {
  @AllowNull
  @PrimaryKey
  @Default(() => short.uuid())
  @Column
  @Field(() => ID)
  id: string

  @Field()
  @IsEmail
  @Column
  email: string

  @Field()
  @Column
  password: string

  @Field(() => Org)
  @BelongsTo(() => Org, {foreignKey: 'orgId'})
  org: Org

  constructor(...args) {
    super(...args)
    restoreSequelizeAttributesOnClass(new.target, this)
  }
}

@InputType('UserDtoInput')
@ObjectType()
export class UserDto {
  @Field()
  id: string

  @Field()
  @IsEmailDto()
  email: string

  @Field()
  password: string

  // NOTE: Don't send password!

}

// TODO(vjpr): Make an input Dto.
