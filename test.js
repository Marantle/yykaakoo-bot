const admin = require('firebase-admin');

const serviceAccount = require('./src/config/serviceAccountKey.json');

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://discourse-character-storage.firebaseio.com/'
})

var db = admin.database();
var mainRef = db.ref('mains');
var followedRef = db.ref('follows/mythicplus');



mainRef.on('value', function (snapshot) {
  const mains = snapshot.val()
  console.log(JSON.stringify(mains, null, 2))
}, function (errorObject) {
  console.log('The read failed: ' + errorObject.code);
})

followedRef.update({
  '226502292625424396': [
    'Inath',
    'Thraut',
    'Tanih'
  ],
  '179991621884968960': [
    'Villasukka',
    'Verkkosukka'
  ]
}, (error) => {
  if (error) {
    console.log("Data could not be saved." + error);
  } else {
    console.log("Data saved successfully.");
    followedRef.child('226502292625424396').once('value', function (snapshot) {
      const mains = snapshot.val()
      console.log(JSON.stringify(mains, null, 2))
    }, function (errorObject) {
      console.log('The read failed: ' + errorObject.code);
    })
  }
})

mainRef.update({
  '226502292625424396': {
    main: {
      name: 'Inath',
      class: 'Hunter',
      spec: 'Marksman'
    },
    alts: [{
        name: 'Tanih',
        class: 'Priest',
        spec: 'Disc'
      },
      {
        name: 'Thraut',
        class: 'Monk',
        spec: 'Brewmaster'
      }
    ]
  },
  '179991621884968960': {
    main: {
      name: 'Villasukka',
      class: 'Shaman',
      spec: 'Elemental'
    },
    alts: [{
      name: 'Verkkosukka',
      class: 'Monk',
      spec: 'Mistweaver'
    }]
  }
}, (error) => {
  if (error) {
    console.log("Data could not be saved." + error);
  } else {
    console.log("Data saved successfully.");

  }
})