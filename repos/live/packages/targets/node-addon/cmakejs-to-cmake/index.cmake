function(setup_cmakejs)

  execute_process(
    # TODO(vjpr): Might need to specify whether its debug or release or else release is used by default. Should use `.npmrc`.
    COMMAND node -p "require('./index.js')('${CMAKE_SOURCE_DIR}')"
    #WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
    WORKING_DIRECTORY ${CMAKE_CURRENT_FUNCTION_LIST_DIR}
    OUTPUT_VARIABLE COMMAND_OUTPUT
    OUTPUT_STRIP_TRAILING_WHITESPACE
  )

  # This would coerce our list to a string.
  #string(REPLACE "\n" "" COMMAND_OUTPUT ${COMMAND_OUTPUT})
  #string(REPLACE "\"" "" COMMAND_OUTPUT ${COMMAND_OUTPUT})
  # --

  # TODO(vjpr): There is a `{}` added to the end of the output. Maybe because of `node -p`

  message(VERBOSE "command_output=${COMMAND_OUTPUT}")

  # COMMAND_OUTPUT = `foo/bar;foo/bar;foo/bar` (which is a list in cmake)
  list(GET COMMAND_OUTPUT 0 CMAKE_JS_INC)
  list(GET COMMAND_OUTPUT 1 CMAKE_JS_LIB)
  list(GET COMMAND_OUTPUT 2 CMAKE_LIBRARY_OUTPUT_DIRECTORY)
  message(VERBOSE CMAKE_LIBRARY_OUTPUT_DIRECTORY=${CMAKE_LIBRARY_OUTPUT_DIRECTORY})

  # PARENT_SCOPE - set the variable outside this function.
  set(CMAKE_JS_INC ${CMAKE_JS_INC} PARENT_SCOPE)
  set(CMAKE_JS_LIB ${CMAKE_JS_LIB} PARENT_SCOPE)
  set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_LIBRARY_OUTPUT_DIRECTORY} PARENT_SCOPE)

endfunction(setup_cmakejs)
