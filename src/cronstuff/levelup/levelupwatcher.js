import log from '../../lib/logger'
import levelUpRef from '../../db/levelup.js'
import config from '../../config/config'
const startLevelupWatcher = (client) => {


    levelUpRef.on('child_changed',  (newSnapshot) => {
        let message = `Ding! ${newSnapshot.key} saavutti tason ${newSnapshot.val()}`
        levelUpRef.once('value',  (allLevelData) =>  {
            let sharedLevelCount = 0
            let overLevelCount = 0
            allLevelData.forEach(levelData => {
                if (levelData.val() === newSnapshot.val()) {
                    sharedLevelCount++
                }
                if (levelData.val() >= newSnapshot.val()) {
                    overLevelCount++
                }
            })
            message += `, hän oli ${overLevelCount}. tason ${newSnapshot.val()} sankari!`
            if (overLevelCount === 1 && newSnapshot.val() == 120) {
                message += ' https://giphy.com/gifs/queue-misha-collins-you-are-the-best-11llTu9bwVT2AE'
            }
            log.info(`sent levelup message: ${message}`)
            client.channels.find('id', config.levelupChannel).send(message).catch(log.error)
        });
        
    });

    // to skip initial data
    var newItems = false;
    
    levelUpRef.on('child_added',  (charLevel) =>  {
        if (!newItems) return
        
        const message = `Uusi hahmo on liittynyt joukkoon! ${charLevel.key} on tason ${charLevel.val()} sankari`

        if (charLevel.val() > 109) {
            log.info(`sent new character message: ${message}`)
            client.channels.find('id', config.levelupChannel).send(message).catch(log.error)
        }
    });

    levelUpRef.once('value',  (snapshot) =>  {
        newItems = true;
    });
}

export default startLevelupWatcher
