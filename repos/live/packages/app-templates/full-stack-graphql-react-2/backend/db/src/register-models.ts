import {
  Org,
  User,
  Session,
  Tag,
} from '@src/models'

export default function makeModels({sequelize}) {
  sequelize.addModels([
    Org,
    User,
    Session,
    Tag,
  ])
  Tag.isHierarchy({
    // v5 compatability
    // See https://github.com/overlookmotel/sequelize-hierarchy/issues/171#issuecomment-502986397
    foreignKey: 'parentId',
    levelFieldName: 'hierarchyLevel',
    // --
  })
}

////////////////////////////////////////////////////////////////////////////////

// NOTE(vjpr): This is not working.
// TypeError: Cannot read property 'options' of undefined
//    at Function.isHierarchy (/xxx/node_modules/.pnpm/@vjpr/sequelize-hierarchy@2.0.4-vjpr.2/node_modules/@vjpr/sequelize-hierarchy/lib/modelExtends.js:39:30)
//sequelize.addModels([__dirname + '../**/*.model.ts'])
// ---

