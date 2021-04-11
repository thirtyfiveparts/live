import to from 'await-to'

export default async function({db, databaseGroup, seedConfig}) {

  console.log('Seeding!')

  const [err, result] = await to(seed({seedConfig}))
  if (err) {
    throw err
  }

}


async function seed() {



}
