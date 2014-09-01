
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
    @opts._singleShot = false
    @opts.concurrency ?= 1
    @opts.timeout ?= 0
    @_initArray()

  _initArray: ->
    @_array = new Buffer(@opts.capacity)

  _exec: ->
    if @_running
      real_concurrency = actual_concurrency = if @opts.concurrency > @size() then @size() else @opts.concurrency
      setImmediate(=>
        deq.method.apply(deq.context ? null, deq.args ? null)
        if --actual_concurrency is 0
          if @_singleShot and @size() is 0
            @_singleShot = false
            @_running = false
          @_exec
          setTimeout(@finished, @opts.timeout) if @finished?
      ) while real_concurrency-- when (deq = @dequeue())?
      return

  size: ->
    return @_array.size;

  enqueue: (fn, opts = {}) ->
    throw new Error("can not enqueue item while single-shooting") if @_singleShot
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

  timeout: (value) ->
    return @opts.timeout unless value?
    @opts.timeout = value
    return

  start: ->
    throw new Error("can not start queue while single-shooting") if @_singleShot
    wasRunning = @_running
    @_running = true
    @_exec() unless wasRunning
    return

  stop: ->
    @_running = false
    @_singleShot = false
    return

  isRunning: ->
    return @_running

  options: (opts) ->
    return @opts unless opts?
    extend(@opts, opts)
    return

  toArray: ->
    return @_array.toArray()

  singleShot: ->
    throw new Error("can not single-shot a running queue") if @_running
    @_running = true
    @_singleShot = true
    @_exec()
    return


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