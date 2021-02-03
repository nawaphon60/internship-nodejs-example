
const fs = require('fs');
const jwt = require('jsonwebtoken')

class AuthenMiddleware{

    verifyJWT(req, res, next){
        try {
            req.headers['authorization'] = req.headers['authorization'] || ""
            let token = req.headers['authorization'].replace(/Bearer /, "")
            // console.log('token =', token)
            var cert = fs.readFileSync(`${process.cwd()}/cert/public.key`);
            let decoded = jwt.verify(token, cert);
            // console.log(decoded);
            // add request data
            req.authen = decoded

            next()
        }catch(err){
            console.log(err.stack)
            res.status(400).json({
                message: err.message
            })
        }
    }

    accessAll(req, res, next){
        try {
            req.headers['authorization'] = req.headers['authorization'] || ""
            let token = req.headers['authorization'].replace(/Bearer /, "")
            console.log('token =', token)
            var cert = fs.readFileSync(`${process.cwd()}/cert/public.key`);
            let decoded = jwt.verify(token, cert);

            // add request data
            req.authen = decoded

            next()
        }catch(err){
            req.authen = null

            next()
        }
    }

}

module.exports = AuthenMiddleware