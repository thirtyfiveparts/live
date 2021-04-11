import React from 'react'
import tw from 'twin.macro'
import faker from 'faker'

export const Home: React.FC<any> = () => {
  const items = Array.from(Array(10).keys())
  const cards = items.map(() => {
    const name = faker.random.words()
    const description = faker.random.words()
    const icon = faker.random.image()
    const color = faker.commerce.color()
    console.log({color})
    const opts = {name, description, icon, color}
    return <Card {...opts}></Card>
  })

  return (
    <div>
      <NavBar></NavBar>
      {cards}
    </div>
  )
}

export default Home

const Card: React.FC<any> = ({name, description, icon, color}) => {
  return (
    //<div className='group' style={{cursor: 'pointer'}} tw="m-6 p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md flex items-center space-x-4 hover:bg-gray-100">
    <div
      className="group"
      style={{cursor: 'pointer'}}
      tw="m-6 p-6 max-w-sm mx-auto border-indigo-500 bg-white rounded-xl flex items-center space-x-4 hover:bg-gray-100"
    >
      <div tw="flex-shrink-0">
        <img tw="h-12 w-12" src={icon} style={{color}} alt="ChitChat Logo" />
      </div>
      <div>
        <div tw="text-xl font-medium text-black group-hover:text-gray-900">
          {name}
        </div>
        <p tw="text-gray-500">{description}</p>
      </div>
    </div>
  )
}

const NavBar: React.FC<any> = () => {
  const style = {
    WebkitAppRegion: 'drag',
  }

  return (
    <nav tw="bg-gray-800" style={style}>
      <div tw="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div tw="flex items-center justify-between h-16">
          <div tw="flex items-center">
            <div tw="flex-shrink-0">
              <img
                tw="h-8 w-8"
                src="https://tailwindui.com/img/logos/workflow-mark-indigo-500.svg"
                alt="Workflow"
              />
            </div>
            <div tw="hidden md:block">
              <div tw="ml-10 flex items-baseline space-x-4">
                <a
                  href="#"
                  tw="bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Home
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
