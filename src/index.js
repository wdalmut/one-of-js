module.exports = (list, options = {timeout: 3000}) => {
  return (req) => {
    return Promise.all(list
      .map(fn => {
        let timeoutId = false

        return Promise.race([
            fn(req),
            new Promise((_, reject) => {
              timeoutId = setTimeout(() => reject("Time limit exeeded"), options.timeout || 3000)
            }
          )])
          .then(data => {
            if (timeoutId !== false) {
              clearTimeout(timeoutId)
            }

            return Promise.resolve({
              success: true,
              data,
            })
          })
          .catch(data => {
            if (timeoutId !== false) {
              clearTimeout(timeoutId)
            }

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
