
const crypto = require('crypto');
const encryptKey = process.env.ENCRYPT_KEY

const fs = require('fs');
const jwt = require('jsonwebtoken')

class Utils {

    constructor(){

    }

    validateEmail(email){
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    encryptPassword(password){
        let pass = `${encryptKey}${password}`

        return crypto.createHash('sha256').update(pass).digest('hex');
    }

    signToken(data, expire = process.env.jwt_expire){
        var cert = fs.readFileSync(`${process.cwd()}/cert/private.key`);
        var access_token = jwt.sign(data, cert, { expiresIn: expire, algorithm: 'RS512' });
        return access_token
    }

}

module.exports = Utils