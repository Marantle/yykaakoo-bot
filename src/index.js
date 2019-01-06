//@ts-check
import { Client } from 'discord.js'
import logger from './lib/logger'
import auth from './config/auth.json'
import config from './config/config.json'
import serviceAccount from './config/serviceAccountKey.json'
import {
  handleTopScoresCommand,
  handleSingleScoreCommand,
  handleWeeklyRunCommand,
  handleMissingMythicsCommand
} from './commands/raideriocaller'
import { handleDm } from './dm/spamblock'
import { findAllMissingEnchants } from './commands/enchantsnitch'
import { handleCurrentWeatherCommand } from './commands/weather'
import { handlePriceCommand } from './commands/monopolymoney'
import { cheerUp, mock } from './commands/random'
import { WowLogs, characters, listcharacters, roll } from './commands'
import { addCharToMythicPlusTracker, clearMythicPlusFollows } from './commands/addcharnames.js'
import progress from './commands/progress'
import isArgusDead from './commands/isargusdead'
import listAllMains from './commands/getmains.js'
import listMythicFollows from './commands/listmythicfollows.js'
import startLevelupUpdater from './cronstuff/levelup/levelupupdater'
import startLevelupWatcher from './cronstuff/levelup/levelupwatcher'
import startApUpdater from './cronstuff/apsnitch/apsnitchupdater'
import { azeritePower, itemLevel } from './commands/mychardata'
import { topItemLevel, topAzerite } from './commands/toplists'
logger.info(`bot starting`)
const client = new Client()

client.on('ready', () => {
  logger.info('I am ready!')
})

startLevelupUpdater()
startLevelupWatcher(client)
startApUpdater()

let idToMention = (id) => {return `<@${id}>`}

client.on('message', async message => {
  if (message.channel.type === 'dm' && client.user.id !== message.author.id) {
    try { await handleDm(client, message) } catch (e) { console.error(e) }
    return
  }
  if (message.content.indexOf('😭') > -1) {
    try { await message.react('😭') } catch (e) { console.error(e) }
  } if (message.content.toLowerCase().indexOf('poliisi') > -1) {
    try { await message.channel.send('👮') } catch (e) { console.error(e) }
  }
  if (message.content.substring(0, 1) === '§') {
    let reply;
    let simpleCommands = {
      // 'lumoukset': findAllMissingEnchants,
      'parhaatscoret': handleTopScoresCommand,
      'score': handleSingleScoreCommand,
      'kannusta': cheerUp,
      'hauku': mock,
      'logs': WowLogs.handleMessage,
      'viikonmytyt': handleWeeklyRunCommand,
      'myty10': handleMissingMythicsCommand,
      'sää': handleCurrentWeatherCommand,
      'hinta': handlePriceCommand,
      'progress': progress.handleMessage,
      'onkoarguskuollut': isArgusDead,
      // 'bfahahmo': characters.handleMessage,
      'listaahahmot': listcharacters.handleMessage,
      // 'mainit': listAllMains,
      'munmytyt': listMythicFollows,
      'seuraahahmoja': addCharToMythicPlusTracker,
      'tyhjääseuratut': clearMythicPlusFollows,
      'munazerite': azeritePower,
      'topazerite': topAzerite,
      'munilvl': itemLevel,
      'topilvl': topItemLevel,
      'roll': roll
    }

    let commandPlaceholders = {
      // 'lumoukset': 'Etsitään lumouksettomia...',
      'parhaatscoret': 'Katsotaanpa ketä on paras ja ketä ei...',
      'score': 'Score vai bore? no kohta nähdään...',
      'kannusta': 'Hyvä kannustaja! Kannustus tulossa...',
      'hauku': 'Miksi haluat haukkua?', 
      'logs': 'Rupeatko metsuriksi? odota ole hyvä...',
      'viikonmytyt': 'Katsotaanpa onko joku jo kyllästynyt tähän aivottomaan grindiin...',
      'myty10': 'Katsotaanpa kyby mytyt!',
      'sää': 'Pilvistä mahdollisella lihapullia, heh...', 
      'hinta': 'What will you be doing when the hodlers take over the world?',
      'progress': 'jokohan tämä on tosi, x/y=1 given that x is current kills and y is maximum kills',
      'onkoarguskuollut': 'tarkistetaanpa...',
      // 'mainit': 'haetaanpas maineja pilvestä',
      'munmytyt': 'Tutkitaan asiaa...',
      'seuraahahmoja': 'Lisätään hahmoa pilveen',
      'tyhjääseuratut': 'Exterminating...',
      'roll': 'Rollataan...'
    }

    console.log()
    let args = message.content.substring(1).trim().split(' ')
    if (!args[0]) return
    logger.info(`received parms ${args}`)
    let command = args[0]
    let params = args.slice(1, args.length)
    logger.info(`command '${command}' from channel ${message.channel.name}, from user ${message.author.username}`)
    let sentMessage = await message.channel.send('Hetki, käsittelen...')
    if (simpleCommands[command]) {
      try {
        if (commandPlaceholders[command]) {
          sentMessage = await sentMessage.edit(commandPlaceholders[command])
        }
        reply = await simpleCommands[command](params, sentMessage, message)
      } catch (error) {
        logger.error(error.stack)
        reply = 'Nyt tapahtui ikävä kyllä niin että jokin virhe esti minua vastaamasta kyselyysi 😞'
      }
    } else {
      reply = 'Koitappa jotain näistä: ' + Object.keys(simpleCommands).reduce((s1, s2) => s1 + ', ' + s2)
      logger.info(`no such command '${command}'`)
    }

    if (reply && reply.length > 0 && !reply.embed) {
      logger.info(`sending reply ${reply}`)
      sentMessage.edit(reply)
        .then(msg => console.log(`end of yykaakoo sent a reply of <${msg.content}>`))
        .catch(console.error)
    } else if (reply && reply.embed) {
      logger.info(`sending embed ${reply}`)
      sentMessage.delete()
      message.channel.send(reply)
    }
  }
});

client.on('guildMemberAdd', member => {
  let msg = `
  Eli nyt ollaan edetty siihen pisteeseen, että Ryöstöretken tarina Darksorrowilla ja alliancella päättyy. 
  Syynä tähän raidaavien pelaajien väheneminen sekä muutenkin vähäinen innostus BFA:a kohtaan. 
  Ryöstöretki jatkaa toimintaa Twisting Netherin hordepuolella saman nimen alla hieman community-tyyppisenä, raidaaminen ei ole ensisijaisesti tavoitteena, mutta mahdollisuutena. Tulevaisuus näyttää. 
  Kaikki nykyiset jäsenet ovat tervetulleita mukaan halutessaan!
  `
member.send(msg)
  .then(message => `sent message to ${member.username}`)
  .catch(console.error)

client.login(auth.discordBotToken)
