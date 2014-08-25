/**
 * Created by root on 24/08/14.
 */

var Buffer = require('cbuffer-resizable');
var objdefined = require('objdefined');
var extend = require('extend');
var util = require('util');

var q = function(options){
    if(!(this instanceof q)){
        return new q(options);
    }
    this._opts = options;
    if(!objdefined(this._opts.capacity)) throw new Error("Buffer capacity must be passed to task-queue.");
    this._array = new Buffer(this._opts.capacity);
    this._running = objdefined(this._opts.start, false);

    this._opts.concurrency = objdefined(this._opts.concurrency, 1);

    this._exec = function() {
        if (this._running) {
            var i, actual_concurrency = this._opts.concurrency > this.size() ? this.size() : this._opts.concurrency;
            for (i = 0; i < actual_concurrency; i++){
                var deq = this.dequeue();
                if (deq) {
                    setImmediate(function () {
                        deq.method.apply(objdefined(deq.context, null),
                                            objdefined(deq.args, null));
                        actual_concurrency--;
                        if (actual_concurrency == 0) this._exec();
                    });
                }
            }
        }
    };
};

q.prototype = {
    constructor: q,
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
            return this._array.shift();
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
    }
};

var p = function(options){  // p extends q
    if(!(this instanceof p)){
        return new p(options);
    }
    q.prototype.constructor.call(this, options);
    this._comparator = null;
    this.comparator(function(a, b){                                     // Array.sort() comparator
        return b.priority - a.priority;                               // Higher priority comes first
    });
};

util.inherits(p, q);

p.prototype.constructor = p;

p.prototype.comparator = function(fn){
    if(!objdefined(fn)) return this._comparator;
    this._comparator = fn;
    this._safe_comparator = function(a, b){
        if(!objdefined(a)) return 1;
        if(!objdefined(b)) return -1;
        return fn(a, b);
    };
};

p.prototype.enqueue = function(fn, opts){
    var size;
    if(size = q.prototype.enqueue.call(this, fn, objdefined(opts, {priority: 1}))){
        this._array.sort(this._safe_comparator);
        return size;
    }
    return false;
};

module.exports = {
    Queue: q,
    PriorityQueue: p
};