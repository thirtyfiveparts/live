import Container from 'typedi'
import {AuthService} from '@src/modules/auth'

export function setupAuth({app}) {
  const authService = Container.get(AuthService)
  authService.setup(app)
}

