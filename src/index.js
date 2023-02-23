import { initGlobalAPI } from './globalAPI.js';
import initMixin from './init.js'
import { initLifeCycle } from './lifeCycle.js';
import { nextTick, wtacher } from './observe/watcher.js';

function Vue(options){
    this._init(options)
}
Vue.prototype.$nextTick = nextTick
initMixin(Vue)
initLifeCycle(Vue)
initGlobalAPI(Vue)

// Vue最终都是调用这个触发
Vue.prototype.$watch = function (experOrFn,cb){
    // experOrFn可能是 字符串或者函数
    new wtacher(this,experOrFn,{user:true},cb)
}

export default Vue
