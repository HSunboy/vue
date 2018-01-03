/* @flow */

import { baseOptions } from './options'//编译的设置
import { createCompiler } from 'compiler/index'

const { compile, compileToFunctions } = createCompiler(baseOptions)

export { compile, compileToFunctions }
