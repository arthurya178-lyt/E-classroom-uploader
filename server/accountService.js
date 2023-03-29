const fs = require('fs')
const path = require('path')
const utils = require("./utilitiesTool")

const FILE_PATH = path.join(__dirname ,'../', 'core', 'account.json')

module.exports = {
    findUserByUserId: function (userId)
    {
        const fileRead = fs.readFileSync(FILE_PATH)
        const userInfo = JSON.parse(fileRead.toString())
        for (let i = 0; i < userInfo.length; i++)
        {
            if (userInfo[i].id === userId)
            {
                return userInfo[i]
            }
        }
        return null
    },
    findUserByUserAccount: function (userAccount)
    {
        const fileRead = fs.readFileSync(FILE_PATH)
        const userInfo = JSON.parse(fileRead.toString())
        for (let i = 0; i < userInfo.length; i++)
        {
            if (userInfo[i].account === userAccount)
            {
                return userInfo[i]
            }
        }
        return null
    },
    createUser:function (userAccount,userName, userPerm, userStdId, userPassword = '')
    {
        const fileRead = fs.readFileSync(FILE_PATH)
        const userInfo = JSON.parse(fileRead.toString())
        const createId = userInfo.length ? userInfo[userInfo.length - 1].id + 1 : 1
        const passwordSet = utils.generateKeygen(userPassword)
        userInfo.push({
            id: createId,
            account:userAccount,
            user_name: userName,
            user_perm: userPerm,
            std_id: userStdId,
            password: passwordSet.hashData,
            user_secret: passwordSet.salt,
            session: utils.randomUUID(),
        })
        fs.writeFileSync(FILE_PATH, JSON.stringify(userInfo, null, '\t'))
        return createId
    },
    setUserPassword:function (id,password){
        const fileRead = fs.readFileSync(FILE_PATH)
        const userInfo = JSON.parse(fileRead.toString())
        for (let i = 0; i < userInfo.length; i++)
        {
            if (userInfo[i].id === id)
            {
                const passwordSet = utils.generateKeygen(password)
                userInfo[i].password = passwordSet.hashData
                userInfo[i].user_secret = passwordSet.salt
                fs.writeFileSync(FILE_PATH, JSON.stringify(userInfo, null, '\t'))
                return userInfo[i]
            }
        }
        return null
    },
    newSession: function (id,session = null)
    {

        const fileRead = fs.readFileSync(FILE_PATH)
        const userInfo = JSON.parse(fileRead.toString())
        const setSession = session || utils.randomUUID(32)
        for (let i = 0; i < userInfo.length; i++)
        {
            if (userInfo[i].id === id)
            {
                userInfo[i].session = setSession
            }
        }
        fs.writeFileSync(FILE_PATH, JSON.stringify(userInfo, null, '\t'))
        return setSession
    },
    findUserBySession:function (session){
        const fileRead = fs.readFileSync(FILE_PATH)
        const userInfo = JSON.parse(fileRead.toString())
        for (let i = 0; i < userInfo.length; i++)
        {
            if (userInfo[i].session === session)
            {
                return userInfo[i]
            }
        }
        return null
    }
}