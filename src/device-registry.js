class DeviceRegistry {
    constructor(deps) {
        //super()
        this.store = deps.store
        this.jwt = deps.jwt
    }
    async get(args) {
        

        const { deviceId, jwt } = args

        const deviceExists = await this.store.has(deviceId)

        if(!deviceExists) {
            return { error : { description : 'Device does not exist'} }
        }
        
        const decodedJWT = await this.jwt.verify(jwt)
        
        if(decodedJWT.error) {
            return { error : { description : 'User not authorised invalid token', authError : true} }
        }
        
        const device = await this.store.get(deviceId)
                
        if(device.uid === decodedJWT.sub) {
            return device
        } else {
            return { error : { description : 'User not authorised to get device', authError : true} }
        } 
    }
    async create(args) {
        const { deviceId, jwt } = args
        
        const decodedJWT = await this.jwt.verify(jwt)
        
        if(decodedJWT.error) {
            return { error : { description : 'User not authorised invalid token', authError : true} }
        }

        const device = await this.store.get(deviceId)
        
        if(device) {
            return { error : {description : 'Device already exists', alreadyExists : true} }
        }
        this.store.set(deviceId, { deviceId, uid : decodedJWT.sub })

        return { response : 'ok' }
    }
}

export default DeviceRegistry