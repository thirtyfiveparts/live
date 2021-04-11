//import {Dockerfile} from '@live/dockerfilejs'
//import generator from 'dockerfile-generator'
import Dockerfile from 'dockerfile-builder'

export default async function() {

  const df = new Dockerfile
    .from({registry: 'mhart', image: 'alpine-node', tag: '11', as: 'base'})
    .workdir({})
  const out = df.render()
  console.log(out)

}
