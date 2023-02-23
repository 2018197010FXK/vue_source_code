let oldArrayProto = Array.prototype

const methods=[
    'push',
    'pop',
    'shift',
    'unshift',
    'reverse',
    'splice',
    'sort'
]

export let newArrayProto = Object.create(oldArrayProto)

methods.forEach(method=>{
    newArrayProto[method] = function(...arg){
        // 还是调用原arr上的方法，只是修改this的指向
        let result =oldArrayProto[method].call(this,...arg)

        let ob = this.__ob__
        // 用来对数组中新增的对象进行劫持
        let insertValue //是一个数组
        switch(method){
            case 'push':
            case "unshift":
                insertValue = arg;
                break;
            case 'splice':
                insertValue = arg.slice(2)
                break;
            default:
                break;
        }
        debugger

        // this.walk(insertValue)
        if(insertValue){
            ob.observeArray(insertValue)
        }
        ob.dep.notify() // 数组变化了，通知对应的watcher
        
        return result
    }
})