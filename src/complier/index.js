import {
  parseHTML
} from "./parse";


function genProps(attrs) {
  let str = ''
  attrs.forEach(item => {
    if (item.key === "style") {
      const styleArr = item.value.split(';')
      const obj = {}
      styleArr.forEach(styl => {
        const [key, value] = styl.split(':')
        obj[key] = value
      })
      item.value = obj
    }
    str += `${item.key}: ${JSON.stringify(item.value)},`

  });
  return `{${str.slice(0,-1)}}`
}
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g // {{afadf}} 匹配到的分组就是结束标签的名字

function gen(node) {
  if (node.type === 1) {
    return codegen(node)
  } else {
    // 文本
    let text = node.text
    if (!defaultTagRE.test(text)) {
      return `_v(${JSON.stringify(text)})`
    } else {
      let token = []
      let match
      let lastIndex = 0
      defaultTagRE.lastIndex = 0
      while (match = defaultTagRE.exec(text)) {
        let index = match.index
        if (index > lastIndex) {
          token.push(JSON.stringify(text.slice(lastIndex, index)))
        }
        token.push(`_s(${match[1].trim()})`)
        lastIndex = index + match[0].length
      }
      if (lastIndex < text.length) {
        token.push(text.slice(lastIndex))
      }
      return `_v(${token.join('+')})`
    }

  }

}

function genChildren(children) {
  return children.map(child => gen(child)).join(',')
}

function codegen(ast) {
  let children = genChildren(ast.children)
  let code = (`_c('${ast.tag}',
  ${ast.attrs.length > 0 ? genProps(ast.attrs):null }
  ${ast.children.length ? `,${children}`:''}
  )`)
  return code
}

export function compliToFunction(template) {
  // 1.将template 转化成ast语法树
  let ast = parseHTML(template)
  // 2.生成render方法，（render方法执行后返回的结果就是 虚拟DOM）
  let code = codegen(ast)

  // 任何模板引擎的实现方式都是 with + new Function
  code = `with(this){
    return ${code}
  }`

  let render = new Function(code)

  return render


/*   (function anonymous(
    ) {
    with(this){
        return _c('div',
      {id: "app",class: "hhh",style: {"color":" red"}}
      ,_c('span',
      null
      ,_v(_s(name)+"Hello world"+_s(name))
      ))}
    }) */
}