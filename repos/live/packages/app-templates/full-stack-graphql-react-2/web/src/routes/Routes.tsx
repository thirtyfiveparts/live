import React, {lazy, useEffect, Suspense} from 'react'
import {
  BrowserRouter as Router,
  Route,
  useLocation,
  useRoutes,
} from 'react-router-dom'
import {Skeleton} from 'antd'
import {PartialRouteObject, Navigate} from 'react-router'
import loadable from '@loadable/component'
import {AlignLeftOutlined} from '@ant-design/icons'
import {useCurrentUser} from '@src/pages/auth/hooks/use-current-user'
import Shell from '@src/pages/shell/Shell'

// Imports
////////////////////////////////////////////////////////////////////////////////

// NOTE: We use default exports to make loadable cleaner.
//   See: https://loadable-components.com/docs/api-loadable-component/#optionsresolvecomponent
//   See: https://github.com/gregberge/loadable-components/pull/483

// NOTE: We don't use full dynamic import because we want IDE navigation and refactoring on `imports`, and also babel module alias.

const Login = loadable(() => import('@src/pages/auth/Login'))
const Signup = loadable(() => import('@src/pages/auth/Signup'))
const Home = loadable(() => import('@src/pages/home/Home'))

////////////////////////////////////////////////////////////////////////////////

const isProd =
  Boolean(window.localStorage.simulateProd) === true ||
  process.env.NODE_ENV === 'production'

export const Routes: React.FC<any> = () => {
  const {data} = useCurrentUser()

  const mainRoutes = [
    {
      path: 'signup',
      element: <Signup />,
    },
    {
      path: 'login',
      element: <Login />,
    },
    {
      path: 'home',
      element: <Home/>,
    },
    {
      path: '*',
      element: <Navigate to="/home" />,
    },
  ]

  const otherRoutes = [  ]

  let routes
  if (isProd) {
    routes = [...mainRoutes]
  } else {
    routes = [...mainRoutes, ...otherRoutes]
  }

  const element = useRoutes(routes)

  return element
}

const NotFound: React.FC<any> = () => {
  return <div>Not Found!</div>
}

////////////////////////////////////////////////////////////////////////////////

function Loader() {
  return <Skeleton></Skeleton>
}

export default function SuspenseContainer(props: any) {
  return <Suspense fallback={<Loader />}>{props.children}</Suspense>
}

////////////////////////////////////////////////////////////////////////////////

// From: https://github.com/ReactTraining/react-router/issues/7421#issuecomment-692500546

//interface AsyncComponentProps {
//  name: string
//}
//
//const AsyncComponent: React.FC<AsyncComponentProps> = ({name, ...props}) => {
//  const Component = loadable(() => import(name))
//  return <Component {...props} />
//}
//
//const generateRoutes = (routes: any[]): PartialRouteObject[] => {
//  return routes.map(({path, componentName, children}) => ({
//    element: <AsyncComponent name={componentName} />,
//    children: children && generateRoutes(children),
//    path,
//  }))
//}

////////////////////////////////////////////////////////////////////////////////

export function ScrollToTop() {
  const {pathname} = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}
