import firebase from 'firebase';
import 'firebase/'
import 'firebase/database'
import 'firebase/auth'
import 'firebase/storage'
//import {credential} from 'firebase-admin'
import firebaseConfig from "../firebase-config.js";


if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig)
}

const firestore = firebase.firestore()

const storage = firebase.storage()

const auth = firebase.auth();

export {
    firebase,
    firestore,
    storage,
    auth
}