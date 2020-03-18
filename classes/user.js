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

    
    /**
     * Static method, returns true if email is admin, false if not.
     * @param {String} email a user's email
     */
    static isAdmin(email) {
        return admins.includes(email)
    }

    /**
     * returns true if current user has a document in "userInfo" in firestore
     */
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

    /**
     * Returns true if user is in the course
     * @param {Course} course the course to check
     */
    async isInCourse(course) {
        
        let inCourse = false
        await firestore.collection('userInfo').doc(this.email).get().then(doc => {
            if (doc.get('courseIds')) {
                inCourse = doc.get('courseIds').includes(course.id)
            }
        })
        //console.log(`user is ${inCourse ? `in` : `not in`} ${course.name}`)
        return inCourse;
    }

    /**
     * returns array of all course ids that user is enrolled in.
     */
    async getCurrentCourses() {
        let currentCourses = []
        await firestore.collection('userInfo').doc(this.email).get().then(doc => {
            if (doc.get('courseIds')) {
                currentCourses = doc.get('courseIds')
            }
        }).catch(e => {
            console.log("error retrieving courses", e)
        })
        return currentCourses;
    }

    /**
     * enrolls the user in the course
     * @param {Course} course 
     */
    async enrollInCourse(course) {
        console.log(`setting course: ${course.name} to ${this.email}`)
        let isSuccess = true;
        let courseIds = await this.getCurrentCourses().catch(e => {
            isSuccess = false;
        })
        courseIds.push(course.id.toString())
        await firestore.collection('userInfo').doc(this.email).set({
            'courseIds': courseIds,
            "name": this.name
        }).catch(e => {
            console.log("error adding course", e)
            isSuccess = false;
        })
        return isSuccess;
    }

    /**
     * removes the user from the course
     * @param {Course} course 
     */
    async removeFromCourse(course) {
        let courseIds = await this.getCurrentCourses()
        courseIds = courseIds.filter((val, index, arr) => {
            return val != course.id
        })
        await firestore.collection('userInfo').doc(this.email).set({
            'courseIds': courseIds
        }).catch(e => {
            console.log(`failed in removing course: ${course.name} from ${this.email}`, e)
        })
    }

    /**
     * Stores a file inside a course folder in Firebase Storage
     * @param {Course} course 
     * @param {File} file 
     */
    async storeFile(course, file) {
        let uploadRes = "Upload Failed"
        await storage.ref(`courseFileUploads/${course.id}/${this.name}/${file.name}`).put(file).then(uploadSnap => {
            console.log('upload success')
            uploadRes = "Upload Success!"
        }).catch(e => {
            console.log('upload failed', e)
            uploadRes = "Upload Failed"
        })

        return uploadRes
    }

    /**
     * Returns a course array of all the courses a user is in. Not just the ids which getCurrentCourses() does
     * @param {Course[]} availableCourses 
     */
    async retrieveCourses(availableCourses) {
        const inFireStore = await this.userInFirestore()
        if (!inFireStore) {
            //person not in database
            //firestore.collection('userInfo').doc(this.email).collection('courses') //https://firebase.google.com/docs/firestore/manage-data/add-data#custom_objects
            return []
        } else {
            //person in database
            let currentCourseIds = await this.getCurrentCourses()
            let currentCourses = [];
            for (let indivCourse of availableCourses) {
                if (currentCourseIds.includes(indivCourse.id)) {
                    currentCourses.push(indivCourse);
                }
            }
            return currentCourses
        }
    }

    /**
     * returns a blank user
     */
    static identity() {
        return new User("", "", "");
    }

}