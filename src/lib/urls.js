import auth from '../config/auth'
import config from '../config/config'
import log from '../lib/logger'
const { URL } = require('url');

export function getGuildDataUrl() {
    const address = new URL(config.mashery.baseurl)
    address.pathname = `/${config.mashery.memberspath}/${config.mashery.realm}/${config.mashery.guildname}`
    address.searchParams.append('locale', config.mashery.locale)
    address.searchParams.append('fields', config.mashery.memberfields)
    address.searchParams.append('apikey', auth.masheryKey)
    return address.href
}

export function getCharItemsUrl(charName, realm) {
    const address = new URL(config.mashery.baseurl)
    address.pathname = `/${config.mashery.itempath}/${realm}/${charName}`
    address.searchParams.append('locale', config.mashery.locale)
    address.searchParams.append('fields', config.mashery.itemfields)
    address.searchParams.append('apikey', auth.masheryKey)
    console.log(address.href)
    return address.href
    
}