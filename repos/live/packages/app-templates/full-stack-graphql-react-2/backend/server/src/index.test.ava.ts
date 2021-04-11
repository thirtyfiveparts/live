import test from 'ava'
import index from './main'

import {request, gql} from 'graphql-request'

test('foo', async (t) => {
  const a = 1
  t.true(true)
})

//import connect from './db'

test('db', async t => {

})

test('createScout', async (t) => {
  const query = gql`
      mutation CreateScout($where: JSONObject) {
          createScout(where: $where) {
              id
              name
          }
      }
  `
  //
  const variables = { where: {
      name: "bob",
      scoutType: "Creative",
      data: {
        description: "blah",
        xx: "blah blah"
      }
    }
  }

  const endpoint = 'http://localhost:3010'
  const res = await request(endpoint, query, variables)
  console.log(res)
})


////////////////////////////////////////////////////////////////////////////////

//test('gql', async (t) => {
  //const query = gql`
  //  mutation MoveNode($input: Tag) {
  //    moveTag(input: $input) {
  //      id
  //      parentId
  //    }
  //  }
  //`
  //
  ////const variables = {
  ////  id:
  ////  parentId:
  ////}
  //
  //const endpoint = 'http://localhost:3010'
  //const res = await request(endpoint, query, variables)
  //console.log(res)
//
//})

////////////////////////////////////////////////////////////////////////////////

//const endpoint = 'http://localhost:3010'
//
//test('where', async (t) => {
//  let query = ''
//
//  query = gql`
//    query {
//      metrics {
//        id
//        name
//      }
//      businessCategories {
//        id
//        name
//      }
//    }
//  `
//
//  const results = await request(endpoint, query)
//  //console.log('metrics', results.metrics)
//  //console.log('cats', results.businessCategories)
//  let metrics = results.metrics.map((m) => m.id)
//  let categories = results.businessCategories.map((m) => m.id)
//
//  ////////////////////////////////////////////////////////////////////////////////
//
//  //metrics = metrics.slice(0)
//
//  //const variables = {
//  //  where: {
//  //    metrics,
//  //    categories,
//  //  },
//  //}
//
//  const variables = {
//    where: {
//      businessCategories: ['61de4081-7c47-4fae-88ec-96b2fdf7d284'],
//    },
//  }
//
//  query = gql`
//    query Projects($where: JSONObject) {
//      projects(where: $where) {
//        id
//        name
//        companies {
//          Name
//        }
//      }
//    }
//  `
//
//  const res = await request(endpoint, query, variables)
//
//  console.log(res.projects.length)
//  console.log(res)
//})
