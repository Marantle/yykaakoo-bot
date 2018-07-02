import axios from 'axios'
import config from '../config/config.json'
import auth from '../config/auth.json'
import logger from '../lib/logger'
import classes from '../config/classes.json'
import fs from 'fs'
import usersRef from '../db/mains2.js'

const getClassColor = (classId) => {
    const classColor = parseInt(classes.find((c) => {
        return c.id === classId
    }).color.replace("#", "0x"))
    return classColor
}

const characters = {
    getCharacter: async (characterName) => {
        try {
            const response = await axios.get(encodeURI(`https://eu.api.battle.net/wow/character/darksorrow/${characterName}?fields=guild&locale=en_GB&apikey=${auth.masheryKey}`))
            const character = response.data
            if (character.guild && character.guild.name === config.mashery.guildname) {
                return character
            }
            return false
        } catch (error) {
            return false
        }
    },
    validSpec: (characterSpec, classID) => {
        try {
            let spec = classes[classID-1].specs.find((spec) => {
                if (spec.name === characterSpec || spec.nicknames.includes(characterSpec) ) {
                    return spec.name;
                }
                return false
            })
            if (spec) {
                spec = Object.assign({
                    name: spec.name,
                    role: spec.role
                })
            }
            return spec
        } catch (error) {
            console.log(error)
            return false
        }
    },
    validRole: (role) => {
        return role === 'main' || role === 'alt'
    },
    deleteCharacter: async (author, characterName) => {
        try {
            let user = await usersRef.child(author.id).once('value')
            user = user.val()
            if (user) {
                let foundCharacterIndex = user.characters.findIndex((char) => {
                    return char.name.toLowerCase() === characterName.toLowerCase()
                })
                if (foundCharacterIndex >= 0) {
                    user.characters.splice(foundCharacterIndex, 1)
                } else {
                    return `Sinuun ei ole liitetty hahmoa: ${characterName}`
                }
                let updatedUser = Object.assign({
                    ...user,
                    username: author.username
                });
                await usersRef.child(author.id).set(updatedUser, (error) => {
                    if (error) {
                        console.log("Data could not be saved." + error)
                        throw err
                    } else {
                        console.log("Data saved successfully.")
                    }
                })
                return `${characterName} poistettu hahmoistasi`
            } else {
                return 'Käyttäjää ei löytynyt'
            }
        } catch (err) {
            console.log(err)
            return 'Hahmon poistossa tapahtui virhe'
        }
    },
    saveCharacter: async (author, character) => {
        try {
            let savedUser
            let user = await usersRef.child(author.id).once('value')
            user = user.val()
            if (user) {
                if (character.role === "main") {
                    let oldMain = user.characters.find((char) => {
                        return char.role === "main"
                    })
                    if (oldMain) oldMain.role = "alt"
                }
                let foundCharacterIndex = user.characters.findIndex((char) => {
                    return char.name === character.name
                })
                if (foundCharacterIndex >= 0) {
                    user.characters.splice(foundCharacterIndex, 1, character)
                } else {
                    user.characters.push(character)
                }
                let updatedUser = Object.assign({
                    ...user,
                    username: author.username,
                    characters: user.characters
                });
                await usersRef.child(author.id).set(updatedUser, (error) => {
                    if (error) {
                        console.log("Data could not be saved." + error)
                        throw err
                    } else {
                        console.log("Data saved successfully.")
                    }
                })
                return updatedUser
            } else {
                let newUser = Object.assign({
                    id: author.id,
                    username: author.username,
                    characters: [character]
                });
                await usersRef.child(author.id).set(newUser, (error) => {
                    if (error) {
                        console.log("Data could not be saved." + error)
                        throw err
                    } else {
                        console.log("Data saved successfully.")
                    }
                })
                return newUser
            }
        } catch(err) {
            console.log(err)
            throw err
        }
    },
    handleMessage: async (params, sentMessage, message) => {
        try {
            let users = await usersRef.once('value');
            console.log(users);
            users = users.val()
            if (params[0] === 'ohje') {
                return 'Käytä komentoa näin: §hahmo nimi spekki main/alt'
            }
            if (params[0] === 'poista') {
                return characters.deleteCharacter(message.author, params[1])
            }
            let character = {
                name: params[0] ? params[0].toLowerCase() : '',
                spec: params[1] ? params[1].toLowerCase() : '',
                role: params[2] ? params[2].toLowerCase() : 'main'
            }
            const validCharacter = await characters.getCharacter(character.name)
            if (!validCharacter) {
                return 'Hahmo ei ole killassa tai sitä ei löytynyt'
            }
            character.class = validCharacter.class
            character.spec = characters.validSpec(character.spec, validCharacter.class)
            if (!character.spec) {
                return 'Nyt ei oo validi specci. Käytä komentoa näin: §hahmo nimi spekki main/alt'
            }
            if (!characters.validRole(character.role)) {
                return 'Ny ei oo validi rooli, valitse "main" tai "alt". Käytä komentoa näin: §hahmo nimi spekki main/alt'
            }
            const author = message.author
            const savedCharacter = await characters.saveCharacter(author, character)
            return {
                embed: {
                    color: getClassColor(character.class),
                    description: `Hahmo tallennettu: [${character.name.charAt(0).toUpperCase() + character.name.slice(1)}](https://worldofwarcraft.com/en-gb/character/darksorrow/${character.name}) - ${character.spec.name.charAt(0).toUpperCase() + character.spec.name.slice(1)} ${classes[character.class - 1].name} - ${character.role}`
                }
            }
        } catch (err) {
            console.log(err)
            return 'Tapahtui virhe. Käytä komentoa näin: §hahmo nimi spekki main/alt'
        }
    }
}

export default characters
