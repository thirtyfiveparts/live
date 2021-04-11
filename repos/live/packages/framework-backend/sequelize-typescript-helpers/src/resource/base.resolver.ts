// Adapted from: https://github.com/MichalLytek/type-graphql/blob/master/docs/inheritance.md#examples
// And: https://github.com/MichalLytek/type-graphql/issues/89#issuecomment-431610046

import {Service} from 'typedi'
import {
  Query,
  Arg,
  Int,
  Resolver,
  ArgsType,
  Field,
  Args,
  FieldResolver,
  Root,
  ClassType,
  Mutation, Ctx,
} from 'type-graphql'

import {BaseService as ResourceService} from '@src/base.service'
import {Model as Resource, ModelCtor} from 'sequelize-typescript'
import {Context} from '@apollo/client'

////////////////////////////////////////////////////////////////////////////////

//@ArgsType()
//export class GetAllArgs {
//  @Field(type => Int)
//  skip: number = 0
//
//  @Field(type => Int)
//  take: number = 10
//}

////////////////////////////////////////////////////////////////////////////////

export function ResourceResolver<T extends Resource>(
  Clazz: ClassType,
  DtoClazz: ClassType,
) {
  const clazzName = Clazz.name.toLocaleLowerCase()

  // `isAbstract` decorator option is mandatory to prevent multiple registering in schema.
  @Resolver(of => Clazz, {isAbstract: true})
  @Service()
  abstract class ResourceResolverClass {
    // TODO(vjpr): Define interface.
    //abstract class ResourceResolverClass implements IResourceResolver {

    // NOTE: Don't add this or it doesn't work strangely.
    //protected service: ResourceService<T>

    constructor(private readonly service: ResourceService<T>) {}

    @Query(returns => [Clazz], {name: `${clazzName}s`})
    async getAll(@Ctx() ctx: Context): Promise<T[]> {
      return await this.service.getAll()
    }

    @Query(returns => [Clazz], {name: `${clazzName}s`})
    async getAllByUser(@Ctx() ctx: Context): Promise<T[]> {
      return await this.service.getAll({user: ctx.getUser()})
    }


    @Query(returns => Clazz, {name: `${clazzName}ById`})
    async getById(@Arg('id') id: string): Promise<T> {
      return await this.service.get({id})
    }

    @Mutation(returns => Clazz, {name: `create${Clazz.name}`})
    async add(@Arg('input', type => DtoClazz) input: Partial<T>): Promise<T> {
      return await this.service.add(input)
    }

    @Mutation(returns => Clazz, {name: `update${Clazz.name}`})
    async update(@Arg('data', type => DtoClazz) input: Partial<T>): Promise<T> {
      return await this.service.update(input)
    }

    @Mutation(returns => Clazz, {name: `delete${Clazz.name}`})
    async delete(@Arg('id', type => String) id: string): Promise<T> {
      return await this.service.delete({id})
    }

    ////////////////////////////////////////////////////////////////////////////

    //// dynamically created field with resolver for all child resource classes
    //@FieldResolver({name: 'uuid'})
    //protected getUuid(@Root() resource: Resource): string {
    //  return `${resourceName}_${resource.id}`
    //}
  }

  return ResourceResolverClass as any
}
