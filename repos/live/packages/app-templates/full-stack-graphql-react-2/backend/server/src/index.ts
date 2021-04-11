import getApp from '@src/get-app'
import path from "path"
import dotenv from 'dotenv'

// TODO(vjpr): I'm not sure the below is true.
// We explicitly set the env path because `process.cwd()` cannot be guaranteed
//   as for testing we call invoke this function from another process started somewhere else.
const envFile = path.resolve(__dirname, '../.env')
dotenv.config({path: envFile})



export default getApp
