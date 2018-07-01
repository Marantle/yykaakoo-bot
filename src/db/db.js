import * as firebase from 'firebase-admin'

import serviceAccount from '../config/serviceAccountKey.json'

const config = {
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://discourse-character-storage.firebaseio.com/'
}

export default !firebase.apps.length ? firebase.initializeApp(config).database() : firebase.database();