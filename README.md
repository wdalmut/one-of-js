# One Of

[![Build Status](https://travis-ci.org/wdalmut/one-of-js.svg?branch=master)](https://travis-ci.org/wdalmut/one-of-js)
[![codecov](https://codecov.io/gh/wdalmut/one-of-js/branch/master/graph/badge.svg)](https://codecov.io/gh/wdalmut/one-of-js)

```sh
npm install --save @wdalmut/one-of
```

A simple auth middleware to support one of many authentication methods

```js
const auth = require('@wdalmut/mini-auth');
const token = require('@wdalmut/token-auth');
const basic = require('@wdalmut/basic-auth');
const one_of = require('@wdalmut/one-of');

app.get(
    "/",
    auth(one_of([token(from_token), basic(from_basic)]),
    homePage
);
```

where `from_token` and `from_basic` are simple functions that will returns a promise

```js
const from_token = (token) => {
    return Promise.resolve({id: 1});
};

const from_basic = (username, password) => {
    return Promise.resolve({id: 1});
};
```

If one authentication mechanism resolve the promise the authentication is
considered valid otherwise a 401 is immediately returned.

