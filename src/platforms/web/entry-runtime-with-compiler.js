/* @flow */

//系统功能配置文件
import config from 'core/config'
//提醒,函数缓存
import { warn, cached } from 'core/util/index'
//性能分析功能
import { mark, measure } from 'core/util/perf'

import Vue from './runtime/index'
//查询dom,没有则提醒，并且返回一个div
import { query } from './util/index'
//编译核心啦
import { compileToFunctions } from './compiler/index'
//不同浏览器对换行符的处理，是否会发生转义
import { shouldDecodeNewlines, shouldDecodeNewlinesForHref } from './util/compat'

//获取对应id的html内容
const idToTemplate = cached(id => {
  const el = query(id)
  return el && el.innerHTML
})

const mount = Vue.prototype.$mount
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  //获取到这个dom啦
  el = el && query(el)

  /* istanbul ignore if */
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }

  const options = this.$options
  // resolve template/el and convert to render function
  if (!options.render) {
    let template = options.template
    if (template) {//获取模版
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {//这个是一个有id的模版dom
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) {//是一个dom
        template = template.innerHTML
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) {//不存在模版也不存在render，取dom的html
      template = getOuterHTML(el)
    }
    if (template) {//假如get到了模版，则开始渲染
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')
      }//计算性能

      const { render, staticRenderFns } = compileToFunctions(template, {//编译模版啦
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,//模版分隔符，例如{{model}}
        comments: options.comments//注释是否保留
      }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')//计算编译时间
      }
    }
  }
  return mount.call(this, el, hydrating)
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML (el: Element): string {
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    const container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}

Vue.compile = compileToFunctions

export default Vue
