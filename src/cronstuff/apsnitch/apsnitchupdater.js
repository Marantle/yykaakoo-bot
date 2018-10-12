import {
  getGuildDataUrl,
  getCharItemsUrl
} from '../../lib/urls'
import log from '../../lib/logger'
import * as cron from 'node-cron'
import * as axios from 'axios'
import charDataRef from '../../db/chardata.js'

const startApUpdater = async () => {
  cron.schedule('30 * * * *', async () => {
    try {
      const guildData = await axios.get(getGuildDataUrl())
      const {
        members
      } = guildData.data

      console.log(members.length)
      const maxLevelMembers = members.filter(memberData => memberData.character.level == 120)
      console.log(maxLevelMembers.length)
      const maxLevelRaidingMembers = maxLevelMembers.filter(memberData => memberData.rank <= 4)
      console.log(maxLevelRaidingMembers.length)


      charDataRef.once('value', async (charSnapshot) => {
        for (const memberData of maxLevelMembers) {
          const {
            name,
            realm
          } = memberData.character
          const fullName = `${name}-${realm}`
          const response = await axios.get(getCharItemsUrl(name, realm))
          if (response.status === 200) {
            const charItems = response.data.items
            const {
              averageItemLevel,
              averageItemLevelEquipped
            } = charItems
            const {
              azeriteLevel,
              azeriteExperience,
              azeriteExperienceRemaining
            } = charItems.neck.azeriteItem
            charDataRef.child(fullName).set({
              averageItemLevel,
              averageItemLevelEquipped,
              azeriteLevel,
              azeriteExperience,
              azeriteExperienceRemaining,
              azeritePercentage: (azeriteExperience / azeriteExperienceRemaining).toFixed(2)
            })

          }
          await timeout(100);}
      })

    } catch (error) {
      log.error(error.stack)
    }
  })
}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default startApUpdater
