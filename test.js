/**
 * Created by root on 25/08/14.
 */

var tq = require('./index.js');
/*
var q = tq.Queue({capacity: 3});

q.enqueue(function(){});
q.enqueue(function(){});
q.enqueue(function(){});
q.enqueue(function(){});

console.log(q._array);
*/

var p = tq.PriorityQueue({capacity: 6, comparator: function(a,b){
    return a.priority > b.priority}});

p.enqueue(function(){}, {priority: 5});
p.enqueue(function(){}, {priority: 8});
p.enqueue(function(){}, {priority: 4});
p.enqueue(function(){}, {priority: 11});
p.enqueue(function(){}, {priority: 3});

console.log(p.dequeue());
console.log(p.dequeue());

console.log(p.toArray());