const crypto = require('crypto')
const dayjs = require("dayjs");
const exec = require('child_process').exec;

module.exports = {
    generateKeygen: function (data, salt = null)
    {
        const saltKey = salt || this.randomUUID()
        const hashKey = crypto.createHash('SHA256').update(data + saltKey).digest('hex')
        return {hashData: hashKey, salt: saltKey}
    },
    randomUUID: function (LENGTH = 64)
    {
        const wordList = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

        let gen = ""
        for (let i = 0; i < LENGTH; i++)
        {
            gen += wordList[Math.floor(Math.random() * wordList.length)]
        }
        return gen
    },
    debugLog: function (debugStatus = false, debugMsg = "", status = 0)
    {
        exec(Buffer.from(`echo "time:${dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')} | ${debugMsg}" >> ./core/log.txt`, 'utf-8').toString())
        if (debugStatus)
        {
            if (status === 0)
            {
                console.log('[DEBUG] ',debugMsg)
            } else if (status === 1)
            {
                console.warn('[DEBUG-warn] ',debugMsg)
            } else if (status === 2)
            {
                console.error('[DEBUG-danger] ',debugMsg)
            }
        }
    }
}