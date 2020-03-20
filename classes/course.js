import { firestore } from "../firebase"

export default class Course {
    constructor(name, id, description, enrollKey) {
        this.name = name
        this.id = id
        this.description = description
        //this.enrolledUsers = enrolledUsers
        this.enrollKey = enrollKey
    }

    /**
     * firestore data converter
     */
    static courseConverter = {
        toFirestore: function(course) {
            return {
                name: course.name,
                id: course.id, 
                description: course.description || "",
                enrollKey: course.enrollKey
                }
        },
        fromFirestore: function(snapshot, options){
            const data = snapshot.data(options);
            return new Course(data.name, data.id, data.description, data.enrollKey)
        }
    }

    /**
     * returns a list of names of the users in the specific course
     */
    async getUsersInCourse() {
        let usersInCourse = [];
        await firestore.collection('userInfo').get().then(snap => {
            for (let userDoc of snap.docs) {
                if (userDoc.data().courseIds.includes(this.id)) {
                    usersInCourse.push(userDoc.data().name)
                }
            }
        }).catch(e => {
            console.log('error finding users in course')
        })
        return usersInCourse
    }

    /**
     * returns and empty course.
     */
    static identity() {
        return new Course("", 0, "", "", "")
    }
}