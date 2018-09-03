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
import { WowLogs, characters, listcharacters } from './commands'
import { addCharToMythicPlusTracker, clearMythicPlusFollows } from './commands/addcharnames.js'
import progress from './commands/progress'
import isArgusDead from './commands/isargusdead'
import listAllMains from './commands/getmains.js'
import listMythicFollows from './commands/listmythicfollows.js'
import startLevelupUpdater from './cronstuff/levelup/levelupupdater'
import startLevelupWatcher from './cronstuff/levelup/levelupwatcher'
import startApUpdater from './cronstuff/apsnitch/apsnitchupdater'
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
      'onnettomat': handleMissingMythicsCommand,
      'sää': handleCurrentWeatherCommand,
      'hinta': handlePriceCommand,
      'progress': progress.handleMessage,
      'onkoarguskuollut': isArgusDead,
      // 'bfahahmo': characters.handleMessage,
      'listaahahmot': listcharacters.handleMessage,
      // 'mainit': listAllMains,
      'munmytyt': listMythicFollows,
      'seuraahahmoja': addCharToMythicPlusTracker,
      'tyhjääseuratut': clearMythicPlusFollows
    }

    let commandPlaceholders = {
      // 'lumoukset': 'Etsitään lumouksettomia...',
      'parhaatscoret': 'Katsotaanpa ketä on paras ja ketä ei...',
      'score': 'Score vai bore? no kohta nähdään...',
      'kannusta': 'Hyvä kannustaja! Kannustus tulossa...',
      'hauku': 'Miksi haluat haukkua?', 
      'logs': 'Rupeatko metsuriksi? odota ole hyvä...',
      'viikonmytyt': 'Katsotaanpa onko joku jo kyllästynyt tähän aivottomaan grindiin...',
      'onnettomat': 'Vai ponnettomat? tsekataanpa...',
      'sää': 'Pilvistä mahdollisella lihapullia, heh...', 
      'hinta': 'What will you be doing when the hodlers take over the world?',
      'progress': 'jokohan tämä on tosi, x/y=1 given that x is current kills and y is maximum kills',
      'onkoarguskuollut': 'tarkistetaanpa...',
      // 'mainit': 'haetaanpas maineja pilvestä',
      'munmytyt': 'Tutkitaan asiaa...',
      'seuraahahmoja': 'Lisätään hahmoa pilveen',
      'tyhjääseuratut': 'Exterminating...'
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
  let msg = ''
  let block = '```'
  msg += 'Tervetuloa Ryöstöretken Discord palvelimelle! \n'
  msg += `Olen Ryöstöretken automaattinen robotti ja minulle voi kertoa asioita.\n`
  msg += `Vapaasanaisen hakemuksen voi laittaa minulle yksityisviestinä ja laitan se johtajien näkyville. Vastaamme yksityisviestinä mahdollisimman pian.\n`
  msg += `Otan myös palautetta vastaan samalla tavalla eli toisin sanoen ohjaan kaikki viestit johtajien nähtäviin mutta muista että voit lähettää vain muutaman viestin kerrallaan.\n`
  msg += 'Johtajiin kuuluu Qini, Tanih, Zintti, Rekkisvaan, Astrà, Málli, Traja, alla vielä lyhyt kuvaus joukostamme ja vaikka et pelaisikaan wowia niin täällä voi hengailla!'
  member.send(msg)
    .then(sendMessage => {
      let secondMessage = ''
      secondMessage += 'Olemme Mythic raideja harrastava täysin suomalainen kilta Darksorrow palvelimella, progressimme löytää osoitteesta https://www.wowprogress.com/guild/eu/darksorrow/Ry%C3%B6st%C3%B6retki\n'
      secondMessage += 'Killan johtoporras koostuu suureksi osaksi Grim Batolilta kotoisin olevasta porukasta ja osa heistä pelannut jo vanillasta asti.\n'
      secondMessage += `Minut on koodannut suureksi osaksi tämä tyyppi https://www.wowprogress.com/character/eu/darksorrow/Tanih\n tai ${idToMention(226502292625424396)}`
      secondMessage += 'Eikä hätää, en enää laita viestiä ilman syytä, tämä oli ainoa mainos!\n'
      member.send(secondMessage).catch(console.error)
    })
});

client.login(auth.discordBotToken)

