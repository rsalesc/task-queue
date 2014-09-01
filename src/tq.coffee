
Buffer = require('cbuffer-resizable')
Heap = require('binaryheap-resizable')

# extend helper
extend = (object, properties) ->
  for key, val of properties
    object[key] = val
  return object


class Queue

  constructor: (@opts = {}) ->
    return new Queue(opts) unless (@ instanceof Queue)

    throw new Error("Buffer capacity must be passed") unless @opts.capacity?
    @opts._running = @opts.start ? false
    @opts.concurrency = @opts.concurrency ? 1
    @_initArray()

  _initArray: ->
    @_array = new Buffer(@opts.capacity)

  _exec: ->
    if @_running
      real_concurrency = actual_concurrency = if @opts.concurrency > @size() then @size() else @opts.concurrency
      setImmediate(=>
        deq.method.apply(deq.context ? null, deq.args ? null)
        if --actual_concurrency is 0
          @_exec
          setImmediate(@finished) if @finished?
      ) for n in [1..real_concurrency] when (deq = @dequeue())?
      return

  size: ->
    return @_array.size;

  enqueue: (fn, opts = {}) ->
    opts.method = fn
    size = @_array.push(opts)
    @_exec()
    return size

  dequeue: ->
    return if @size() > 0 then @_array.pop() else null

  concurrency: (value) ->
    return @opts.concurrency unless value?
    @opts.concurrency = value
    return

  start: ->
    wasRunning = @_running
    @_running = true
    @_exec() unless wasRunning
    return

  stop: ->
    @_running = false
    return

  isRunning: ->
    return @_running

  options: (opts) ->
    return @opts unless opts?
    extend(@opts, opts)
    return

  toArray: ->
    return @_array.toArray()


class PriorityQueue extends Queue

  constructor: (opts = {}) ->
    return new PriorityQueue(opts) unless (@ instanceof PriorityQueue)
    opts.comparator ?= (a, b) -> return a.priority > b.priority
    super(opts)

  _initArray: ->
    @_array = new Heap(@opts.capacity, @opts.comparator)


module.exports = {
  Queue,
  PriorityQueue
}