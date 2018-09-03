import {
  getGuildDataUrl
} from '../../lib/urls'
import log from '../../lib/logger'
import * as cron from 'node-cron'
import * as axios from 'axios'
import levelUpRef from '../../db/levelup.js'

const startLevelupUpdater = async () => {
  cron.schedule('*/30 * * * *', async () => {
    try {
      const guildData = await axios.get(getGuildDataUrl())
      log.info('cronning now')

      const memberDatas = guildData.data.members

      const bfaLevels = memberDatas.filter(memberData => memberData.character.level >= 110).map(memberData => {
        return {
          name: memberData.character.name,
          level: memberData.character.level
        }
      })


      levelUpRef.once("value", (snapshot) => {
        for (let index = 0; index < bfaLevels.length; index++) {
          const charName = bfaLevels[index].name
          const charLevel = bfaLevels[index].level
          if (snapshot.hasChild(charName)) {
            if (snapshot.child(charName).val() < charLevel) {
              levelUpRef.child(charName).set(charLevel)
            }
          } else {
            levelUpRef.child(charName).set(charLevel)
          }
        }
      })
    } catch (error) {
      log.error(error)
    }
  });
}



export default startLevelupUpdater
