const request    = require('supertest');
const express    = require('express');

const auth = require('@wdalmut/mini-auth');
const token = require('@wdalmut/token-auth');
const basic = require('@wdalmut/basic-auth');

const one_of = require('../src');

describe("One of", () => {
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
});
