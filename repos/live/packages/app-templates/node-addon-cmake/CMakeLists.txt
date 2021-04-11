cmake_minimum_required(VERSION 3.17)

project(
  addon
  #LANGUAGES CXX
)

# ------------------------------------------------------------------------------
# Conan Package Manager
# ------------------------------------------------------------------------------

# NOTE: We use `build-conan` because sometimes the `build` dir will be deleted by cmake-js if the build fails.
#include(${CMAKE_BINARY_DIR}/conanbuildinfo.cmake)
include(build-conan/conanbuildinfo.cmake)
conan_basic_setup(
  # Conan will only modify a target instead of modifying global cmake variables.
  TARGETS
  # Don't let Conan change output dirs.
  NO_OUTPUT_DIRS
  # Rpaths
  KEEP_RPATHS
)

# ------------------------------------------------------------------------------
# Carthage Package Manager
# ------------------------------------------------------------------------------

set(CARTHAGE_BUILD_DIR "${CMAKE_SOURCE_DIR}/Carthage/Build/Mac")

# ------------------------------------------------------------------------------
# Build Settings
# ------------------------------------------------------------------------------

# TODO(vjpr): Not sure if needed anymore.
# CXX compiler flags
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_STANDARD 17)
# --

if (${CMAKE_SYSTEM_NAME} MATCHES "Darwin")

  # `find_packages` only searches for macOS `.frameworks`.
  set(CMAKE_FIND_FRAMEWORK ONLY)
  set(ENV{MACOSX_DEPLOYMENT_TARGET} "10.7.0")
  set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -fobjc-arc")
  #set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -fmodules")
  set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${CMAKE_C_FLAGS} -std=c++11 -stdlib=libc++")
  # TODO: I think this is only useful for shared libraries.
  #set(CMAKE_MACOSX_RPATH FALSE)

  # TODO(vjpr): Something is setting this to TRUE. Maybe Conan but I checked already.
  set(CMAKE_SKIP_RPATH FALSE)

elseif (WIN32)

endif ()

# ------------------------------------------------------------------------------
# Target: Example
# ------------------------------------------------------------------------------

add_executable(example
  ./src/native/example/main.cpp
  ./src/native/example/foo.mm)

# Carthage.
find_library(CLJ CocoaLumberjack HINTS ${CARTHAGE_BUILD_DIR})
set(TARGET_EXAMPLE_CARTHAGE_LIBS ${CLJ})
#target_link_libraries(example ${CMAKE_SOURCE_DIR}/Carthage/Build/Mac/CocoaLumberjack.framework)

# macOS Cocoa Libraries.
find_library(FOUNDATION_LIBRARY Foundation)
set(TARGET_EXAMPLE_COCOA_LIBS ${FOUNDATION_LIBRARY})

target_link_libraries(example
  CONAN_PKG::poco
  ${TARGET_EXAMPLE_CARTHAGE_LIBS}
  ${TARGET_EXAMPLE_COCOA_LIBS}
  )

# ------------------------------------------------------------------------------
# rpath
# ------------------------------------------------------------------------------

# To check the rpath of an exe see: https://stackoverflow.com/questions/12521802/print-rpath-of-an-executable-on-macos
# otool -l <binary>
# See also: https://gitlab.kitware.com/cmake/community/-/wikis/doc/cmake/RPATH-handling

# Makes the linker replace `@rpath` (runtime path) with the Frameworks dir in the executable.
# I.e. `@rpath/CocoaLumberjack.framework/Versions/A/CocoaLumberjack`
set(RPATH_EXECUTABLE_PATH_FRAMEWORKS @executable_path/Frameworks)
# We allow `.frameworks` to be found in the Carthage build dir.
# TODO: This won't work when shipping a release though. We need to copy to Frameworks dir.
set(RPATH_CARTHAGE ${CARTHAGE_BUILD_DIR})

# TODO: XCode requires space-separated paths.
set(TARGET_EXAMPLE_RPATH_XCODE "${RPATH_EXECUTABLE_PATH_FRAMEWORKS} ${RPATH_CARTHAGE}")

# This creates a cmake list.
set(TARGET_EXAMPLE_RPATH "${RPATH_EXECUTABLE_PATH_FRAMEWORKS}" "${RPATH_CARTHAGE}")

set_target_properties(example
  PROPERTIES
  XCODE_ATTRIBUTE_LD_RUNPATH_SEARCH_PATHS
    ${TARGET_EXAMPLE_RPATH_XCODE})

if (${CLION})

#  set_target_properties(example
#    PROPERTIES
#    MACOSX_RPATH TRUE
#    SKIP_BUILD_RPATH FALSE
#    BUILD_WITH_INSTALL_RPATH ON
#    INSTALL_RPATH_USE_LINK_PATH TRUE
#    INSTALL_RPATH "${TARGET_EXAMPLE_RPATH}"
#  )

endif ()

# ------------------------------------------------------------------------------
# CLion Support
# ------------------------------------------------------------------------------

if (${CLION})
  # This variable is set using `-DCLION=1` in the CMake tool window config in CLion.
  #message(STATUS CLION = ${CLION})
  # This allows CLion to properly configure IDE code indexing, etc.
  # NOTE: We can also create an External Tool to run `cmake-js` when building instead
  #   of relying on these settings during builds.
  include("./node_modules/@live/cmakejs-to-cmake/index.cmake")
  setup_cmakejs()

  # TODO(vjpr): I think this is only needed if we are building from CLion.
  # See: https://github.com/cmake-js/cmake-js/issues/1#issuecomment-95120715
  set(CMAKE_SHARED_LINKER_FLAGS "${CMAKE_SHARED_LINKER_FLAGS} -undefined dynamic_lookup")

endif ()

# ------------------------------------------------------------------------------
# XCode / AppCode support
# ------------------------------------------------------------------------------

# XCode is a multi-config generator. An XCode project will be generated with multiple configurations.
# See: https://stackoverflow.com/a/24470998/130910

# This modifies `LIBRARY_OUTPUT_DIRECTORY` to prevent XCode outputting our library to `build/Release/Release`.
# This is because XCode is a multi-configuration generator which means it handles its build configs itself.
# See: https://cmake.org/cmake/help/latest/prop_tgt/LIBRARY_OUTPUT_DIRECTORY.html
if (${CMAKE_GENERATOR} MATCHES "Xcode")
  # NOTE: This must be set before a target is created.
  set(CMAKE_LIBRARY_OUTPUT_DIRECTORY "")
endif ()

# ------------------------------------------------------------------------------
#  Source files and libraries (different for macos, windows, linux)
# ------------------------------------------------------------------------------

# Shared
# ---------------------

file(
  GLOB SOURCE_FILES
  ${SOURCE_FILES}
  "./src/native/shared/*.*"
)

if (${CMAKE_SYSTEM_NAME} MATCHES "Darwin")

  # macOS
  # ---------------------

  file(
    GLOB SOURCE_FILES
    ${SOURCE_FILES}
    # NOTE: `**/*.mm` only works for nested dirs.
    "./src/native/macos/*.mm"
    "./src/native/macos/*.h"
  )

  # macOS Frameworks
  # ---

  # See: https://gitlab.kitware.com/cmake/community/-/wikis/doc/cmake/platform_dependent_issues/HowToUseExistingOSXFrameworks
  # Where cmake searches for libraries: https://cmake.org/pipermail/cmake/2005-December/007736.html
  find_library(FOUNDATION_LIBRARY Foundation)
  find_library(APPKIT_LIBRARY AppKit)
  find_library(APP_SERVICES_LIBRARY ApplicationServices)
  find_library(CORE_GRAPHICS_LIBRARY CoreGraphics)

  # Don't display in CMake GUI.
  mark_as_advanced(
    FOUNDATION_LIBRARY
    APPKIT_LIBRARY
    APP_SERVICES_LIBRARY
    CORE_GRAPHICS_LIBRARY
  )

  set(EXTRA_LIBS
    ${FOUNDATION_LIBRARY}
    ${APPKIT_LIBRARY}
    ${APP_SERVICES_LIBRARY}
    ${CORE_GRAPHICS_LIBRARY})

elseif (WIN32)

  # Windows
  # ---------------------

  file(
    GLOB SOURCE_FILES
    ${SOURCE_FILES}
    "./src/native/win/*.*"
  )

endif ()

# ------------------------------------------------------------------------------
# Target
# ------------------------------------------------------------------------------

# We name our native addon after the project name. Maybe we should customize this.
set(TARGET_ADDON ${PROJECT_NAME})

# We are building a shared library named after the project name.
# TODO(vjpr): I think we don't need `CMAKE_JS_SRC`.
add_library(${TARGET_ADDON} SHARED ${SOURCE_FILES} ${CMAKE_JS_SRC})

# Naming of library `addon.node` without the default `lib` prefix.
set_target_properties(
  ${TARGET_ADDON}
  PROPERTIES
  PREFIX ""
  SUFFIX ".node"
  # TODO: Not sure if needed anymore.
  # TODO: Check if we can pass multiple properties to cmake using this form of command.
  CXX_STANDARD 14
  CMAKE_CXX_STANDARD_REQUIRED ON
  # --
)

target_link_libraries(${TARGET_ADDON} ${CMAKE_JS_LIB} ${EXTRA_LIBS})

# ------------------------------------------------------------------------------
# Headers
# ------------------------------------------------------------------------------

# Additional directories to be search for header files.
include_directories(${CMAKE_JS_INC})

set(NODE_EXE "node")

if (${CLION})
  set(NODE_EXE "/Users/Vaughan/nvm/versions/node/v14.2.0/bin/node")
endif ()

# Include N-API wrappers.
execute_process(
  COMMAND ${NODE_EXE} -p "require('node-addon-api').include"
  COMMAND_ERROR_IS_FATAL ANY
  WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
  OUTPUT_VARIABLE NODE_ADDON_API_DIR
)
message(NODE_ADDON_API_DIR ${NODE_ADDON_API_DIR})
string(REPLACE "\n" "" NODE_ADDON_API_DIR ${NODE_ADDON_API_DIR})
string(REPLACE "\"" "" NODE_ADDON_API_DIR ${NODE_ADDON_API_DIR})
target_include_directories(${TARGET_ADDON} PRIVATE ${NODE_ADDON_API_DIR})

# ------------------------------------------------------------------------------
# NAPI Definitions
# ------------------------------------------------------------------------------

add_definitions(-DNAPI_VERSION=3)

# ------------------------------------------------------------------------------
# Debug
# ------------------------------------------------------------------------------

message("Generated with config types: ${CMAKE_CONFIGURATION_TYPES}")

# Print out variables to check things are in order.
#get_property(
#  library_output_dir
#  DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
#  PROPERTY CMAKE_LIBRARY_OUTPUT_DIRECTORY)
#message(STATUS "library_output_dir='${library_output_dir}'")

# DEBUG: Print all `include_directories`.
#get_property(dirs DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR} PROPERTY INCLUDE_DIRECTORIES)
#message(STATUS "Printing INCLUDE_DIRECTORIES:")
#foreach (dir ${dirs})
#  message(STATUS "'${dir}'")
#endforeach ()
# ---

# ------------------------------------------------------------------------------
# Print all variables
# ------------------------------------------------------------------------------

# Alternatively run `cmake -LAH`. Or `ccmake`. Or `cmake --trace-expand`.

# Comment/uncomment below:
function(dump_cmake_variables)
    get_cmake_property(_variableNames VARIABLES)
    list (SORT _variableNames)
    foreach (_variableName ${_variableNames})
        if (ARGV0)
            unset(MATCHED)
            string(REGEX MATCH ${ARGV0} MATCHED ${_variableName})
            if (NOT MATCHED)
                continue()
            endif()
        endif()
        message(STATUS "${_variableName}=${${_variableName}}")
    endforeach()
endfunction()

get_cmake_property(_variableNames VARIABLES)

list (SORT _variableNames)
foreach (_variableName ${_variableNames})
    message(STATUS "${_variableName}=${${_variableName}}")
endforeach()

# ------------------------------------------------------------------------------
