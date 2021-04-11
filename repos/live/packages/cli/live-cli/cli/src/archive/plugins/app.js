export const services = {
  consume: {
    'live.register': {'^0.1.0': register},
  },
}

export function register(svc) {
  svc.addCommand('run', () => {
    console.log('HERE YOU ARE!')
  })

  svc.addCommand('test', () => {
    console.log('HERE YOU ARE!')
  })

  svc.addCommand('run', () => {
    console.log('HERE YOU ARE!')
  })
}
