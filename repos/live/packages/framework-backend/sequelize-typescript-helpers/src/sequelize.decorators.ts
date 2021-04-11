import {Inject} from 'typedi'

// Usage: `@InjectModel(type => Company)`.
// NOTE: We use `modelGetter` because models must be registered with sequelize before we
//   try to get their name for our DI token.
export const InjectModel = modelGetter =>
  Inject(type => getModelToken(modelGetter()))

export function getModelToken(model) {
  return model.name
}
