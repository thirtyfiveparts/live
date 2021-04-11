//import csvtojson from 'csvtojson'
import _ from 'lodash'
const {v4: uuidv4} = require('uuid')

export default async function ({database, models}) {

  const rootTag = await models.Thing.create({
    id: uuidv4(),
    name: 'Foo',
  })

}
