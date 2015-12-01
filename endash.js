// absurdly tiny lodash dropin, to avoid large amounts of repetitive dependency

var slice = [].slice;
function assign(source) {
  slice.call(arguments, 1).forEach(function(target) {
    for (var p in target) {
      if (target.hasOwnProperty(p)) {
        source[p] = target[p];
      }
    }
  });
  return source;
}
function find(coll, pred) {
  for (var i = 0; i < coll.length; i++) {
    if (pred(coll[i])) return coll[i];
  }
}
function findWhere(coll, props) {
  return find(coll, function(item) {
    for (var p in props) {
      if (props[p] !== item[p]) {
        return false;
      }
    }
    return true;
  })
}

module.exports = {
  assign: assign,
  find: find,
  findWhere: findWhere
};
