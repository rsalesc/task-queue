/**
 * Created by root on 24/08/14.
 */

var q = function(options){
    var _opts = options;
    var _array = this._opts.initialSize ? new Array(this._opts.initialSize) : [];
    var _running = this._opts.start | false;

    _opts.concurrency = this._opts.concurrency | 1;

    var _exec = function() {
        if (_running) {
            var i, actual_concurrency = _opts.concurrency > this._array.length ? this._array.length : _opts.concurrency;
            for (i = 0; i < actual_concurrency; i++){
                var popped = this._array.pop();
                if (popped)
                    setImmediate(function () {
                        popped.method.apply(popped.context | null, popped.args | null);
                        actual_concurrency--;
                        if (actual_concurrency == 0) _exec();
                    });
            }
        }
    };

    return{
        size: function(){
            return _array.length;
        },
        push: function(fn, opts){ // support fn(args) arguments
            var task = opts | {};
            task.method = fn;
            this._array.push(task);
            _exec();
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

module.exports = q;