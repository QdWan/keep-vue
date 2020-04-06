class Watcher {
  constructor(vm, expOrFn, cb, id) {
    this.id = id || 0
    this.vm = vm
    this.cb = cb
    this.getter = parsePath(expOrFn)
    this.value = this.get()
  }

  get () {
    window.target = this
    const value = this.getter.call(this.vm, this.vm)
    window.target = undefined
    return value
  }
  update (value) {
    const oldValue = this.value
    this.cb.call(this.vm, value, oldValue)
    this.value = value
  }
}

function parsePath (path) {
  const paths = path.split('.')
  return function(obj) {
    for(let i = 0; i < paths.length; i++) {
      if(!obj[paths[i]]) return
      obj = obj[paths[i]]
    }
    return obj
  }
}
