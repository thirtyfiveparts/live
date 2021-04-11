export const services = {
  consume: {
    'live.register': {'^0.1.0': register},
  }
}

export function register(svc) {
  svc.addCommand('here', () => {
    console.log('HERE YOU ARE!')
  })
}
