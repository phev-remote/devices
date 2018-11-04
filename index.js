const firebaseConfig = process.env.FIREBASE_CONFIG || '../firebase.json'

const jwt = require('./lib/jwt')
const CacheBase = require('cache-base')
const firebaseAdmin = require('firebase-admin')
const serviceAccount = require(firebaseConfig)

const deviceRegistryStore = new CacheBase()

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
})

deviceRegistryStore.set('my-device2', { deviceId: 'my-device2', uid : '3tZrIIUySpftIwnTOt8iDn76g9j1'})

require('./lib/app').default({ jwt , store : deviceRegistryStore })