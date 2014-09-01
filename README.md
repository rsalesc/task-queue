[![npm status](http://img.shields.io/npm/v/task-queue.svg)](https://www.npmjs.org/package/task-queue)
[![dependency status](https://david-dm.org/skywalkerd/task-queue.svg)](https://david-dm.org/skywalkerd/task-queue)
[![experimental](http://img.shields.io/badge/stability-experimental-DD5F0A.svg)](http://nodejs.org/api/documentation.html#documentation_stability_index)

# Async [Priority] Task Queue

### Simple Usage

```javascript
var tq = require('task-queue');

var queue = tq.Queue({capacity: 10, concurrency: 1});
// initialize a 10-slot normal queue. concurrency 1 is the default
// it tells the worker in how many tasks it can work at a time

queue.start();
// start queue - now it's waiting for the queue to be populated

queue.enqueue(some_function); // simple way to enqueue a function
queue.enqueue(some_function, {args: args_array}); // provide args to the function

// both tasks above will be executed (one at a time, since concurrency is 1)

queue.stop();
// stops the queue execution
// it wont stop the tasks the worker is currently working on

queue.finished = some_callback_function;
// you can define a finished() callback that will
// be called everytime the worker empties the queue

var priority = tq.PriorityQueue({capacity: 10});
// initialize a 10-slot priority queue

priority.start();
```

### What is this?
`task-queue` is a simple node package which provides an **async task queue** that supports **concurrency**, **priority** and **timeouts**. It provides **callbacks** for tasks completed as well as a way to handle **single shot calls** (run all the tasks once).

### Features
- Async
- Concurrency
- Timeouts
- Callbacks
- Single-shot calls
- Priority

### Implementation-level details
The `Queue` is implemented over a *resizable buffer* so you do not need to worry about a max-space as well as massive reallocations. Just tell it the initial `capacity` you need and it will do the hard work for you.

The `PriorityQueue` is implemented over a *resizable binary heap* so you do not need to worry about max-space, massive reallocations as well as algorithm complexity.

### API
##### Queue
* `Queue(options)` - initialize a queue with the given option
    * `options`:
        * `capacity` - `Queue` initial capacity. **(required)**
        * `concurrency` - how many tasks the worker will execute at a time. default 1.
        * `timeout` - how much time the worker will sleep after each execution cycle.
* `isRunning()` - returns boolean indicating if `running` mode is set.
* `concurrency([value])` - get/set concurrency
* `timeout([value])` - get/set timeout
* `size()` - returns how many elements are currently on the queue
* `toArray()` - returns an array representation of the queue.

###### Flow
* `enqueue(fn [, task-opts])` - add task from function `fn` to the queue.
    * `task-opts`:
        * `args` - arguments array that will be applied to `fn` call.
* `dequeue()` - pull the first element from the queue, or null if it's empty.
* `singleShot()` - puts the queue in `single-shot` mode. all the queue elements will be executed once from now. Nothing can be enqueued while `single-shot` is active. When all the tasks are finished, the queue is put back in `normal` mode. you can `stop()` single-shot calls as well.
* `start()` - puts the queue in `running` mode. The worker will execute tasks whenever they are available if it's not sleeping.
* `stop()` - unset `running` mode and/or unset `single-shot` mode. The worker will finish all the tasks that were already dequeued and then go idle.

###### Callbacks
* `finished()` - called when all the tasks from the queue were executed (queue was emptied).
* `finishedTask([task-return])` - called whenever a task is executed. `task-return` is the return value of the task corresponding function.

##### PriorityQueue **extends Queue**
* `PriorityQueue` - `super` constructor.

###### Flow
* `enqueue(fn [, task-opts])` - add task from function `fn` to the queue.
    * `task-opts`:
        * `args` - arguments array that will be applied to `fn` call.
        * `priority` - comparable (with > or <) value that will be used to sort tasks executions by their relevance.