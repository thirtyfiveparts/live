import prettier from 'prettier'
import sqlFormatter from 'sql-formatter'

export const apolloLogging = ({logger}) => ({
  requestDidStart(requestContext) {
    // TODO(vjpr): Very verbose
    // console.log('Request started! Query:\n' + requestContext.request.query)
    return {
      parsingDidStart(requestContext) {
        // TODO(vjpr): Log request started.
      },
      didEncounterErrors(requestContext) {
        logger.info('Parsing started!')
        logger.info(
          '\n' +
            prettier.format(requestContext.request.query, {parser: 'graphql'}),
        )
        logger.info(
          '\n Variables: ' +
            JSON.stringify(requestContext.request.variables, null, 2),
          //prettier.format(JSON.stringify(requestContext.request.variables), {
          //  parser: 'json',
          //}),
        )
      },
      willSendResponse() {
        console.log('willSendResponse')
      },
      validationDidStart(requestContext) {
        logger.info('Validation started!')
      },
    }
  },
})

////////////////////////////////////////////////////////////////////////////////

// TODO(vjpr): Be very careful there are no exceptions possible in here because
//   they will cause hard-to-trace `INTERNAL_SERVER_ERROR`.
export const formatError = ({logger}) => err => {
  // Don't give the specific errors to the client.
  if (err.message.startsWith('Database Error: ')) {
    return new Error('Internal server error')
  }

  if (err.extensions.exception?.name === 'SequelizeDatabaseError') {
    // TODO(vjpr): https://github.com/benjie/prettier-plugin-pg

    logger.error(
      '\n' + sqlFormatter.format(err.extensions.exception.original.sql),
    )
    // TODO(vjpr): Format better!
    logger.error(err.extensions.exception.stacktrace)
  } else {
    logger.error(JSON.stringify(err, null, 2))
    logger.error(err)
  }

  // TODO(vjpr): The real error is hiding here:
  // err.extensions.exception.stacktrace

  // Otherwise return the original error.  The error can also
  // be manipulated in other ways, so long as it's returned.
  return err
}
