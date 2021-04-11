import {AlignLeftOutlined} from '@ant-design/icons'
import _ from 'lodash'

export function getMenuTree() {
  const menuGroupMain = {
    name: 'Admin',
    link: '/admin',
    children: [{name: 'Projects', link: '/admin/projects'}],
  }

  const menuGroupAdmin = {
    name: 'Experiments (Debug)',
    children: [
      {
        name: 'Category Explorer',
        link: '/pages/category-explorer',
      },
    ],
  }

  const subMenus = [
    {
      name: 'Main',
      icon: AlignLeftOutlined,
      children: [menuGroupMain, menuGroupAdmin],
    },
  ]

  return subMenus
}

////////////////////////////////////////////////////////////////////////////////

export function findInTree(link, tree) {
  if (tree.link === link) {
    let path = [tree]
    return {result: tree, path}
  } else if (tree.children) {
    for (let child of tree.children) {
      let tmp = findInTree(link, child)
      // TODO(vjpr): This could be wrong! Do we mean to check for null instead?
      if (!_.isEmpty(tmp)) {
        tmp.path.unshift(tree)
        return tmp
      }
    }
    return {}
  }
}

export function findActiveLink(location) {
  const menuTree = getMenuTree()
  const pathnameWithoutSlash = location.pathname.replace(/\/$/, '')
  return findInTree(pathnameWithoutSlash, {children: menuTree})
}

////////////////////////////////////////////////////////////////////////////////

//function findActiveLink(location) {
//  const pathnameWithoutSlash = location.pathname.replace(/\/$/, '')
//  const matchingLink = findDeep(
//    menuTree,
//    (v, k, parent, ctx) => {
//      return v.link === pathnameWithoutSlash
//    },
//    {
//      pathFormat: 'array',
//      leavesOnly: true,
//      childrenPath: 'children',
//      rootIsChildren: true,
//    },
//  )
//  return {link: matchingLink?.value.link, path: []}
//}
