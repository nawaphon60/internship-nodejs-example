const express = require('express')
const app = express.Router()

const AuthenController = require('./authen')

app.get('', (req, res)=>{
    res.send('API authen running.')
})

app.post('/login', new AuthenController().login)

module.exports = app