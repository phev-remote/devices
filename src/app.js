import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import DeviceRegistry from './device-registry';

const PORT = process.env.PORT || 8080
const HOST = process.env.HOST || '0.0.0.0'

const App = deps => {
    const http = express()
    http.use(bodyParser.json());
    http.use(cors())
    const deviceRegistry = new DeviceRegistry(deps)
    
    http.get('/status', (req, res) => {
        res.status(200).send({ status : 'ok'})
    })

    http.get('/:deviceId', async (req, res) => {

        const deviceId = req.params.deviceId
        
        if(!deviceId) {
            res.status(400).send({ error : 'No device specified' })
            return
        }

        if(req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') { 
            const token = req.headers.authorization.split(' ')[1]            

            const response = await deviceRegistry.get({ deviceId , jwt: token })   
            
            if(response.error) {
                res.status(response.error.authError ? 401 : 400).send({ error : response.error.description })
                return
            } else {
                res.status(200).send(response)
                return
            }
        } else {
            res.status(400).send({ error : 'No auth token'})
        }
    })
    /*
    http.post('/:deviceId', async (req, res) => {

        const deviceId = req.params.deviceId

        if(!deviceId) {
            res.status(400).send('No device specified')
        }

        if(req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') { 
            const token = req.headers.authorization.split(' ')[1]
            try {
                if(req.body.state.aircon) {
                    await aircon.turnOn({ deviceId, jwt: token })  
                
                    res.status(200).send({ response : 'ok'})
                } else {
                    await aircon.turnOff({ deviceId, jwt: token })
                
                    res.status(200).send({ response : 'ok'})
                } 
            } catch (err) {
                res.status(500).send({ error : err})
            }
        } else {
            res.status(401).send('Unauthorised')
        }
    })
    */
    
    console.log(`Running on http://${HOST}:${PORT}`)

    return http.listen(PORT, HOST)
}

export default App