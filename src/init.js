import { compliToFunction } from "./complier/index"
import { callHook, mountComponent } from "./lifeCycle"
import { initState } from "./state"
import { mereOptions } from "./utils"

export default function initMixin(Vue){      // 就是给Vue增加init方法的
    Vue.prototype._init = function(options){ // 用于初始化操作
        const vm = this
        // 将实例的参数 放到实例上，以便于其他函数使用
        vm.$options = mereOptions(this.constructor.options,options)

        callHook(vm,'beforeCreate')
        // 初始化状态,初始化计算属性、watch
        initState(vm)
        callHook(vm,'created')

        // 挂载
        if(options.el){
            vm.$mount(options.el)
        }
    }

    Vue.prototype.$mount = function(el){
        el = document.querySelector(el)
        const vm = this
        let ops = vm.$options
        let template
        if(!ops.render){ // 先检查有没有render函数
            if(!ops.template && el){ //没有template 没有tempalte 采用外部的tempalte
                template = el.outerHTML // 没有写模板，但写了el
            }else{
                if(!el){
                    template = ops.template // ；没有el，则采用模板的内容
                }
            }

            // 写了template 就用它
            if(template){
                const render = compliToFunction(template)
                ops.render = render
            }
        }

        mountComponent(vm,el)
        

        ops.render; // 最终都会被编译成render
    }
}

// vue核心原理
// 1.创造响应式数据 2.将模板转化成ast语法树 
// 3.将ast语法树转换成render函数 4 后续每次数据更新可以只执行render函数 （无需再次执行ast转化的过程）
// render函数回去产生虚拟节点
// 根据生成的虚拟节点创造真实的dom