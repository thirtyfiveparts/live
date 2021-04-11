import {Column, DataType, Model, PrimaryKey, Table} from 'sequelize-typescript'
import restoreSequelizeAttributesOnClass from '@src/util/helper'
import {Field, ID, ObjectType} from 'type-graphql'
import {GraphQLJSONObject} from 'graphql-type-json'

// For `node-connect-pg-simple`.

@ObjectType()
@Table({modelName: 'session', schema: 'core', timestamps: false})
export class Session extends Model<Session> {

  @PrimaryKey
  @Column
  @Field(() => ID)
  sid: string

  @Column(DataType.JSON)
  @Field(type => GraphQLJSONObject)
  sess: string

  //@Column({type: 'TIMESTAMP'})
  @Column(DataType.DATE)
  @Field()
  expire: Date

  constructor(...args) {
    super(...args)
    restoreSequelizeAttributesOnClass(new.target, this)
  }
}

