import { newArrayProto } from "./array";
import { Dep } from "./dep";

class Oberver{
    constructor(data){
        this.dep = new Dep()
        // 在data中新增一个属性_ob_ 当作实例，用来调用实例上的方法
        Object.defineProperty(data,'__ob__',{
            value:this,
            // 将ob设置为不可枚举的，防止爆栈
            enumerable: false 
        })
        if(Array.isArray(data)){
            data.__proto__ = newArrayProto
            this.observeArray(data)
        }else{
            this.walk(data)
        }
    }
    walk(data){
        Object.keys(data).forEach(key =>  defineReactive(data,key,data[key]));
    }
    observeArray(data){
        // 劫持 数组中的对象
        data.forEach(key=>observe(key))
    }
}

function dependArray(value){
    for(let i=0;i<value.length;i++){
        let current = value[i]
        current.__ob__.dep.depend()
        if(Array.isArray(current)){
            dependArray(current)
        }
    }
}

// 数据劫持函数
function defineReactive(target,key,value){
    let childOb = observe(value) // 对所有对象精选属性劫持，childOb.dep 用来收集依赖
    let dep = new Dep()
    debugger
    Object.defineProperty(target,key,{
        get(){
            if(Dep.target){
                dep.depend()
                if(childOb){
                    childOb.dep.depend() // 让对象和数据也进行依赖收集
                }

                if(Array.isArray(value)){
                    dependArray(value)
                }
            }
            return value
        },
        set(newValue){
            if(newValue === value)return
            observe(newValue)
            value = newValue
            dep.notify() // 属性发生改变，就去通知对应的watcher去更新
        }
    })
}

export function observe(data){
    // 不是对象的不劫持
    if(typeof data!=='object' || data === null){
        return
    }

    if(data.__ob__ instanceof Oberver){
        return
    }

    return new Oberver(data)
}