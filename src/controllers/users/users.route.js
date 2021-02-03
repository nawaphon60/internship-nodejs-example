const express = require('express')
const app = express.Router()
const Users = require('./users')
const AuthenMiddleware = require('./../../middleware/authen')
const multer = require('multer')
var upload = multer({
    fileFilter: (req, file, cb) => {
        var filetypes = /jpg|peg|png|gif/.test(file.mimetype)
       
        if (filetypes) {
            return cb(null, true)
        }
    }
})

app.get('', (req, res)=>{
    res.send('API users running.')
})

app.post('/search', new Users().search)

app.get('/profile',[
    new AuthenMiddleware().verifyJWT
], new Users().getByID)

app.post('/create', [
    new AuthenMiddleware().accessAll
],new Users().createUser)

app.put('/update/:user_id', [
    new AuthenMiddleware().verifyJWT
], new Users().updateUser)

app.delete('/delete/:user_id',[
    new AuthenMiddleware().accessAll
], new Users().deleteUser)

app.post('/upload',[
    upload.single('file')
], new Users().UploadImage)

module.exports = app