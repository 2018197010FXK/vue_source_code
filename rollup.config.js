// "@rollup/plugin-babel"
import babel from "rollup-plugin-babel"
import {nodeResolve} from '@rollup/plugin-node-resolve'
export default{
    input:'./src/index.js',
    output:{
        file:'.dist/vue.js',
        name:'Vue',     //golbal.Vue
        format:'umd',   //打包的方式  exm es6模块 commonjs模块 iife自执行函数 umd （commonjs amd）
        sourcemap:true  //希望可以调试源代码
    },
    plugins:[
        babel({
            exclude:'node_modules/**'//排除掉node_module中的所有模块
        }),
        nodeResolve()
    ]
}