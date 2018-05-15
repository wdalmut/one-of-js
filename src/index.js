const q = require('q');

module.exports = (list) => {
  return (req) => {
    return q.any(list.map((fn) => fn(req)));
  };
};
