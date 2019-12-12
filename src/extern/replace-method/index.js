var recast   = require('recast')
var visit = recast.types.visit
var build    = recast.types.builders
var parse    = recast.parse
var print    = recast.print

module.exports = replacer

function replacer(ast) {
  if (Buffer.isBuffer(ast)) ast = String(ast)
  if (typeof ast === 'string')
    ast = parse(ast)

  replace.code = code
  replace.replace = replace

  return replace

  function code() {
    return print(ast).code
  }

  function replace(methodPath, updater) {
    methodPath = Array.isArray(methodPath)
      ?  methodPath
      : [methodPath]

    var size = methodPath.length

    // traverse(ast, size === 1
    //   ? single
    //   : nested
    // )
    visit(ast, {
      visitCallExpression(path){
        // console.log(path)
        const result = size === 1 ? single(path.node) : nested(path.node)
        if (result !== undefined) {
          // console.log(result)
          // console.log(this)
          // return false
          path.replace(result)
        }
        this.traverse(path)
      }
    })

    return replace

    function single(node) {
      if (node.type !== 'CallExpression' && node.type !== 'Identifier') return;
      if (node.type === 'CallExpression' && methodPath[0] !== node.callee.name) return;
      if (node.type === 'Identifier' && methodPath[0] !== node.name) return;

      return updater(node)
    }

    function nested(node) {
      if (node.type !== 'CallExpression') return

      var c = node.callee
      var o = node.callee
      var i = size - 1

      if (c.type === 'Identifier') return
      while (c && c.type === 'MemberExpression') {
        o = c
        if (c.computed) return
        if (methodPath[i] !== c.property.name) return
        c = c.object
        i = i - 1
      }

      if (!o.object || !o.object.name) return
      if (o.object.name !== methodPath[0]) return

      return updater(node)
    }
  }
}
