/**
 * Created by root on 25/08/14.
 */

var tq = require('./index.js');

var q = tq.Queue({capacity: 64});

q.enqueue(function(){});
q.enqueue(function(){});
q.enqueue(function(){});
q.enqueue(function(){});

console.log(q._array);

var p = tq.PriorityQueue({capacity: 64});

p.enqueue(function(){});
p.enqueue(function(){}, {priority: 0});
p.enqueue(function(){}, {priority: 3});

console.log(p._array);