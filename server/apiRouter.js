const router = require('express').Router()
const accService = require('./accountService.js')
const utils = require('./utilitiesTool.js')
const fs = require("fs");
const path = require("path");
const multer = require("multer");


const DEBUG = true

const upload = multer()

const loginVerify = function (req, res, next)
{
    try
    {
        const user = accService.findUserBySession(req.cookies['session'])
        if (user)
        {
            utils.debugLog(DEBUG,`${user.id}-${user.account}-${user.user_name}`)
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
        utils.debugLog(DEBUG,e.toString(),2)
        res.send(`<script>alert('系統錯誤，將導向首頁!!');location.href = '/';</script>`)
    }

}

router.post('/login', async (req, res) =>
{
    let rtData = {
        success: false
    }
    try
    {
        //console.log(req.body)
        if (req.body.uid)
        {
            const uAcc = accService.findUserByUserAccount(req.body.uid)
            utils.debugLog(DEBUG,`Login USER | id:${uAcc.id} account:${uAcc.account} UserName:${uAcc.user_name} |`)
            if (uAcc)
            {
                if (uAcc.password !== "") // need to login
                {
                    if (uAcc.password === utils.generateKeygen(req.body.pid, uAcc.user_secret).hashData)
                    {
                        utils.debugLog(DEBUG,'登入成功!!')
                        const session = accService.newSession(uAcc.id, req.cookies['session'])
                        rtData.success = true
                    } else
                    {
                        utils.debugLog(DEBUG,'密碼錯誤!!')
                        rtData.info = "帳號或密碼錯誤!!"
                    }
                } else
                {
                    utils.debugLog(DEBUG,'不需要密碼!!')
                    const session = accService.newSession(uAcc.id, req.cookies['session'])
                    rtData.success = true
                }
            } else
            {
                utils.debugLog(DEBUG,'帳號不存在!!')
                rtData.info = "帳號或密碼錯誤!!"
            }
        } else
        {
            utils.debugLog(DEBUG,'未存在uid')
            rtData.info = "請輸入帳號和密碼!!"
        }
    } catch (e)
    {
        utils.debugLog(DEBUG,'Try Catch Error',1)
        console.log(e.toString())
    }

    res.json(rtData)
})

router.post('/upload-single', loginVerify, upload.single('myUploadData'), async (req, res) =>
{
    try
    {
        const allow = true
        const fileName = req.file.originalname
        const convFileName = Buffer.from(fileName, 'latin1').toString('utf8');
        console.log(`Status: ${allow} || Uploader ${req.locals.user.user_name} || Request At ${req.ip} file Called ${convFileName}`)
        if (allow && req.file.buffer)
        {
            if (!fs.existsSync(path.join(__dirname, 'upload', `${req.locals.user.std_id}-${req.locals.user.user_name}`)))
            {
                console.warn(`No folder for ${req.locals.user.std_id}-${req.locals.user.user_name} !! Create Folder`)
                fs.mkdirSync(path.join(__dirname, 'upload', `${req.locals.user.std_id}-${req.locals.user.user_name}`))
            }

            fs.writeFile(path.join(__dirname, 'upload', `${req.locals.user.std_id}-${req.locals.user.user_name}`, convFileName), req.file.buffer, (err) =>
            {
                if (err)
                {
                    utils.debugLog(DEBUG,err,2)
                    res.json({success: false})
                } else
                {
                    res.json({success: true})
                }
            })
        } else
        {
            res.json({success: false})
        }
    } catch (e)
    {
        utils.debugLog(DEBUG,e.toString(),2)
        res.json({success: false})
    }

})


router.post('/upload-multiple', loginVerify, upload.array('myUploadData'), async (req, res) =>
{
    const allow = true
    let response = {success: false}
    try
    {
        let forLoopSuccess = true
        for(let i = 0 ; i < req.files.length;i++){
            const fileName = req.files[i].originalname
            const convFileName = Buffer.from(fileName, 'latin1').toString('utf8');
            utils.debugLog(DEBUG,`Status: ${allow} || Uploader ${req.locals.user.user_name} || Request At ${req.ip} file Called ${convFileName}`)
            if (allow && req.files[i].buffer)
            {
                if (!fs.existsSync(path.join(__dirname, 'upload', `${req.locals.user.std_id}-${req.locals.user.user_name}`)))
                {
                    utils.debugLog(DEBUG,`No folder for ${req.locals.user.std_id}-${req.locals.user.user_name} !! Create Folder` )
                    fs.mkdirSync(path.join(__dirname, 'upload', `${req.locals.user.std_id}-${req.locals.user.user_name}`))
                }

                fs.writeFile(path.join(__dirname, 'upload', `${req.locals.user.std_id}-${req.locals.user.user_name}`, convFileName), req.files[i].buffer, (err) =>
                {
                    if (err)
                    {
                        utils.debugLog(DEBUG,err,2)
                        forLoopSuccess = false
                    } else
                    {
                        utils.debugLog(DEBUG,`Uploader ${req.locals.user.user_name} || Request At ${req.ip} file Called ${convFileName} writeFile success!`)
                    }
                })
            }
            else{
                forLoopSuccess = false
            }
        }
        if(forLoopSuccess){
            response.success = true
        }
    } catch (e)
    {
        console.log(e.toString())
    }
    res.json(response)
})


module.exports = router