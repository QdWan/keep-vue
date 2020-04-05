class Watcher {
  constructor(vm, expOrFn, cb) {
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
  update () {
    const oldValue = this.value
    const value = this.get()
    this.cb.call(this.vm, value, oldValue)
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

module.exports = Watcher