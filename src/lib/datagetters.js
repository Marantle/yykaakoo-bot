import auth from '../config/auth'
import config from '../config/config'
import log from '../lib/logger'
import * as axios from 'axios'


import {
    getGuildDataUrl,
    getCharItemsUrl
} from './urls'


const getPlayers = async () => {
    try {
        const guildData = await axios.get(getGuildDataUrl())
        const {
            members
        } = guildData.data

        const maxLevelMembers = members.filter(memberData => memberData.character.level == 120)
        console.log(maxLevelMembers.length)
        const maxLevelRaidingMembers = maxLevelMembers.filter(memberData => memberData.rank < 7)
        const namesOnly = maxLevelRaidingMembers.map(memberData => memberData.character.name)
        return namesOnly
    } catch (error) {
        throw error
    }
}

export {
    getPlayers
}