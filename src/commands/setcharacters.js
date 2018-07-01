import axios from 'axios'
import config from '../config/config.json'
import auth from '../config/auth.json'
import logger from '../lib/logger'
import classes from '../config/classes.json'
import fs from 'fs'
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
 
const adapter = new FileSync('db.json')
const usersDb = low(adapter)
usersDb.defaults({ users: [] })
    .write()

const getClassColor = (classId) => {
    const classColor = parseInt(classes.find((c) => {
        return c.id === classId
    }).color.replace("#", "0x"))
    console.log(classColor)
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
            return classes[classID-1].specs.find((spec) => {
                if (spec.name === characterSpec || spec.nicknames.includes(characterSpec) ) {
                    return spec.name;
                }
                return false
            })
        } catch (error) {
            console.log(error)
            return false
        }
    },
    validRole: (role) => {
        return role === 'main' || role === 'alt'
    },
    saveCharacter: async (author, character) => {
        const user = await usersDb.get('users')
            .find({id: author.id})
            .value()
        let savedUser
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
            console.log(foundCharacterIndex)
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
            savedUser = await usersDb.get('users')
                .find({id: user.id})
                .assign({
                    username: updatedUser.username,
                    characters: updatedUser.characters
                })
                .write()
            return updatedUser;
        } else {
            let newUser = Object.assign({
                id: author.id,
                username: author.username,
                characters: [character]
            });
            savedUser = await usersDb.get('users')
                .push({
                    id: author.id,
                    username: newUser.username,
                    characters: newUser.characters
                })
                .write()
            return newUser;
        }
    },
    handleMessage: async (params, sentMessage, message) => {
        try {
            if (params[0] === 'ohje') {
                return 'Käytä komentoa näin: §hahmo nimi spekki main/alt'
            }
            let character = {
                name: params[0] ? params[0].toLowerCase() : '',
                spec: params[1] ? params[1].toLowerCase() : '',
                role: params[2] ? params[2].toLowerCase() : ''
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
            return 'Tapahtui virhe. Käytä komentoa näin: §hahmo nimi spekki main/alt'
        }
    }
}

export default characters
