import axios from 'axios'
import config from '../config/config.json'
import auth from '../config/auth.json'
import logger from '../lib/logger'
import classes from '../config/classes.json'
import fs from 'fs'
import usersRef from '../db/mains2.js'
/*const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
 
const adapter = new FileSync('db.json')
const usersDb = low(adapter)
usersDb.defaults({ users: [] })
    .write()
*/

const capitalize = (word, index) => {
    return word.replace(/^\w/, c => c.toUpperCase());
}
const getCharacterClass = (id) => {
    const foundClass = classes.find((c) => {
        return c.id === id
    })
    return foundClass.name;
}
const sortBySpec = (a, b) => {
    if(a.spec.name < b.spec.name) return -1;
    if(a.spec.name > b.spec.name) return 1;
    return 0;
}

const createCharactersString = (characters, role) => {
    return characters.filter((character) => character.role === role).sort(sortBySpec).map((character) => {
        return `${capitalize(character.name.padEnd(13))} ${capitalize(character.spec.name)}`
    }).join('\n') || '-'
}

const listcharacters = {
    getCharacters: async (role = 'main') => {
        // const users = await usersDb.get('users').map('characters').value()
        let users = await usersRef.once('value');
        
        users = Object.values(users.val())
        console.log(JSON.stringify(users));
        const characters = [].concat( ...(users.map((user) => user.characters)))
        const mdps = characters.filter((character) => {
            return character.spec.role === 1
        })
        const rdps = characters.filter((character) => {
            return character.spec.role === 2
        })
        const tanks = characters.filter((character) => {
            return character.spec.role === 3
        })
        const healers = characters.filter((character) => {
            return character.spec.role === 4
        })
        
        const myFilter = ((role) => character => character.role === role)(role)

        let response = `Tankit ${tanks.filter(myFilter).length}\n`
        response += createCharactersString(tanks, role) + '\n\n'
        response += `Parantajat ${healers.filter(myFilter).length}\n`
        response += createCharactersString(healers, role)+ '\n\n'
        response += `Melee ${mdps.filter(myFilter).length}\n`
        response += createCharactersString(mdps, role)+ '\n\n'
        response += `Ranged ${rdps.filter(myFilter).length}\n`
        response += createCharactersString(rdps, role)
        response = "```" + response + "```"
        return response
    },
    handleMessage: async (params, sentMessage, message) => {
        try {
            switch (params[0]) {
                default: {
                    return listcharacters.getCharacters(params[0]);
                }
            }
        } catch (err) {
            console.log('error in handleMessage:', err)
            return 'Tapahtui virhe'
        }
    }
}

export default listcharacters
