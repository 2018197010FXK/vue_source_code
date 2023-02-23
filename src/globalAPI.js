import {
    mereOptions
} from "./utils"

export function initGlobalAPI(Vue) {
    Vue.options = {}
   

    Vue.mixin = function (mixin) {
        // 期望将用户的选项和全局的options进行合并
        this.options = mereOptions(this.options, mixin)
        return this
    }

}