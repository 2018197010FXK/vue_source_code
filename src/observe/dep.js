
let id = 0
export class Dep{
    constructor(){
        this.id = id++
        this.subs = []
    }
    depend(){
        // this.sups.push(watcher) 这种方式会重复
        // 让watcher 去记录dep
        debugger
        Dep.target.addDep(this)
    }
    addWatcher(watcher){
        this.subs.push(watcher)
    }
    notify(){
        debugger
        this.subs.forEach(watcher=>{ watcher.update()})
    }
}

Dep.target = null

const stack = []
export  function pushTarget(watcher){
    stack.push(watcher)
    Dep.target = watcher
}

export function popTarget(){
    stack.pop()
    Dep.target = stack[stack.length-1]
}



let has = {}