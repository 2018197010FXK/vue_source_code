(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

    var starts = {};
    var LIFECYCLE = ['beforeCreate', 'created'];
    LIFECYCLE.forEach(function (hook) {
      starts[hook] = function (p, c) {
        debugger;

        if (c) {
          // 如果儿子又，父亲没有，则将儿子包装成数组
          if (p) {
            return p.concat(c); //儿子有父亲没有，则将儿子包装成数组
          } else {
            return [c];
          }
        } else {
          return p; // 如果儿子没有，则用父亲即可
        }
      };
    });
    function mereOptions(parent, child) {
      var options = {};

      for (var key in parent) {
        mergeField(key);
      }

      for (var _key in child) {
        if (!parent.hasOwnProperty(_key)) {
          mergeField(_key);
        }
      }

      function mergeField(key) {
        // 策略模式
        if (starts[key]) {
          options[key] = starts[key](parent[key], child[key]);
        } else {
          options[key] = child[key] || parent[key];
        }
      }

      return options;
    }

    function initGlobalAPI(Vue) {
      Vue.options = {};

      Vue.mixin = function (mixin) {
        // 期望将用户的选项和全局的options进行合并
        this.options = mereOptions(this.options, mixin);
        return this;
      };
    }

    function _typeof(obj) {
      "@babel/helpers - typeof";

      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
        return typeof obj;
      } : function (obj) {
        return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      }, _typeof(obj);
    }

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      Object.defineProperty(Constructor, "prototype", {
        writable: false
      });
      return Constructor;
    }

    function _slicedToArray(arr, i) {
      return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
    }

    function _arrayWithHoles(arr) {
      if (Array.isArray(arr)) return arr;
    }

    function _iterableToArrayLimit(arr, i) {
      var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

      if (_i == null) return;
      var _arr = [];
      var _n = true;
      var _d = false;

      var _s, _e;

      try {
        for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"] != null) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    function _unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
    }

    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;

      for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

      return arr2;
    }

    function _nonIterableRest() {
      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
    var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
    var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 他匹配到的分组是一个 标签名  <xxx 匹配到的是开始 标签的名字

    var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配的是</xxxx>  最终匹配到的分组就是结束标签的名字

    var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性
    // 第一个分组就是属性的key value 就是 分组3/分组4/分组五

    var startTagClose = /^\s*(\/?)>/; // <div> <br/>

    function parseHTML(html) {
      var ELEMENT_TYPE = 1;
      var TEXT_TYPE = 3;
      var root;
      var currentParent; // 指向当前父元素

      var stack = []; // 

      function createASTElement(tag, attrs) {
        return {
          tag: tag,
          type: ELEMENT_TYPE,
          attrs: attrs,
          parent: null,
          children: []
        };
      }

      function start(tag, attrs) {
        // 创建节点
        var node = createASTElement(tag, attrs); // 如果没有根节点，创建的节点就为根节点

        if (!root) {
          root = node;
        }

        if (currentParent) {
          node.parent = currentParent;
          currentParent.children.push(node);
        }

        stack.push(node);
        currentParent = node; // currentParent为栈中的最后一个
      }

      function chars(text) {
        text = text.trim();
        text && currentParent.children.push({
          text: text,
          type: TEXT_TYPE,
          parent: currentParent
        });
      }

      function end() {
        stack.pop();
        currentParent = stack[stack.length - 1];
      } // 删除html已经匹配到的


      function advance(n) {
        html = html.substring(n);
      } // 匹配开始标签


      function parseStartTag() {
        var start = html.match(startTagOpen);

        if (start) {
          var match = {
            tagName: start[1],
            attrs: []
          };
          advance(start[0].length);

          var attr, _end; // 非结束标签就一直匹配


          while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
            advance(attr[0].length);
            match.attrs.push({
              key: attr[1],
              value: attr[3] || attr[4] || attr[5]
            });
          } // 删除匹配到的结束标签


          if (_end) {
            advance(_end[0].length);
          }

          return match;
        }

        return false; // 表示未匹配到开始标签
      }

      while (html) {
        var textEnd = html.indexOf('<'); //如果不为0，表示为文本结束的位置

        if (textEnd === 0) {
          // 匹配开始标签
          var startTagMatch = parseStartTag();

          if (startTagMatch) {
            start(startTagMatch.tagName, startTagMatch.attrs);
            continue;
          } // 匹配结束标签


          var endTagMatch = html.match(endTag);

          if (endTagMatch) {
            advance(endTagMatch[0].length);
            end(endTagMatch.tagName);
            continue;
          }
        }

        if (textEnd > 0) {
          var text = html.substring(0, textEnd);

          if (text) {
            advance(text.length);
            chars(text);
          }
        }
      }

      return root;
    }

    function genProps(attrs) {
      var str = '';
      attrs.forEach(function (item) {
        if (item.key === "style") {
          var styleArr = item.value.split(';');
          var obj = {};
          styleArr.forEach(function (styl) {
            var _styl$split = styl.split(':'),
                _styl$split2 = _slicedToArray(_styl$split, 2),
                key = _styl$split2[0],
                value = _styl$split2[1];

            obj[key] = value;
          });
          item.value = obj;
        }

        str += "".concat(item.key, ": ").concat(JSON.stringify(item.value), ",");
      });
      return "{".concat(str.slice(0, -1), "}");
    }

    var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{afadf}} 匹配到的分组就是结束标签的名字

    function gen(node) {
      if (node.type === 1) {
        return codegen(node);
      } else {
        // 文本
        var text = node.text;

        if (!defaultTagRE.test(text)) {
          return "_v(".concat(JSON.stringify(text), ")");
        } else {
          var token = [];
          var match;
          var lastIndex = 0;
          defaultTagRE.lastIndex = 0;

          while (match = defaultTagRE.exec(text)) {
            var index = match.index;

            if (index > lastIndex) {
              token.push(JSON.stringify(text.slice(lastIndex, index)));
            }

            token.push("_s(".concat(match[1].trim(), ")"));
            lastIndex = index + match[0].length;
          }

          if (lastIndex < text.length) {
            token.push(text.slice(lastIndex));
          }

          return "_v(".concat(token.join('+'), ")");
        }
      }
    }

    function genChildren(children) {
      return children.map(function (child) {
        return gen(child);
      }).join(',');
    }

    function codegen(ast) {
      var children = genChildren(ast.children);
      var code = "_c('".concat(ast.tag, "',\n  ").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : null, "\n  ").concat(ast.children.length ? ",".concat(children) : '', "\n  )");
      return code;
    }

    function compliToFunction(template) {
      // 1.将template 转化成ast语法树
      var ast = parseHTML(template); // 2.生成render方法，（render方法执行后返回的结果就是 虚拟DOM）

      var code = codegen(ast); // 任何模板引擎的实现方式都是 with + new Function

      code = "with(this){\n    return ".concat(code, "\n  }");
      var render = new Function(code);
      return render;
      /*   (function anonymous(
          ) {
          with(this){
              return _c('div',
            {id: "app",class: "hhh",style: {"color":" red"}}
            ,_c('span',
            null
            ,_v(_s(name)+"Hello world"+_s(name))
            ))}
          }) */
    }

    var id$1 = 0;
    var Dep = /*#__PURE__*/function () {
      function Dep() {
        _classCallCheck(this, Dep);

        this.id = id$1++;
        this.subs = [];
      }

      _createClass(Dep, [{
        key: "depend",
        value: function depend() {
          // this.sups.push(watcher) 这种方式会重复
          // 让watcher 去记录dep
          debugger;
          Dep.target.addDep(this);
        }
      }, {
        key: "addWatcher",
        value: function addWatcher(watcher) {
          this.subs.push(watcher);
        }
      }, {
        key: "notify",
        value: function notify() {
          debugger;
          this.subs.forEach(function (watcher) {
            watcher.update();
          });
        }
      }]);

      return Dep;
    }();
    Dep.target = null;
    var stack = [];
    function pushTarget(watcher) {
      stack.push(watcher);
      Dep.target = watcher;
    }
    function popTarget() {
      stack.pop();
      Dep.target = stack[stack.length - 1];
    }

    var id = 0;
    var wtacher = /*#__PURE__*/function () {
      function wtacher(vm, exprOrFn, options, cb) {
        _classCallCheck(this, wtacher);

        this.id = id++;
        this.randerWatcher = options; // 是不是渲染函数

        if (typeof exprOrFn === 'string') {
          this.getter = function () {
            return vm[exprOrFn];
          };
        } else {
          this.getter = exprOrFn;
        }

        this.cb = cb;
        this.deps = [];
        this.depsId = new Set(); // 存放已经获取过dep的id

        this.vm = vm;
        this.options = options;
        this.dirty = options.lazy;
        this.lazy = options.lazy;
        this.value = this.lazy ? undefined : this.get();
      }

      _createClass(wtacher, [{
        key: "addDep",
        value: function addDep(dep) {
          var id = dep.id; // 获取id

          if (!this.depsId.has(id)) {
            // 如果还未记录过该dep
            this.deps.push(dep);
            this.depsId.add(id);
            dep.addWatcher(this); // dep记录watcher
          }
        }
      }, {
        key: "depend",
        value: function depend() {
          var i = this.deps.length;

          while (i--) {
            this.deps[i].depend();
          }
        }
      }, {
        key: "evaluate",
        value: function evaluate() {
          this.value = this.get();
          this.dirty = false;
        }
      }, {
        key: "get",
        value: function get() {
          pushTarget(this);
          var value = this.getter.call(this.vm); //渲染方法

          popTarget();
          return value;
        }
      }, {
        key: "update",
        value: function update() {
          if (this.lazy) {
            this.dirty = true;
          } else {
            queueWatcher(this);
          }
        }
      }, {
        key: "run",
        value: function run() {
          var oldValue = this.value;
          var newVlaue = this.get();

          if (this.options.user) {
            this.cb.call(this.vm, oldValue, newVlaue);
          }
        }
      }]);

      return wtacher;
    }(); // 存储watcher

    var queue = [];
    var has = {};
    var pending = false;

    function flushSchedulerQueue() {
      var flushQueue = queue.slice(0);

      if (pending) {
        // 更新视图 将记录的watcher 统一更新
        flushQueue.forEach(function (p) {
          p.run();
        });
        has = {};
        queue = [];
        pending = false;
      }
    } // 属性修改时进行批量操作


    function queueWatcher(watcher) {
      var id = watcher.id; // 

      if (!has[id]) {
        // 如果没有记录这个watcher，就记录
        has[id] = true;
        queue.push(watcher);

        if (!pending) {
          // 第一次就开启异步操作
          nextTick(flushSchedulerQueue);
          pending = true;
        }
      }
    }

    var callbacks = [];
    var waiting = false;

    function flushCallbacks() {
      var cbs = callbacks.slice(0);
      callbacks = [];
      waiting = true;
      cbs.forEach(function (cb) {
        return cb();
      });
    } // 源码中的nextTick采用了优雅降级的方法
    //  promise -> MutationObserver -> setImmediate ->setTimeout


    var timerFunc;

    if (Promise) {
      timerFunc = function timerFunc() {
        Promise.resolve().then(flushCallbacks);
      };
    } else if (MutationObserver) {
      var observer = new MutationObserver(flushCallbacks);
      var textNode = document.createTextNode(1);
      observer.observe(textNode, {
        // 监听文字变化，如果变化就执行 flushCallbacks
        characterData: true
      });

      timerFunc = function timerFunc() {
        // 修改值，就会被监听到
        textNode.textContent = 2;
      };
    } else if (setImmediate) {
      timerFunc = function timerFunc() {
        setImmediate(flushCallbacks);
      };
    } else {
      timerFunc = function timerFunc() {
        setTimeout(flushCallbacks);
      };
    }

    function nextTick(cb) {
      // 维护nextTick中的callback方法，多次调用nextTick并不是使用了多个异步操作
      callbacks.push(cb);

      if (!waiting) {
        timerFunc();
        waiting = true;
      }
    }

    function createElementVNode(vm, tag) {
      var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      if (data == null) {
        data = {};
      }

      var key = data.key;

      if (key) {
        delete data.key;
      }

      for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
        children[_key - 3] = arguments[_key];
      }

      return vnode(vm, tag, key, data, children);
    }
    function createTextVNode(vm, text) {
      return vnode(vm, undefined, undefined, undefined, undefined, text);
    }

    function vnode(vm, tag, key, data, children, text) {
      return {
        vm: vm,
        tag: tag,
        key: key,
        data: data,
        children: children,
        text: text
      };
    }

    function initLifeCycle(Vue) {
      Vue.prototype._render = function () {
        // 当渲染的时候会去实例中取值，我们就可以将属性和视图绑定在一起
        return this.$options.render.call(this);
      };

      Vue.prototype._c = function () {
        return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
      };

      Vue.prototype._v = function () {
        return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
      };

      Vue.prototype._s = function (value) {
        if (_typeof(value) !== 'object') return value;
        return JSON.stringify(value);
      };

      Vue.prototype._update = function (vnode) {
        var vm = this;
        var el = vm.$el; // 既有初始化操作，又有更新

        vm.$el = patch(el, vnode);
      };
    }
    function mountComponent(vm, el) {
      // 1.调用rander函数，生成虚拟节点 虚拟dom
      vm.$el = el;

      var updateComponent = function updateComponent() {
        vm._update(vm._render());
      };

      new wtacher(vm, updateComponent, true); // 2.根据虚拟dom，生成节点
      // 3.插入到真实dom中
    }

    function patchProps(el, props) {
      for (var key in props) {
        if (key === 'style') {
          for (var styleName in props.style) {
            el.style[styleName] = props.style[styleName];
          }

          continue;
        }

        el.setAttribute(key, props[key]);
      }
    }

    function createElm(vnode) {
      var tag = vnode.tag,
          data = vnode.data,
          children = vnode.children,
          text = vnode.text;

      if (typeof tag === 'string') {
        vnode.el = document.createElement(tag);
        patchProps(vnode.el, data);
        children.forEach(function (child) {
          vnode.el.appendChild(createElm(child));
        });
      } else {
        vnode.el = document.createTextNode(text);
      }

      return vnode.el;
    }

    function patch(oldVNode, vnode) {
      var isRealElement = oldVNode.nodeType;

      if (isRealElement) {
        var elm = oldVNode;
        var parentElm = oldVNode.parentNode;
        var newElm = createElm(vnode);
        parentElm.insertBefore(newElm, elm.nextSibling);
        parentElm.removeChild(elm);
        return newElm;
      }
    }

    function callHook(vm, hook) {
      var handles = vm.$options[hook];

      if (handles) {
        handles.forEach(function (handler) {
          return handler();
        });
      }
    }

    var oldArrayProto = Array.prototype;
    var methods = ['push', 'pop', 'shift', 'unshift', 'reverse', 'splice', 'sort'];
    var newArrayProto = Object.create(oldArrayProto);
    methods.forEach(function (method) {
      newArrayProto[method] = function () {
        var _oldArrayProto$method;

        for (var _len = arguments.length, arg = new Array(_len), _key = 0; _key < _len; _key++) {
          arg[_key] = arguments[_key];
        }

        // 还是调用原arr上的方法，只是修改this的指向
        var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(arg));

        var ob = this.__ob__; // 用来对数组中新增的对象进行劫持

        var insertValue; //是一个数组

        switch (method) {
          case 'push':
          case "unshift":
            insertValue = arg;
            break;

          case 'splice':
            insertValue = arg.slice(2);
            break;
        }

        debugger; // this.walk(insertValue)

        if (insertValue) {
          ob.observeArray(insertValue);
        }

        ob.dep.notify(); // 数组变化了，通知对应的watcher

        return result;
      };
    });

    var Oberver = /*#__PURE__*/function () {
      function Oberver(data) {
        _classCallCheck(this, Oberver);

        this.dep = new Dep(); // 在data中新增一个属性_ob_ 当作实例，用来调用实例上的方法

        Object.defineProperty(data, '__ob__', {
          value: this,
          // 将ob设置为不可枚举的，防止爆栈
          enumerable: false
        });

        if (Array.isArray(data)) {
          data.__proto__ = newArrayProto;
          this.observeArray(data);
        } else {
          this.walk(data);
        }
      }

      _createClass(Oberver, [{
        key: "walk",
        value: function walk(data) {
          Object.keys(data).forEach(function (key) {
            return defineReactive(data, key, data[key]);
          });
        }
      }, {
        key: "observeArray",
        value: function observeArray(data) {
          // 劫持 数组中的对象
          data.forEach(function (key) {
            return observe(key);
          });
        }
      }]);

      return Oberver;
    }();

    function dependArray(value) {
      for (var i = 0; i < value.length; i++) {
        var current = value[i];

        current.__ob__.dep.depend();

        if (Array.isArray(current)) {
          dependArray(current);
        }
      }
    } // 数据劫持函数


    function defineReactive(target, key, value) {
      var childOb = observe(value); // 对所有对象精选属性劫持，childOb.dep 用来收集依赖

      var dep = new Dep();
      debugger;
      Object.defineProperty(target, key, {
        get: function get() {
          if (Dep.target) {
            dep.depend();

            if (childOb) {
              childOb.dep.depend(); // 让对象和数据也进行依赖收集
            }

            if (Array.isArray(value)) {
              dependArray(value);
            }
          }

          return value;
        },
        set: function set(newValue) {
          if (newValue === value) return;
          observe(newValue);
          value = newValue;
          dep.notify(); // 属性发生改变，就去通知对应的watcher去更新
        }
      });
    }

    function observe(data) {
      // 不是对象的不劫持
      if (_typeof(data) !== 'object' || data === null) {
        return;
      }

      if (data.__ob__ instanceof Oberver) {
        return;
      }

      return new Oberver(data);
    }

    function initState(vm) {
      var opts = vm.$options;

      if (opts.data) {
        initData(vm);
      }

      if (opts.computed) {
        initComputed(vm);
      }

      if (opts.watch) {
        initWatch(vm);
      }
    }

    function initWatch(vm) {
      var watch = vm.$options.watch;

      for (var key in watch) {
        // 字符串、数组 函数
        var handler = watch[key];

        if (Array.isArray(handler)) {
          for (var i = 0; i < handler.length; i++) {
            createWatcher(vm, key, handler[i]);
          }
        } else {
          createWatcher(vm, key, handler);
        }
      }

      console.log(watch);
    }

    function createWatcher(vm, key, handler) {
      if (typeof handler === "string") {
        handler = vm[handler];
      }

      return vm.$watch(key, handler);
    }

    function proxy(vm, target, key) {
      Object.defineProperty(vm, key, {
        get: function get() {
          return vm[target][key];
        },
        set: function set(newValue) {
          vm[target][key] = newValue;
        }
      });
    }

    function initData(vm) {
      var data = vm.$options.data;
      data = typeof data === 'function' ? data.call(vm) : data;
      vm._data = data; // 数据劫持

      observe(data); // 用vm._data 来劫持 vm  也就是取vm.xxx = vm._data.xxx

      for (var key in data) {
        proxy(vm, '_data', key);
      }
    }

    function initComputed(vm) {
      var computed = vm.$options.computed;
      var watchers = vm._computedWatchers = {};

      for (var key in computed) {
        var userDef = computed[key];
        var fn = typeof userDef === 'function' ? userDef : userDef.get;
        watchers[key] = new wtacher(vm, fn, {
          lazy: true
        });
        defineComputed(vm, key, userDef);
      } // vm._computed

    }

    function defineComputed(vm, key, userDef) {
      var setter = userDef.set || function () {};

      Object.defineProperty(vm, key, {
        get: createComputedGetter(key),
        set: setter
      });
    } // 计算属性不会收集依赖，只会把自己的dep去记录更外层次的watcher


    function createComputedGetter(key) {
      return function () {
        var watcher = this._computedWatchers[key];

        if (watcher.dirty) {
          // 如果是dirty为true 就去执行用传的函数
          watcher.evaluate();
        }

        if (Dep.target) {
          // 计算属性出栈后，还有渲染watcher，我应该让计算属性watcher里面的属性，也去收集上一层的watcher
          watcher.depend();
        }

        return watcher.value;
      };
    }

    function initMixin(Vue) {
      // 就是给Vue增加init方法的
      Vue.prototype._init = function (options) {
        // 用于初始化操作
        var vm = this; // 将实例的参数 放到实例上，以便于其他函数使用

        vm.$options = mereOptions(this.constructor.options, options);
        callHook(vm, 'beforeCreate'); // 初始化状态,初始化计算属性、watch

        initState(vm);
        callHook(vm, 'created'); // 挂载

        if (options.el) {
          vm.$mount(options.el);
        }
      };

      Vue.prototype.$mount = function (el) {
        el = document.querySelector(el);
        var vm = this;
        var ops = vm.$options;
        var template;

        if (!ops.render) {
          // 先检查有没有render函数
          if (!ops.template && el) {
            //没有template 没有tempalte 采用外部的tempalte
            template = el.outerHTML; // 没有写模板，但写了el
          } else {
            if (!el) {
              template = ops.template; // ；没有el，则采用模板的内容
            }
          } // 写了template 就用它


          if (template) {
            var render = compliToFunction(template);
            ops.render = render;
          }
        }

        mountComponent(vm, el);
        ops.render; // 最终都会被编译成render
      };
    } // vue核心原理
    // 1.创造响应式数据 2.将模板转化成ast语法树 
    // 3.将ast语法树转换成render函数 4 后续每次数据更新可以只执行render函数 （无需再次执行ast转化的过程）
    // render函数回去产生虚拟节点
    // 根据生成的虚拟节点创造真实的dom

    function Vue(options) {
      this._init(options);
    }

    Vue.prototype.$nextTick = nextTick;
    initMixin(Vue);
    initLifeCycle(Vue);
    initGlobalAPI(Vue); // Vue最终都是调用这个触发

    Vue.prototype.$watch = function (experOrFn, cb) {
      // experOrFn可能是 字符串或者函数
      new wtacher(this, experOrFn, {
        user: true
      }, cb);
    };

    return Vue;

}));
//# sourceMappingURL=vue.js.map
