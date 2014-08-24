/**
 * Created by root on 24/08/14.
 */

var extend = require('extend');

var q = function(options){
    var _opts = options;
    var _array = this._opts.initialSize ? new Array(this._opts.initialSize) : [];
    var _running = this._opts.start;

    _opts.concurrency = this._opts.concurrency | 1;

    var _exec = function(){
        var actual_concurrency = _opts.concurrency > this._array.length ? this._array.length : _opts.concurrency;
        while(actual_concurrency > 0){
            var popped = this._array.pop();
            if(popped)
                setImmediate(popped.method, popped.args);
            actual_concurrency--;
        }
    };

    return{
        size: function(){
            return _array.length;
        },
        push: function(fn){ // support fn(args) arguments
            this._array.push(arguments.length > 1 ? {
                method: fn,
                args: Array.prototype.slice.call(arguments, 2)
            } : {method: fn});
        },
        pop: function(){
            if(this.size() > 0)
                return this._array.pop();
            return null;
        },
        concurrency: function(value){
            if(value === undefined) return _opts.concurrency;
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