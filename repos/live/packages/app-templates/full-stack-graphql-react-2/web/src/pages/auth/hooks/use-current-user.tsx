import {gql, useQuery} from '@apollo/client'

export const useCurrentUser = () => {
  const CURRENT_USER = gql`
    query getCurrentUser {
      currentUser {
        id
        email
      }
    }
  `

  // useCreateScoutMutation()
  const {loading, error, data} = useQuery(CURRENT_USER)

  return {loading, error, data}
}
