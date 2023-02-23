import { Dep } from "./observe/dep";
import { observe } from "./observe/index";
import { wtacher } from "./observe/watcher";

export function initState(vm){
    const opts = vm.$options
    if(opts.data){
        initData(vm)
    }
    if(opts.computed){
        initComputed(vm)
    }

    if(opts.watch){
        initWatch(vm)
    }
}

function initWatch(vm){
    let watch = vm.$options.watch
    for(let key in watch){
        // 字符串、数组 函数
        const handler = watch[key]
        if(Array.isArray(handler)){
            for(let i =0; i<handler.length ;i++){
                createWatcher(vm,key,handler[i])
            }
        }else{
            createWatcher(vm,key,handler)
        }
    }
    console.log(watch);
}

function createWatcher(vm,key,handler){
    if(typeof handler === "string"){
        handler = vm[handler]
    }
    return vm.$watch(key,handler)
}

function proxy(vm,target,key){
    Object.defineProperty(vm,key,{
        get(){
            return vm[target][key]
        },
        set(newValue){
            vm[target][key] = newValue
        }
    })
}

function initData(vm){
    let data = vm.$options.data
    data = typeof data === 'function' ? data.call(vm): data
    vm._data = data
    // 数据劫持
    observe(data)

    // 用vm._data 来劫持 vm  也就是取vm.xxx = vm._data.xxx
    for(let key in data){
        proxy(vm,'_data',key)
    }
}

function initComputed(vm){
    const computed = vm.$options.computed
    const watchers = vm._computedWatchers = {}

    for(let key in computed){
        const userDef = computed[key]
        const fn = typeof userDef === 'function' ? userDef : userDef.get
        watchers[key] = new wtacher(vm,fn,{lazy:true})
        defineComputed(vm,key,userDef)
    }
    // vm._computed
}

function defineComputed(vm,key,userDef){
    const setter = userDef.set || (()=>{})
    Object.defineProperty(vm,key,{
        get: createComputedGetter(key),
        set: setter
    })
}

// 计算属性不会收集依赖，只会把自己的dep去记录更外层次的watcher
function createComputedGetter(key){
    return function(){
        const watcher = this._computedWatchers[key]
        if(watcher.dirty){
            // 如果是dirty为true 就去执行用传的函数
            watcher.evaluate()
        }
        if(Dep.target){ // 计算属性出栈后，还有渲染watcher，我应该让计算属性watcher里面的属性，也去收集上一层的watcher
            watcher.depend()
        }
        return watcher.value
    }
}