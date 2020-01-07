const request    = require('supertest');
const express    = require('express');

const auth = require('@wdalmut/mini-auth');
const token = require('@wdalmut/token-auth');
const basic = require('@wdalmut/basic-auth');

const one_of = require('../src');

describe("One of", () => {
  describe("Functional", () => {
    let app = null;

    const ok =  () => {
      return Promise.resolve({id: 1});
    };
    const ko = () => {
      return Promise.reject({err: "Missing"});
    };

    beforeEach(() => {app = express()})

    it("should fail on missing authenticate header", (done) => {
      app.get(
        "/test",
        auth(one_of([token(ok), basic(ok)])),
        (req, res) => res.status(200).json(req.user)
      )

      request(app)
        .get('/test')
        .expect(401, done)
      ;
    })

    it("should pass on valid token header", (done) => {
      app.get(
        "/test",
        auth(one_of([token(ok), basic(ko)])),
        (req, res) => res.status(200).json(req.user)
      )

      request(app)
        .get('/test')
        .set('Authorization', 'Bearer test')
        .expect(200, {id: 1}, done)
      ;
    })

    it("should pass on valid basic auth header", (done) => {
      app.get(
        "/test",
        auth(one_of([token(ko), basic(ok)])),
        (req, res) => res.status(200).json(req.user)
      )

      request(app)
        .get('/test')
        .set('Authorization', 'Basic dGVzdDp0ZXN0')
        .expect(200, {id: 1}, done)
      ;
    })

    it("should reject on both auth fails", (done) => {
      app.get(
        "/test",
        auth(one_of([token(ko), basic(ko)])),
        (req, res) => res.status(200).json(req.user)
      )

      request(app)
        .get('/test')
        .set('Authorization', 'Bearer test')
        .expect(401, done)
      ;
    });

    it("should reject on both auth fails with basic header", (done) => {
      app.get(
        "/test",
        auth(one_of([token(ko), basic(ko)])),
        (req, res) => res.status(200).json(req.user)
      )

      request(app)
        .get('/test')
        .set('Authorization', 'Basic dGVzdDp0ZXN0')
        .expect(401, done)
      ;
    });
  })

  describe("Unit", () => {
    it("should pass on all valid", (done) => {
      one_of([
        () => Promise.resolve("OK"),
        () => Promise.resolve("OK2"),
        () => Promise.resolve("OK3")
      ])({})
      .then(data => {
        expect(["OK", "OK2", "OK3"].indexOf(data)).not.toBeLessThan(0)
        done()
      })
      .catch(err => done(new Error(err)))
    });

    [
      { input: [ () => Promise.resolve("OK"), () => Promise.reject("Fail"), () => Promise.resolve("OK3") ], output: ["OK", "OK3"] },
      { input: [ () => Promise.reject("Fail"), () => Promise.resolve("OK"), () => Promise.resolve("OK3") ], output: ["OK", "OK3"] },
      { input: [ () => Promise.reject("Fail"), () => Promise.resolve("OK"), () => Promise.reject("Fail2") ], output: ["OK"] },
      { input: [ () => Promise.reject("Fail1"), () => Promise.reject("Fail2"), () => Promise.resolve("OK3") ], output: ["OK3"] },
      { input: [ () => Promise.resolve("OK"), () => Promise.reject("Fail3"), () => Promise.reject("Fail2") ], output: ["OK"] },
    ].map(({input, output}) => {
      it("should pass on valids", (done) => {
        one_of(input)({})
        .then(data => {
          expect(output.indexOf(data)).not.toBeLessThan(0)
          done()
        })
        .catch(err => done(new Error(err)))
      })
    });

    [
      { input: [ () => Promise.reject("Fail1"), () => Promise.reject("Fail2"), () => Promise.reject("Fail3") ], output: [] },
      { input: [ () => Promise.reject("Fail1"), () => Promise.reject("Fail2") ], output: [] },
      { input: [ () => Promise.reject("Fail1") ], output: [] },
    ].map(({input, output}) => {
      it("should fail on all errors", (done) => {
        one_of(input)({})
        .then(data => {
          done(new Error("Should not pass!"))
        })
        .catch(err => {
          expect(err.message).toBe("No one promise returns correctly")
          done()
        })
      })
    });

    [
      { input: [ () => new Promise(resolve => {
        setTimeout(() => resolve("OK"), 1500)
      }) ], output: [] },
    ].map(({input, output}) => {
      it("should fail on timeouts", (done) => {
        one_of(input, {timeout: 150})({})
        .then(data => {
          done(new Error("Should not pass!"))
        })
        .catch(err => {
          expect(err.message).toBe("No one promise returns correctly")
          done()
        })
      })
    })
  })
});
