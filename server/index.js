const express = require('express')
const fs = require('fs')
const path = require('path')
const multer = require('multer')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const http = require('http')
const socket = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socket(server)

const port = 80

const apiRouter = require('./apiRouter')
const util = require('./utilitiesTool')
const accService = require('./accountService')

app.use(express.urlencoded({extended:false}))
app.use(express.json())
app.use(cookieParser())

app.use("/public",express.static('public'))

app.use("/api",apiRouter)

const DEBUG = true

const loginVerify = function (req, res, next)
{
    try
    {
        const user = accService.findUserBySession(req.cookies['session'])
        if (user)
        {
            util.debugLog(DEBUG,`OPERATOR [id:${user.id} account:${user.account} user:${user.user_name}]`)
            req.locals = {
                user: user
            }
            next()
        } else
        {
            res.send(`<script>alert('未登入系統，將導向登入畫面進行登入!!');location.href = '/login';</script>`)
        }
    } catch (e)
    {
        console.log(e.toString())
        res.send(`<script>alert('系統錯誤，將導向首頁!!');location.href = '/';</script>`)
    }

}


const loginJump = function (req,res,next){
    const userId = accService.findUserBySession(req.cookies['session'])
    if(userId){
        util.debugLog(DEBUG,`user ${userId.id} has login !!`)
        res.redirect('/')
    }
    else
    {
        next()
    }
}

const reject = function (req,res,next){
    res.send(`<script>alert('系統拒絕該回應，請確認後重新連接!!');location.href = '/';</script>`)
}

app.get("/socket-client",async (req,res)=>{
    res.sendFile(path.join(__dirname,'../','node_modules','socket.io','client-dist','socket.io.js'))
})



// 靜態葉面操作

app.get('/index',async(req,res)=>{
    res.redirect('/')
})

app.get('/',async(req,res)=>{
    const userId = accService.findUserBySession(req.cookies['session'])
    if(userId){
        res.sendFile(path.join(__dirname,'../','view','default.html'))
    }
    else{
        res.redirect('/login')
    }
})

app.get('/login',loginJump,async(req,res)=>{
    const session = (req.cookies['session'])?req.cookies['session'] : util.randomUUID(32)
    res.cookie('session',session).sendFile(path.join(__dirname,'../','view','login.html'))
})

app.get('/logout',loginVerify,async(req,res)=>{
    util.debugLog(DEBUG,`USER ${req.locals.user.id}:${req.locals.user.account}:${req.locals.user.user_name} logout`)
    res.clearCookie('session').redirect('/login')
})

app.get('/upload',loginVerify,async (req,res)=>{
    res.sendFile(path.join(__dirname,'../','view','upload.html'))
})

app.get('/upload-single',reject,async (req,res)=>{
    res.sendFile(path.join(__dirname,'../','view','upload-single.html'))
})

app.get('/test',async (req,res)=>{
    res.sendFile(path.join(__dirname,'../','view','test.html'))
})


// default route
app.get('*',reject)

server.listen(port,(err)=>{
    if(err)
        console.log(err)
    else
        console.log(`Server Start At ${port}`)
})

io.on('connection',socket2=>{
    socket2.on('test',msg=>{
        console.log(msg)
    })

    setInterval(()=>{
        socket2.emit('timer',Math.floor(Date.now()/1000))
    },1000)
    console.log('server connected');
})
