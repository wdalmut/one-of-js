module.exports = (list) => {
  return (req) => {
    return Promise.all(list
      .map(fn => {
        return fn(req)
          .then(data => {
            return Promise.resolve({
              success: true,
              data,
            })
          })
          .catch(data => {
            return Promise.resolve({
              success: false,
              data,
            })
          })
      })
    )
    .then(list => list.filter(i => i.success))
    .then(list => list.pop())
    .then(response => {
      if (!response) {
        return Promise.reject(new Error("No one promise returns correctly"))
      }

      return Promise.resolve(response.data)
    })
  };
};
