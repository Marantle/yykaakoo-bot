import mainsRef from '../db/mains.js'

const listAllMains = () => {
    console.log('start mains')
    return new Promise((resolve, reject) => {
        mainsRef.once('value', (snap) => {
            console.log('got mains', snap.val())
            resolve(snap.val())
        }, (errorObject) => {
            console.log('error mains')
            reject("The read failed: " + errorObject.code);
        });
    })
}

export default async (params, messageToEdit, ) => {
    let allMains
    try {
        allMains = await listAllMains()
    } catch (error) {
        allMains = error
    }
    return JSON.stringify(allMains, null, 2)
}