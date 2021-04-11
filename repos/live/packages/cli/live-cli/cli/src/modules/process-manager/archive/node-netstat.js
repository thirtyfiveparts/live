//import netstat from 'node-netstat'

const netstatP = opts =>
  new Promise((resolve, reject) => {
    const res = []
    const finalOpts = {
      ...opts,
      done: err => {
        if (err) return reject(err)
        return resolve(res)
      },
    }
    netstat(finalOpts, data => res.push(data))
  })
