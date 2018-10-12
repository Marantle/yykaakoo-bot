import charDataRef from '../db/chardata.js'
import followsRef from '../db/mythicplusfollows.js'
import log from '../lib/logger'
import {
  getFollowedNames
} from './mychardata.js'

const getCompare = (prop) => (a, b) => {
  if (a[prop] > b[prop])
    return -1;
  if (a[prop] < b[prop])
    return 1;
  return 0;
}

const topItemLevel = async (params, messageToEdit, message) => {
  const param = params[0]
  const inBags = param === 'bag'
  let sortBy = 'averageItemLevelEquipped'
  if (inBags)
    sortBy = 'averageItemLevel'

  const compare = getCompare(sortBy)

  let topItemLevels
  const charDataSnapshot = await charDataRef.once('value')
  const charData = charDataSnapshot.val()
  const orderedCharData = Object.keys(charData).map((k) => {
    return { ...charData[k],
      name: k.split('-')[0]
    }
  }).sort(compare)


  const topTenData = orderedCharData.slice(0, 10)

  const topTenValues = topTenData.map(char => {
    return {
      name: char.name,
      value: char[sortBy]
    }
  })

  let msg = ''

  for (let i = 0; i < topTenValues.length; i++) {
    const participant = topTenValues[i];
    const nameWithColon = (i + 1) + '.' + participant.name + ':'
    msg += `${nameWithColon.padEnd(15)} ${participant.value}\n`
  }
  const fix = '```'
  return fix + msg + fix
}

const apSort = (a, b) => {
  var aLvl = a.azeriteLevel
  var bLvl = b.azeriteLevel
  var aPer = a.azeritePercentage
  var bPer = b.azeritePercentage

  if (aLvl == bLvl) {
    return (aPer > bPer) ? -1 : (aPer < bPer) ? 1 : 0
  } else {
    return (aLvl > bLvl) ? -1 : 1
  }
}

const topAzerite = async (params, messageToEdit, message) => {


  let topAzerite
  const charDataSnapshot = await charDataRef.once('value')
  const charData = charDataSnapshot.val()
  const orderedCharData = Object.keys(charData).map((k) => {
    return { ...charData[k],
      name: k.split('-')[0]
    }
  }).sort(apSort)


  const topTenData = orderedCharData.slice(0, 10)

  const topTenValues = topTenData.map(char => {
    return {
      name: char.name,
      value: parseFloat(char.azeriteLevel) + parseFloat(char.azeritePercentage)
    }
  })

  let msg = ''

  for (let i = 0; i < topTenValues.length; i++) {
    const participant = topTenValues[i];
    const nameWithColon = (i + 1) + '.' + participant.name + ':'
    msg += `${nameWithColon.padEnd(15)} ${participant.value.toFixed(2)}\n`
  }
  const fix = '```'
  return fix + msg + fix
}

export {
  topItemLevel,
  topAzerite
}
