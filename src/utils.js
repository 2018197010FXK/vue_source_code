
 const starts = {}
 const LIFECYCLE = [
     'beforeCreate',
     'created'
 ]

 LIFECYCLE.forEach(hook => {
     starts[hook] = function (p, c) {
        debugger
         if (c) { // 如果儿子又，父亲没有，则将儿子包装成数组
             if (p) {
                 return p.concat(c) //儿子有父亲没有，则将儿子包装成数组
             } else {
                 return [c]
             }
         } else {
             return p // 如果儿子没有，则用父亲即可
         }
     }
 })
export function mereOptions(parent,child){
    const options = {}

    
    for(let key in parent){
        mergeField(key)
    }

    for(let key in child){
        if(!parent.hasOwnProperty(key)){
            mergeField(key)
        }
    }

    function mergeField(key){
        // 策略模式
        if(starts[key]){
           options[key] = starts[key](parent[key],child[key])
        }else{
            options[key] = child[key] || parent[key]
        }

    }
    return options
}