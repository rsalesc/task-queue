/**
 * Created by root on 24/08/14.
 */

var Buffer = require('CBuffer');
var objdefined = require('objdefined');

var q = function(options){
    var _opts = options;
    if(!objdefined(_opts.capacity)) throw new Error("Buffer capacity must be passed to task-queue.");
    var _array = new Buffer(_opts.capacity);
    var _running = objdefined(_opts.start, false);

    _opts.concurrency = objdefined(_opts.concurrency, 1);

    var _exec = function() {
        if (_running) {
            var i, actual_concurrency = _opts.concurrency > _array.size ? _array.size : _opts.concurrency;
            for (i = 0; i < actual_concurrency; i++){
                var deq = _array.shift();
                if (deq) {
                    setImmediate(function () {
                        deq.method.apply(objdefined(deq.context, null),
                                            objdefined(deq.args, null));
                        actual_concurrency--;
                        if (actual_concurrency == 0) _exec();
                    });
                }
            }
        }
    };

    return{
        size: function(){
            return _array.size;
        },
        enqueue: function(fn, opts){ // support fn(args) arguments
            if(_array.isFull()) throw new Error("Circular buffer is at full capacity.");
            var task = objdefined(opts, {});
            task.method = fn;
            _array.push(task);
            console.log(task);
            _exec();
        },
        dequeue: function(){
            if(_array.size > 0)
                return _array.shift();
            return null;
        },
        concurrency: function(value){
            if(!objdefined(value)) return _opts.concurrency;
            _opts.concurrency = value;
        },
        start: function(){
            var old = _running;
            _running = true;
            if(!old) _exec();
        },
        stop: function(){
            _running = false;
        },
        isRunning: function(){
            return _running;
        }
    }
};

module.exports = q;