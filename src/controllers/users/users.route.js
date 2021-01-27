const express = require('express')
const app = express.Router()
const Users = require('./users')
const AuthenMiddleware = require('./../../middleware/authen')

app.get('', (req, res)=>{
    res.send('API users running.')
})

app.post('/search', new Users().search)

app.get('/profile/:user_id', new Users().getByID)

app.post('/create', [
    new AuthenMiddleware().accessAll
],new Users().createUser)

app.put('/update/:user_id', [
    new AuthenMiddleware().verifyJWT
], new Users().updateUser)

app.delete('/delete/:user_id',[
    new AuthenMiddleware().accessAll
], new Users().deleteUser)

module.exports = app