
tq = require('../index')
expect = require('chai').expect

CBuffer = require('cbuffer-resizable')
Heap = require('binaryheap-resizable')

count_fn = (fn, target_count) ->
  return (args...) ->
    fn(args...) if --target_count is 0
    return null


# test

empty_fn = ->
single_capacity = {capacity: 1}

describe 'task-queue', ->

  describe 'Queue', ->

    it 'should always return Queue object', ->
      expect(tq.Queue(single_capacity)).to.be.an.instanceof(tq.Queue)

    it 'should throw when capacity is not passed', ->
      expect(tq.Queue).to.throw()

    it 'should init circular buffer', ->
      expect(tq.Queue(single_capacity)._array).to.be.an.instanceof(CBuffer)

    describe 'enqueue', ->

      it 'should add element to circular buffer', ->
        (q = tq.Queue(single_capacity)).enqueue(empty_fn)
        expect(q._array.toArray()).to.deep.equals([{method: empty_fn}])

      it 'should return new size', ->
        expect(tq.Queue(single_capacity).enqueue(empty_fn, {})).to.equals(1)

      it 'should throw when single-shooting', ->
        (q = tq.Queue(single_capacity)).singleShot()
        expect(-> q.enqueue(empty_fn)).to.throw()

    describe 'dequeue', ->

      q = tq.Queue(single_capacity)

      it 'should return null when empty', ->
        expect(q.dequeue()).to.be.null;

      it 'should return first-in element if populated', ->
        q.enqueue(empty_fn)
        q.enqueue(empty_fn)
        expect(q.dequeue()).to.deep.equals({method: empty_fn})

    describe 'concurrency', ->

      q = tq.Queue(single_capacity)

      it 'should set concurrency when argument is set', ->
        q.concurrency(5)
        expect(q.opts.concurrency).to.equals(5)

      it 'should return concurrency when arguments are empty', ->
        expect(q.concurrency()).to.equals(q.opts.concurrency)

    describe 'options', ->
      q = tq.Queue(single_capacity)

      it 'should extend options when argument is set', ->
        q.options({lol: 1})

      it 'should return options when argument is not set', ->
        expected = single_capacity
        expected.lol = 1
        expect(q.options()).to.deep.equals(expected)

    describe '_exec (and finished)', ->

      sum = 0
      q = tq.Queue({capacity: 3, concurrency: 2})
      q.enqueue(-> sum++) for n in [1..2]

      it 'should call finished and finishedTask twice', (done) ->
        done = count_fn(done, 3)
        q.finished = -> done()
        q.finishedTask = -> done()
        q.start()

      it 'should execute and dequeue methods properly', ->
        expect(sum).to.equals(2)
        expect(q.size()).to.equals(0)

    describe 'singleShot', ->
      q = tq.Queue({capacity: 3, concurrency: 2})
      q.enqueue(-> return) for [1..3]

      it 'should run only once', (done) ->
        q.finished = ->
          expect(q._running).to.be.not.truthy
          expect(q._running).to.be.not.truthy
          q.finished = null
          done()
        q.singleShot()

      it 'should throw when already running', ->
        q.stop()
        q.start()
        expect(q.singleShot).to.throw()

    describe 'timeout', ->
      timeout = 100
      q = tq.Queue({capacity: 2, timeout})
      q.enqueue(empty_fn) for [1..2]

      it 'should make worker timeout', (done) ->
        timedout = false
        q.finished = ->
          throw new Error("worker didnt timeout") unless timedout
          done()
        setTimeout((-> timedout = true), timeout)
        q.singleShot()

  describe 'PriorityQueue', ->

    q = tq.PriorityQueue(single_capacity)

    it 'should return PriorityQueue object extended from Queue', ->
      expect(q).to.be.an.instanceof(tq.PriorityQueue)
      expect(q).to.be.an.instanceof(tq.Queue)

    it 'should init heap', ->
      expect(q._array).to.be.an.instanceof(Heap)
