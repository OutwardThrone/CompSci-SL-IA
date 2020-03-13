import { firestore } from "../firebase";
import Course from './course.js'
import { storage } from "../firebase";
import { admins } from "../config";
export default class User {

    constructor(email, password, name) {
        this.email = email;
        this.password = password;
        this.name = name || "";
        
        
    }

    

    static isAdmin(email) {
        return admins.includes(email)
    }

    async userInFirestore() {
        let bool = false
        await firestore.collection('userInfo').get().then(snap => {
            snap.forEach(doc => {
                if (doc.id === this.email) {
                    bool = true
                }
            })
        })
        return bool;
    }

    async isInCourse(course) {
        
        let inCourse = false
        await firestore.collection('userInfo').doc(this.email).collection('courses').withConverter(Course.courseConverter).get().then(allCourses => {
            allCourses.forEach(eachCourse => {
                if (eachCourse.id === course.id) {
                    inCourse = true;
                }
            })
        })
        //console.log(`user is ${inCourse ? `in` : `not in`} ${course.name}`)
        return inCourse;
    }

    async enrollInCourse(course) {
        console.log(`setting course: ${course.name} to ${this.email}`)
        let isSuccess = true;
        await firestore.collection('userInfo').doc(this.email).set({}).catch(e => {
            console.log('set blank doc error', e)
            isSuccess = false;
        })
        await firestore.collection('userInfo').doc(this.email).collection('courses').withConverter(Course.courseConverter).doc(course.id).set(course).catch(e => {
            console.log('setting course error', e)
            isSuccess = false;
        })
        return isSuccess;
    }

    async removeFromCourse(course) {
        console.log(course.id)
        await firestore.collection('userInfo').doc(this.email).collection('courses').withConverter(Course.courseConverter).doc(course.id).delete().then(() => {
            console.log(`removed course: ${course.name} from ${this.email}`)
        }).catch(e => {
            console.log(`failed in removing course: ${course.name} from ${this.email}`, e)
        })
    }

    async storeFile(course, file) {
        let uploadRes = "Upload Failed"
        await storage.ref(`courseFileUploads/${course.id}/${this.email}/${file.name}`).put(file).then(uploadSnap => {
            console.log('upload success')
            uploadRes = "Upload Success!"
        }).catch(e => {
            console.log('upload failed', e)
            uploadRes = "Upload Failed"
        })

        return uploadRes
    }

    async retrieveCourses() {
        const inFireStore = await this.userInFirestore()
        if (!inFireStore) {
            //person not in database
            //firestore.collection('userInfo').doc(this.email).collection('courses') //https://firebase.google.com/docs/firestore/manage-data/add-data#custom_objects
            return []
        } else {
            //person in database
            let currentCourses = []
            await firestore.collection('userInfo').doc(this.email).collection('courses').withConverter(Course.courseConverter).get().then(docs => {
                docs.forEach(doc => {
                    currentCourses.push(doc.data())
                })
            })
            return currentCourses
        }
    }

    // creates blank user
    static identity() {
        return new User("", "", "");
    }

}