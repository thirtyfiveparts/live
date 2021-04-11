import {print} from 'graphql/language/printer'
import {parse} from 'graphql/language/parser'
import stringifyObject from 'stringify-object'
import c from 'chalk'
import indent from 'indent'
import isEmptyObject from 'is-empty-object'

export default function(operation) {
  const {variables, extensions, operationName, query} = operation

  const queryStr = print(operation.query)

  const stringifyOpts = {
    indent: '  ',
    singleQuotes: true,
  }

  const variablesStr = stringifyObject(variables, stringifyOpts)
  const extensionsStr = stringifyObject(extensions, stringifyOpts)

  const header = str => c.grey.bold.underline(str + ':') + '\n'

  let str = ''
  str += c.bold('Executing GraphQL query')
  str += '\n'
  if (operationName) str += 'Operation Name:' + operationName
  str += header('Query')
  str += indent(c.grey(queryStr), 2)
  str += '\n'
  str += header('Variables') + indent(c.grey(variablesStr), 2)
  if (!isEmptyObject(extensions))
    str += '\n' + header('Extensions') + extensionsStr

	return indent(str, 2)
}
