import followsRef from '../db/mythicplusfollows.js'
import logger from '../lib/logger'
import config from '../config/config.json'
import {
    weeklyTopByCharname
} from './raideriocaller.js'
const parseData = (discordUserName, datas) => {

    const fields = []

    for (const data of datas) {
        fields.push({
            name: data.name,
            value: data.runs[0] ? `${data.runs[0].short_name} +${data.runs[0].mythic_level}` : 'Ei mytyjä'
        })
    }

    const response = {
        embed: {
            color: 3447003,
            title: `Käyttäjän ${discordUserName} viikon isoimmat mytyt`,
            fields
        }
    }
    return response
}
const listMythicFollows = (discordUserId, discordUserName) => {
    console.log('start follows')
    logger.info(`msender was ${discordUserId}`)
    return new Promise((resolve, reject) => {
        followsRef.child(discordUserId).once('value', async (snap) => {
            if (snap.val()) {
                const charNames = snap.val()
                logger.info('got follows' + JSON.stringify(snap.val(), null, 2))
                let finalDatas = []
                for (const key in charNames) {
                    const charName = charNames[key]
                    try {
                        const runs = await weeklyTopByCharname(charName, 0)
                        finalDatas.push(runs)
                    } catch (error) {
                        finalDatas.push({
                            "name": charName,
                            "value": "Virhe hakiessa mytyjä"
                        })
                    }
                }
                resolve(parseData(discordUserName, finalDatas))
            } else {
                resolve('Ei hahmoja tallessa')
            }
        }, (errorObject) => {
            console.log('error follows')
            reject("The read failed: " + errorObject.code);
        });
    })
}



export default async (params, messageToEdit, message) => {
    let follows
    const discordUserId = message.author.id
    const discordUserName = message.author.username
    try {
        follows = await listMythicFollows(discordUserId, discordUserName)
    } catch (error) {
        follows = error
    }
    return follows
}