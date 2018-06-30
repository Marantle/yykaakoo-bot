import followsRef from '../db/mythicplusfollows.js'

export const addCharToMythicPlusTracker = async (params, sentMessage, message) => {
  const discordId = message.author.id
  const discordUserName = message.author.username

  followsRef.child(message.author.id).once('value', function (snapshot) {
    if (!snapshot.exists()) {
      let freshData = {}
      for (const charName of params) {
        if (charName.length < 13) {
          if (!freshData[discordId])
            freshData[discordId] = {}
          freshData[discordId][charName] = charName
        }
      }

      followsRef.set(freshData, (error) => {
        if (error) {
          console.log("Data could not be saved." + error);
        } else {
          console.log("Data saved successfully.");
        }
      })
    } else {
      for (const charName of params) {
        if (charName.length < 13) {
          const authorRef =  followsRef.child(message.author.id)
          authorRef.child(charName).set(charName)
        }

      }
    }
  })

  const savedChars = params.filter(param => param.length < 13)
  return `Hahmot ${savedChars} lisätty seurantaan käyttäjälle ${message.author.username}`
}

export const clearMythicPlusFollows = async (params, sentMessage, message) => {

  followsRef.child(message.author.id).remove()

  return `Sinne meni.`
}
