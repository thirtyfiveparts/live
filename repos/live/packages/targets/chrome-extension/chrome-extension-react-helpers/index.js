import $ from 'jquery'

export function findReactComponentByDisplayNameFromElement(name, selector) {
  const el = $(selector).get(0)

  const key = Object.keys(el).find((key) =>
    key.startsWith('__reactInternalInstance$'),
  )

  // We start with a fiber that is a dom element.
  const domFiber = el[key]

  const fiber = search(domFiber)
  return fiber?.stateNode

  ////////////////////

  function search(fiber) {
    if (!fiber.return) return null
    if (typeof fiber.type !== 'string') {
      // We found a component.
      //console.log({displayName: fiber.stateNode?.constructor?.displayName})
      if (fiber.stateNode?.constructor.displayName === name) {
        return fiber
      }
    }
    return search(fiber.return)
  }
}

////////////////////////////////////////////////////////////////////////////////

export function findReactComponent(el) {
  // DEBUG
  window.el = el
  console.log({el})
  // --

  for (const key in el) {
    if (key.startsWith('__reactInternalInstance$')) {
      const fiberNode = el[key]

      // TODO(vjpr): Why do we need double `return`? It just seemed to work but it used to be a single return.
      return fiberNode.return?.return?.stateNode
    }
  }
  return null
}

////////////////////////////////////////////////////////////////////////////////

export function observeChanges(el, cb) {
  const observer = new MutationObserver(function (mutations, observer) {
    //console.log(mutations, observer)
    cb(mutations, observer)
  })
  observer.observe(el, {
    subtree: true,
    attributes: true,
  })
  return observer
}
