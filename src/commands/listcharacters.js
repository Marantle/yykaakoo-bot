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
const getCharacterClass = (id) => {
    const foundClass = classes.find((c) => {
        return c.id === id
    })
    return foundClass.name;
}

const createCharactersString = (characters, role) => {
    return characters.filter((character) => character.role === role).map((character) => {
        return `[${character.name.charAt(0).toUpperCase() + character.name.slice(1)}](https://worldofwarcraft.com/en-gb/character/darksorrow/${character.name}) - ${getCharacterClass(character.class)} - ${character.spec.name.charAt(0).toUpperCase() + character.spec.name.slice(1)}`
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
        
        let response = {
            embed: {
                color: 3447003,
                title: role === 'main' ? `BFA mainit` : 'BFA altit',
                description: '',
                fields: [
                    {
                        name: `Tankit ${tanks.filter(character => character.role === role).length}`,
                        value: createCharactersString(tanks, role)
                    },
                    {
                        name: `Parantajat ${healers.filter(character => character.role === role).length}`,
                        value: createCharactersString(healers, role)
                    },
                    {
                        name: `Melee dps: ${mdps.filter(character => character.role === role).length}`,
                        value: createCharactersString(mdps, role)
                    },
                    {
                        name: `Ranged dps: ${rdps.filter(character => character.role === role).length}`,
                        value: createCharactersString(rdps, role)
                    }
                ]
            }
        }
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
