import chai from 'chai'
import App from './app'
import Cache from 'cache-base'
import sinon from 'sinon'
import request from 'supertest'

const assert = chai.assert

describe('App', () => {
    let sandbox = null
    let store = null 
    let jwt = { verify : () => null }
    let jwtInvalid = { verify : () => null }
    let jwtDifferentUser = { verify : () => null }

    let app = null
        
    beforeEach(() => {
        
        store = new Cache()
        
        store.set('my-device2', { deviceId: 'my-device2', uid : '123'})
        
        sandbox = sinon.createSandbox()

        sandbox.stub(jwt,'verify').returns({sub : '123'})
        sandbox.stub(jwtDifferentUser,'verify').returns({sub : '124'})
        sandbox.stub(jwtInvalid,'verify').returns({error : {code : 'auth/argument-error', message : 'blah blah'}})
        
        app = App({ store, jwt })
    
    })
    afterEach(() => {
        sandbox.restore()
        app.close()
    })
    it('get status', done => {
        request(app)
          .get('/status')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err) => {
            if (err) return done(err)
            done()
        })
    })
    it('get device', done => {
        request(app)
          .get('/my-device2')
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer 1234')
          .expect(200)
          .expect({ deviceId : 'my-device2', uid : '123' })
          .end((err) => {
            if (err) return done(err)
            done()
        })
    })
    it('get with bad JWT token', done => {
        
        const invalidJWTapp = App({ store, jwt: jwtInvalid })
        
        request(invalidJWTapp)
          .get('/my-device2')
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer 1234')
          .expect('Content-Type', /json/)
          .expect(401)
          .end((err) => {
            if (err) return done(err)
            done()
        })
    })
    it('get with bad JWT token different user', done => {
        
        const invalidJWTapp = App({ store, jwt: jwtDifferentUser })
        
        request(invalidJWTapp)
          .get('/my-device2')
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer 1234')
          .expect('Content-Type', /json/)
          .expect(401)
          .end((err) => {
            if (err) return done(err)
            done()
        })
    })
    it('get with no device', done => {
        
        request(app)
          .get('/my-device')
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer 1234')
          .expect('Content-Type', /json/)
          .expect(400)
          .expect({ error : 'Device does not exist'})
          .end((err) => {
            if (err) return done(err)
            done()
        })
    })
})