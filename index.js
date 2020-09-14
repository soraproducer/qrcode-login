const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const jwt = require("jsonwebtoken")
const cors = require('cors')
const moment = require('moment')
const QRCodeNode = require('qrcode')
const app = express()
const port = 8888
const {UserModel, QRCodeModel} = require('./models')

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))

// Generate QR Code API
app.get('/qrcode/gene', async(req, res) =>{

    // Save QRCode into db
    const qrcode = new QRCodeModel({
        createdAt: Date.now(),
        expireAt: moment(Date.now()).add(120, 's').toDate()
    })
    await qrcode.save()

    // Use qrcodeData to create qrcodeUrl
    let qrcodeData = {
        qrcodeId: qrcode._id,
        createdAt: qrcode.createdAt,
        expireAt: qrcode.expireAt
    }
    const qrcodeUrl = await QRCodeNode.toDataURL(JSON.stringify(qrcodeData));

    // Return result
    res.send({
        code: 200,
        message: 'Successfully generate QR code',
        data: {
            qrcodeId: qrcode._id,
            qrcodeUrl
        }
    })
})

// Check QR Code status API
app.get('/qrcode/check', async(req, res) =>{
    const { qrcoddId } = req.query
    const qrcode = await QRCodeModel.findOne({_id: qrcodeId})

    if(!qrcode){
        res.send({
            code: 2241,
            message: "QR Code doesn't exist",
            data: null
        })
        return
    }

    res.send({
        code: 200,
        message: "Successfully find QR code",
        data: {
            qrcodeId,
            scanned: qrcode.scanned,
            expired: moment() >= moment(qrcode.expireAt),
            success: qrcode.status === 1,
            canceled: qrcode.status === -1,
            status: qrcode.status,
            userInfo: qrcode.userInfo,
            ticket: qrcode.ticket
        }
    })   
})

// Mark scanned QR Code API
app.get('/qrcode/scanned', async(req, res) =>{
    
})

// Comfirm QR Code
app.get('/qrcode/confirm', async(req, res) =>{
    
})

// Cancel QR Code
app.get('/qrcode/cancel', async(req, res) =>{
    
})

connect();

function listen(){
    app.listen(port);
    console.log('Express app started on port ' + port);
}

function connect(){
    mongoose.connection
        .on('error', console.log)
        .on('disconnected', connect)
        .on('open', listen);
    
    return mongoose.connect('mongodb://localhost:27017/scan-qrcode', { keepAlive: 1, useNewUrlParser: true });
}

function generateToken(data, secret){
    let iat = Math.floor(Date.now() / 1000);
    let exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 15; // expired after 15days
    let token = jwt.sign(
        {
            data,
            iat,
            exp
        },
        secret
    );
    return token;
}

function decryptToken(token, secret){
    try{
        token = token.replace('Bearer ', '')
        let res = jwt.verify(token, secret);
        return res;
    } catch(err){
        return false;
    }
}

app.post('/login', async(req, res) => {
    const { username, password } = req.body;
    const user = await UserModel.findOne({
        username,
        password
    })
    if(!user){
        res.send({
            code: 403,
            message: "Wrong user name or password"
        })
        return
    }

    const token = generateToken({userId: user._id, username, avatar: user.avatar}, "s3cret")
    res.send({
        code: 200,
        message: "Login success",
        data: {
            _id: user._id,
            username,
            token
        }
    })
})

app.post('/register', async(req, res) => {
    const { username, password } = req.body;
    if((await UserModel.findOne({
        username
    }))){
        res.send({
            code: 500,
            message: "User name has been registered"
        })
        return
    }

    const user = new UserModel({
        username,
        password,
        avatar: "https://usercontents.authing.cn/authing-avatar.png"
    })
    await user.save()
    res.send({
        code: 200,
        message: "Register success"
    })
})