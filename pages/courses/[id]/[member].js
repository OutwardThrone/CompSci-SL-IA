import { firestore, storage } from "../../../firebase"
import Course from "../../../classes/course"
import { Button, Form, FormGroup, Label, Input, FormText, Badge } from "reactstrap"
import Router from "next/router"
import User from "../../../classes/user"
import Link from "next/link"

/**
 * This page dynamically routes the course id and the member name to show file from. Get initial props finds the target course and target member's files.
 * And the function returns the files so they can be clicked and downloaded. 
 */
const MemberPage = props => {
    return (
        <div className="inner-text">
            <div className="course-name">{props.course.name}</div>
            <div className="course-description">{props.course.description}</div>
            <h5><b>{props.memberName}</b>'s Uploaded Files</h5>
            <div className="file-view">
                {props.userFiles.map(fileInfo => {
                    return (
                        <Button className="file-button" key={fileInfo.name} href={fileInfo[1]} color="primary" target="_blank" >{fileInfo[0]}</Button>
                    )
                })}
            </div>
            <Button href={`/courses/${props.course.id}`}>Return to Course</Button>
        </div>
    )
}

MemberPage.getInitialProps = async ctx => {
    const {id, member} = ctx.query
    let targetCourse = null;
    await firestore.collection('availableCourses').withConverter(Course.courseConverter).get().then(docs => {
        docs.forEach(doc => {
            if (doc.data().id == id) {
                targetCourse = doc.data()
            }
        })
    })
    let fileComponent = []
    if (ctx.currentUser) {
        if (User.isAdmin(ctx.currentUser.email)) {
            await storage.ref(`courseFileUploads/${targetCourse.id.toString()}/${member}`).list().then(async userItems => {
                for (let item of userItems.items) {
                    await item.getDownloadURL().then(downloadURL => {
                        fileComponent.push([item.name, downloadURL])
                    })
                }
            })
                
        } 
        console.log(fileComponent)
        
    }

    return {course: targetCourse, userFiles: fileComponent, memberName: member}
}

export default MemberPage