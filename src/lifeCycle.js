import { wtacher } from "./observe/watcher";
import { createElementVNode, createTextVNode } from "./vdom";

export function initLifeCycle(Vue){
    Vue.prototype._render = function(){
        // 当渲染的时候会去实例中取值，我们就可以将属性和视图绑定在一起

        return this.$options.render.call(this)
    }

    Vue.prototype._c = function(){
        return createElementVNode(this,...arguments)
    }    
    Vue.prototype._v = function(){
        return createTextVNode(this,...arguments)
    }
    Vue.prototype._s = function(value){
        if(typeof value !== 'object')return value
        return JSON.stringify(value)
    }



    Vue.prototype._update = function(vnode){
        const vm = this
        const el = vm.$el
        // 既有初始化操作，又有更新
        
        vm.$el= patch(el,vnode)
        
    }
}

export function mountComponent(vm,el){
    // 1.调用rander函数，生成虚拟节点 虚拟dom
    vm.$el = el
    
    const updateComponent =()=>{
        vm._update(vm._render())
    }
    let watcher= new wtacher(vm,updateComponent,true)

    // 2.根据虚拟dom，生成节点


    // 3.插入到真实dom中
}

function patchProps(el,props){
    for(let key in props){
        if(key === 'style'){
            for(let styleName in props.style){
                el.style[styleName] = props.style[styleName]
            }
            continue
        }
        el.setAttribute(key,props[key])
    }
}

function createElm(vnode){
    const {tag,data,children,text} = vnode
    if(typeof tag === 'string'){
        vnode.el = document.createElement(tag)
        patchProps(vnode.el,data)
        children.forEach(child => {
            vnode.el.appendChild(createElm(child))
        });
    }else{
        vnode.el = document.createTextNode(text)
    }
    return vnode.el
    

}

function patch(oldVNode,vnode){
    const isRealElement = oldVNode.nodeType
    if(isRealElement){
        const elm = oldVNode

        const parentElm = oldVNode.parentNode
        let newElm = createElm(vnode)
        parentElm.insertBefore(newElm,elm.nextSibling)
        parentElm.removeChild(elm)
        return newElm
    }else{
        // diff算法
    }

    
}

export function callHook(vm,hook){
    const handles= vm.$options[hook]
    if(handles){
        handles.forEach(handler=>handler())
    }
    
}