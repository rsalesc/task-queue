module.exports = require('./lib/tq');

/**
 * Created by root on 24/08/14.
 */
/*
var Buffer = require('cbuffer-resizable');
var Heap = require('binaryheap-resizable');
var extend = require('extend');
var util = require('util');

var objdefined = function(obj, opt){
    if(arguments.length > 1)
        return obj !== undefined && obj != null ? obj : opt;
    return obj !== undefined && obj != null;
};

var q = function(options){
    if(!(this instanceof q)){
        return new q(options);
    }
    this._opts = options || {};
    if(!objdefined(this._opts.capacity)) throw new Error("Buffer capacity must be passed to task-queue.");
    this._running = objdefined(this._opts.start, false);
    this._opts.concurrency = objdefined(this._opts.concurrency, 1);
    this._initArray();
};

q.prototype = {
    constructor: q,
    _initArray: function(){
        this._array = new Buffer(this._opts.capacity);
    },
    _exec: function() {
        var self = this;
        if (this._running) {
            var i, actual_concurrency = this._opts.concurrency > this.size() ? this.size() : this._opts.concurrency;
            for (i = 0; i < actual_concurrency; i++){
                var deq = this.dequeue();
                if (deq) {
                    setImmediate(function () {
                        deq.method.apply(objdefined(deq.context, null),
                            objdefined(deq.args, null));
                        actual_concurrency--;
                        if (actual_concurrency == 0) self._exec();
                    });
                }
            }
        }
    },
    size: function(){
        return this._array.size;
    },
    enqueue: function(fn, opts){ // supports fn(args..) arguments in opts.args = [args..]
        var task = objdefined(opts, {});
        task.method = fn;
        var size = this._array.push(task);
        this._exec();
        return size;
    },
    dequeue: function(){
        if(this.size() > 0)
            return this._array.pop();
        return null;
    },
    concurrency: function(value){
        if(!objdefined(value)) return this._opts.concurrency;
        this._opts.concurrency = value;
    },
    start: function(){
        var old = this._running;
        this._running = true;
        if(!old) this._exec();
    },
    stop: function(){
        this._running = false;
    },
    isRunning: function(){
        return this._running;
    },
    options: function(opts){
        if(!objdefined(opts)) return this._opts;
        extend(this._opts, opts);
    },
    toArray: function(){
        return this._array.toArray();
    }
};

var p = function(options){  // p extends q
    if(!(this instanceof p)){
        return new p(options);
    }
    options = options || {};
    options.comparator = options.comparator || function(a, b){ // Array.sort() comparator
        return a.priority > b.priority;                               // Higher priority comes first
    };
    q.prototype.constructor.call(this, options);
};

util.inherits(p, q);

p.prototype.constructor = p;

p.prototype.comparator = function(fn){
    if(!objdefined(fn)) return this._opts.comparator;
    this._opts.comparator = fn;
};

p.prototype.enqueue = function(fn, opts){
    var size;
    if(size = q.prototype.enqueue.call(this, fn, objdefined(opts, {}))){
        return size;
    }
    return false;
};

p.prototype._initArray = function(){
    this._array = new Heap(this._opts.capacity, this._opts.comparator);
};

module.exports = {
    Queue: q,
    PriorityQueue: p
}; */