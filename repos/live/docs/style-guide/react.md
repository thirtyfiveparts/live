<!--json {tocMinDepth: 1, tocMaxDepth: 4} -->

# Typing Components

#### `React.SFC` is deprecated. Use `React.FC`.

```js
// good
export const Foo: React.FC<FooProps> = () => {}

// bad
export const Foo: React.SFC<FooProps> = () => {}
```

#### Use anonymous functions instead of non-arrow functions.

See: https://stackoverflow.com/questions/57876132/define-non-arrow-react-functional-component-for-typescript


```js
// good
export const Foo: React.FC<FooProps> = () => {}

// avoid because there is better type support with anonymous.
export default function Foo() {

} 
```

# Export

- Use "named exports" for components.
- Use "named exports" and "default export" for a component that will be lazy loaded by `@loadable/component`
Why? Its more convenient to add types.
  - See https://github.com/microsoft/TypeScript/issues/22063
  - See

```js
// good
export const Foo: React.FC<FooProps> = () => {}

// okay if lazy loaded
export const Foo: React.SFC<FooProps> = () => {}
export default Foo 

// bad
const Foo: React.SFC<FooProps> = () => {}
export default Foo 
```

```js
// good
import {MasterScout}

// bad
import MasterScout
```

## Loadable components

```js
// Nice and clean.
const V2Landing = loadable(() => import('@src/pages/startup-landscape'))

// Notice how when using a named export we need to add ugliness.
const NewTreePage = loadable(() => import('@src/components/sortable-tree'), {
  resolveComponent: cs => cs.Index,
})
```

# File naming

Use `CamelCase.tsx` for React components.

`kebab-case.tsx` for everything else.

# Graphql

## Operations

An operation looks like the following:

```js
export const GetProductsQuery = gql`
  query GetProducts {
    products {
      id
      name
    }
  }
`
```

Should they be in the same file or in a separate file?

To discuss.

### Naming

Use `get-products.gql.tsx` for any file with gql syntax.

E.g.

```js
export const GetProductsQuery = gql`
  query GetProducts {
    products {
      id
      name
    }
  }
`
```

**Why**

`graphql-codegen` must scan and parse all files for `gql` string tags and then code generate typed Apollo Hooks nearby.

To reduce the number of files to parse we should aim to only parse files with `.gql.tsx` extension. It's a long term goal.

## Fragments

Attach fragments as static property on React components.

See: https://www.apollographql.com/docs/react/data/fragments/#reusing-fragments

# Redux

Just don't use it ever. It adds too much complexity. Look at [Recoil](https://recoiljs.org/) if you need more advanced state management than `React.Context`.

# React Component code ordering

React Components with Apollo Hooks can get pretty large and unwieldy.

Notice the use of slashes (`////`) to split up the file.

```js

export const Companies: React.FC<any> = ({currentScout}: any) => {
  
  // Queries
  ////////////////////

  const where = {}
  const {data, error, loading} = useAdminTabGetCompaniesQuery({
    query: QUERY_COMPANIES,
    variables: {where},
  })

  // Mutations
  ////////////////////

  const [updateCompany] = useAdminPageUpdateCompanyMutation({
    mutation: UPDATE_COMPANY_MUTATION,
  })
  const listItemMutationOpts: any = getListItemMutationOpts({currentScout})
  const [addCompanyToScoutList] = useAdminPageAddCompanyToScoutListMutation({
    mutation: ADD_COMPANY_TO_SCOUT_LIST,
    ...listItemMutationOpts,
  })

  // Hooks
  ////////////////////

  const navigate = useNavigate()
  const location = useLocation()

  // Loading
  ////////////////////

  const res = handleApollo({error, loading})
  if (res) return res

  const dataSource = data?.companies

  // Columns
  ////////////////////

  const allColumnNames = getAllColumnsNames(dataSource)
  const columns = [...allColumnNames]

  // Data Handlers
  ////////////////////

  async function handleSave(record) {
    // do something...
  }

  async function handleCreateItem(rowId, newInput) {
    // do something...
  }

  async function handleRemoveItem(rowId, newValue, actionMeta) {
    // do something...
  }

  // Table
  ////////////////////

  const tableOpts = {
    dataSource,
    columns,
    scroll: {x: 6000},
    onSave: handleSave,
    // ...
  } as any
  return (
    <div>
      <EditableTable {...tableOpts}></EditableTable>
    </div>
  )
}
  
```

# Pass props as object instead of JSX props

It's much easier to work with JSON than JSX.

```jsx
  const tableProps = {
    dataSource,
    columns,
    scroll: {x: 6000},
    onSave: handleSave,
  } as any // Typed appropriately of course.
  
  // good
  return (
    <div>
      <EditableTable {...tableProps}></EditableTable>
    </div>
  )
  
  // bad
  return (
    <div>
      <EditableTable dataSource={dataSource} columns={columns}></EditableTable>
    </div>
  )
```
