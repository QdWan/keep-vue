const observedMethods = ['shift', 'unshift', 'push', 'pop', 'splice', 'reverse', 'sort']
function def (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: !!enumerable,
    value: val
  })
}
function getInterceptors(methods) {
  const arrayProto = Object.create(Array.prototype)
  methods.forEach(method => {
    const origin = arrayProto[method]
    def(arrayProto, method, function mutators(...args) {
      const ob = this.__ob__ // this是当前value的值
      const result = origin.apply(this, args)
      // 当元素新增的时候， 新增的元素也是要实时变化的, TODO: es6 proxy可以拦截到这些
      let inserted
      switch(method) {
        case 'push':
        case 'unshift':
          inserted = args
          break
        case 'splice':
          inserted = args.slice(2)
          break
      }
      if (inserted) ob.observeArray(inserted)
      ob.dep.notify(this)
      return result
    })
  })
  return arrayProto
}
class Dep {
  constructor () {
    this.subs = [] // 依赖存储
  }
  addSub (sub) {
    this.subs.push(sub)
  } 
  // 收集依赖
  depend () {
    if (window.target) {
      // 依赖去重
      if (!this.subs.find(x => window.target === x)) {
        console.log('collect dep')
        this.addSub(window.target)
      }
    }
  }
  notify (newVal, val) {
    for(let i = 0; i < this.subs.length; i++) {
      let sub = this.subs[i]
      sub.update(newVal, val)
    }
  }
  remove (sub) {
    if (this.subs.length) {
      const idx = this.subs.indexOf(sub)
      if (idx > -1) {
        this.subs.splice(idx, 1)
      }
    }
  }
}
function observe (value, asRootData) {
  if (typeof value !== 'object') {
    return 
  }
  let ob 
  if (value.hasOwnProperty('__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else {
    ob = new Observer(value)
  }
  return ob
}
function defineReactive (obj, k, v) {
  const childObj = observe(v)
  const dep = new Dep()
  Object.defineProperty(obj, k, {
    enumerable: true,
    configurable: true,
    get () {
      // 收集依赖
      dep.depend()
      if (childObj) { // 收集数组依赖
        childObj.dep.depend()
      }
      return v
    }, 
    set (newVal) {
      if (newVal == v) {
        return
      }
      dep.notify(newVal, v)
      val = newVal
      
    }
  })
}

class Observer {
  constructor(value) {
    this.value = value
    this.dep = new Dep()
    def(value, '__ob__', this) // 值增加依赖子依赖关系
    if (!Array.isArray(value)) {
      this.walk(value)
    } else {
      this.interceptArray(value)
      this.observeArray(value) // 让数组内的子元素变成响应式
    }
  }
  interceptArray (value) {
    var handle = getInterceptors.call(this, observedMethods)
    if (__proto__ in {}) {
      value.__proto__ = handle
    } else {
      observedMethods.forEach(k => {
        value[k] = handle[k]
      })
    }
  }
  observeArray(value) {
    for(let i = 0; i < value.length; i++) {
      observe(value[i])
    }
  }
  walk (obj) {
    for(let k in obj) {
      defineReactive(obj, k, obj[k])
    }
  }
}


