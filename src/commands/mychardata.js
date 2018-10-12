import charDataRef from '../db/chardata.js'
import followsRef from '../db/mythicplusfollows.js'
import log from '../lib/logger'

const getFollowedNames = async (userId) => {
    let follows
    await followsRef.child(userId).once('value', (followSnapshot) => {
        follows = followSnapshot.val()
    })
    return Object.values(follows)
}
const azeritePower = async (params, messageToEdit, message) => {
    const follows = await getFollowedNames(message.author.id)
    let apDatas = ''

    for (let name of follows) {
        name = name.replace(/^\w/, c => c.toUpperCase())
        const fullName = name + '-Darksorrow'
        const charDataSnapshot = await charDataRef.once('value')
        if (charDataSnapshot.hasChild(fullName)) {
            const dataSnapshot = await charDataRef.child(fullName).once('value')
            const charData = dataSnapshot.val()
            const {
                azeriteExperience,
                azeriteExperienceRemaining,
                azeriteLevel,
                azeritePercentage
            } = charData
            const requiredExperience = azeriteExperience + azeriteExperienceRemaining
            const progress = parseFloat(azeriteLevel) + parseFloat(azeritePercentage)
            apDatas += `${(name + ":").padEnd(15)} Level: ${progress.toFixed(2).padEnd(6)} Exp: ${azeriteExperience.toString().padStart(6)} / ${azeriteExperienceRemaining}\n`
        } else {
            log.error(`no ${fullName}`)
        }

    }
    const fix = '```'
    return fix + apDatas + fix
}

const itemLevel = async (params, messageToEdit, message) => {
    const follows = await getFollowedNames(message.author.id)
    let iLvlDatas = ''

    for (let name of follows) {
        name = name.replace(/^\w/, c => c.toUpperCase())
        const fullName = name + '-Darksorrow'
        const charDataSnapshot = await charDataRef.once('value')
        if (charDataSnapshot.hasChild(fullName)) {
            const dataSnapshot = await charDataRef.child(fullName).once('value')
            const charData = dataSnapshot.val()
            const {
                averageItemLevel,
                averageItemLevelEquipped
            } = charData
            iLvlDatas += `${(name + ":").padEnd(15)} Item Level: ${averageItemLevelEquipped.toString().padEnd(5)} Bag Level: ${averageItemLevel}\n`
        } else {
            log.error(`no ${fullName}`)
        }

    }
    const fix = '```'
    return fix + iLvlDatas + fix
}

export {
    azeritePower,
    itemLevel,
    getFollowedNames
}
