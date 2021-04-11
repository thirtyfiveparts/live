#!/usr/bin/env babel-node

import execa from 'execa'
import 'hard-rejection/register'

async function main() {
  // TODO(vjpr): Work in progress.
  console.log('hey')
}

main().then()

async function postgres() {

  // Get all logging file locations.
  const res = await knex.raw(`
    SELECT 
      * 
    FROM 
      pg_settings 
    WHERE 
      category IN( 'Reporting and Logging / Where to Log' , 'File Locations')
    ORDER BY 
      category,
      name;
   `)

}
