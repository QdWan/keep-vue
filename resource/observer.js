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
      if (!this.subs.find(x => window.target === x)) {
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
function defineReactive (obj, k, v) {
  if (typeof v === 'object') {
    new Observer(v)
  }
  const dep = new Dep()
  Object.defineProperty(obj, k, {
    enumerable: true,
    configurable: true,
    get () {
      // 收集依赖
      dep.depend()
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
    if (!Array.isArray(value)) {
      this.walk(value)
    }
  }
  walk (obj) {
    for(let k in obj) {
      defineReactive(obj, k, obj[k])
    }
  }
}
