import { Dep, popTarget, pushTarget } from "./dep"
// watcher 与dep
let id = 0
export class wtacher{
    constructor(vm,exprOrFn,options,cb){
        this.id = id++
        this.randerWatcher = options // 是不是渲染函数
        if(typeof exprOrFn === 'string'){
            this.getter = function(){
                return vm[exprOrFn]
            }
        }else{
            this.getter = exprOrFn
        }
        this.cb = cb
        this.deps= []
        this.depsId = new Set() // 存放已经获取过dep的id
        this.vm = vm
        this.options = options
        this.dirty = options.lazy
        this.lazy = options.lazy
        this.value = this.lazy ? undefined : this.get()
    }
    addDep(dep){
        let id = dep.id // 获取id
        if(!this.depsId.has(id)){ // 如果还未记录过该dep
            this.deps.push(dep)
            this.depsId.add(id)
            dep.addWatcher(this) // dep记录watcher
        }
    }
    depend(){
        let i = this.deps.length
        while(i--){
            this.deps[i].depend()
        }
    }
    evaluate(){
        this.value = this.get()
        this.dirty = false
    }
    get(){
        pushTarget(this)
        let value =  this.getter.call(this.vm) //渲染方法
        popTarget(this)
        return value
    }
    update(){
        if(this.lazy){
            this.dirty = true
        }else{
            queueWatcher(this)
        }
    }
    run(){
        let oldValue = this.value
        let newVlaue = this.get()
        if(this.options.user){
            this.cb.call(this.vm,oldValue,newVlaue)
        }
    }
}


// 存储watcher
let queue = []
let has = {}
let pending = false
function flushSchedulerQueue(){
    const flushQueue = queue.slice(0)
    if(pending){
        // 更新视图 将记录的watcher 统一更新
        flushQueue.forEach(p=>{p.run()})

        has = {}
        queue = []
        pending = false
    }
}

// 属性修改时进行批量操作
function queueWatcher(watcher){ 
    const id= watcher.id
    // 
    if(!has[id]){ // 如果没有记录这个watcher，就记录
        has[id] = true 
        queue.push(watcher)
        if(!pending){ // 第一次就开启异步操作
            nextTick(flushSchedulerQueue)
            pending = true
        }
        
    }
}

let callbacks = []
let waiting = false

function flushCallbacks(){
    let cbs = callbacks.slice(0)
    callbacks = []
    waiting = true
    cbs.forEach(cb=>cb())
}
// 源码中的nextTick采用了优雅降级的方法
//  promise -> MutationObserver -> setImmediate ->setTimeout

let timerFunc
if(Promise){
    timerFunc=()=>{
        Promise.resolve().then(flushCallbacks)
    }
}else if(MutationObserver){
    let observer = new MutationObserver(flushCallbacks)
    let textNode = document.createTextNode(1)
    observer.observe(textNode,{
        // 监听文字变化，如果变化就执行 flushCallbacks
        characterData:true  
    })
    timerFunc = ()=>{
        // 修改值，就会被监听到
        textNode.textContent = 2 
    }
}else if(setImmediate){
    timerFunc = () =>{
        setImmediate(flushCallbacks)
    }
}else{
    timerFunc = ()=>{
        setTimeout(flushCallbacks)
    }
}

export function nextTick(cb){
    // 维护nextTick中的callback方法，多次调用nextTick并不是使用了多个异步操作
    callbacks.push(cb) 

    if(!waiting){
        timerFunc()
        waiting=true
    }
}

