const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 他匹配到的分组是一个 标签名  <xxx 匹配到的是开始 标签的名字
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配的是</xxxx>  最终匹配到的分组就是结束标签的名字
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性
// 第一个分组就是属性的key value 就是 分组3/分组4/分组五
const startTagClose = /^\s*(\/?)>/; // <div> <br/>


export function parseHTML(html) {
  let ELEMENT_TYPE = 1
  let TEXT_TYPE = 3
  let root
  let currentParent // 指向当前父元素
  const stack = [] // 

  function createASTElement(tag, attrs) {
    return {
      tag,
      type: ELEMENT_TYPE,
      attrs,
      parent: null,
      children: []
    }

  }

  function start(tag, attrs) {
    // 创建节点
    let node = createASTElement(tag, attrs)
    // 如果没有根节点，创建的节点就为根节点
    if (!root) {
      root = node
    }
    if (currentParent) {
      node.parent = currentParent
      currentParent.children.push(node)
    }
    stack.push(node)
    currentParent = node // currentParent为栈中的最后一个
  }

  function chars(text) {
    text = text.trim()
    text && currentParent.children.push({
      text,
      type: TEXT_TYPE,
      parent: currentParent
    })
  }

  function end() {
    let node = stack.pop()
    currentParent = stack[stack.length - 1]
  }

  // 删除html已经匹配到的
  function advance(n) {
    html = html.substring(n)
  }

  // 匹配开始标签
  function parseStartTag() {
    const start = html.match(startTagOpen)
    if (start) {
      const match = {
        tagName: start[1],
        attrs: []
      }

      advance(start[0].length)

      let attr, end
      // 非结束标签就一直匹配
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        advance(attr[0].length)
        match.attrs.push({
          key: attr[1],
          value: attr[3] || attr[4] || attr[5]
        })
      }
      // 删除匹配到的结束标签
      if (end) {
        advance(end[0].length)
      }

      return match
    }

    return false // 表示未匹配到开始标签

  }

  while (html) {
    const textEnd = html.indexOf('<') //如果不为0，表示为文本结束的位置

    if (textEnd === 0) {
      // 匹配开始标签
      const startTagMatch = parseStartTag()
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs)
        continue
      }
      // 匹配结束标签
      let endTagMatch = html.match(endTag)
      if (endTagMatch) {
        advance(endTagMatch[0].length)
        end(endTagMatch.tagName)
        continue
      }
    }

    if (textEnd > 0) {
      let text = html.substring(0, textEnd)
      if (text) {
        advance(text.length)
        chars(text)
      }
    }

  }
  return root
}