import { firestore, storage } from "../../../firebase"
import Course from "../../../classes/course"
import { Button, Form, FormGroup, Label, Input, FormText, Badge } from "reactstrap"
import Router from "next/router"
import User from "../../../classes/user"
import Link from "next/link"
global.XMLHttpRequest = require("xhr2");


/**
 * This class handles a specific course view.
 * If a stranger or unenrolled student views the file, they only see the name, description and return to course button
 * If an enrolled user visits this page, they will see the upload file button and if an admin visits the site, they see a list of all students which redirects to their uploaded files.
 */
export default class IndividualCourse extends React.Component {

    /**
     * The class states holds the current file, user, course, and result.
     */
    constructor(props) {
        super(props)
        this.state = {
            currentUser: new User(props.currentUser.email, props.currentUser.password, props.currentUser.name),
            course: props.course,
            currentFile: null,
            uploadRes: "",
        }
        this.unenrollUser = this.unenrollUser.bind(this);
        this.onChangeHandler = this.onChangeHandler.bind(this)
        this.uploadFile = this.uploadFile.bind(this)
    }

    /**
     * This calls the user method to remove a user from the course.
     */
    async unenrollUser() {
        const enrolledUser = new User(this.state.currentUser.email, this.state.currentUser.password, this.state.currentUser.name)
        await enrolledUser.removeFromCourse(this.state.course)
        Router.push(`/courses/${this.state.course.id}`)
    }

    /**
     * The on change event for the upload file button.
     * Stores the selected file for when the submit button is clicked
     */
    onChangeHandler(event) {
        this.setState({
            currentFile: event.target.files[0]
        })
    }

    /**
     * When the upload button is clicked, it pushes the selected file to firebase storage in the respective folder.
     */
    async uploadFile() {
        if (this.state.currentFile) {
            this.setState({
                uploadRes: "Loading..."
            })
            const uploadRes = await this.state.currentUser.storeFile(this.state.course, this.state.currentFile)
            this.setState({
                uploadRes: uploadRes
            })
        }
    }

    render() {

        const adminItems = this.props.isAdmin ?
            <div>
                {this.props.usersInCourse.length > 0 ? <h5>Students Enrolled in this Course</h5> : <></>}
                {this.props.usersInCourse.map(userName => {
                    return (
                        <>
                            <div className="student-list" key={`${userName}`}>
                                {this.props.userFiles[userName] > 0 ? (
                                    <div className="student-list-entry">
                                        <Button color="primary">
                                            <Link href="/courses/[id]/[member]" as={`/courses/${this.props.course.id}/${userName}`} >
                                                <a>{userName}</a>
                                            </Link>
                                            <h4><Badge color="success">{this.props.userFiles[userName]}</Badge></h4>
                                        </Button>
                                    </div>
                                ) : <div className="student-list-entry">
                                        <Button color="secondary">{userName}<h4><Badge color="success" >0</Badge></h4></Button>
                                    </div>}
                            </div>
                        </>
                    )
                })}
            </div>
            : <></>

        const enrolledUserItems = this.props.userInCourse && !this.props.isAdmin ?
            <div className="logged-in-course-options" >
                <Form>
                    <FormGroup>
                        <Label for="fileSubmission"><b>Submit a file</b></Label><br />
                        <Input type="file" name="fileSubmission" id="fileSubmission" onChange={this.onChangeHandler} />
                        <FormText>{this.state.uploadRes}</FormText>
                    </FormGroup>
                    <Button color="success" onClick={this.uploadFile}>Submit</Button>
                </Form>
                
                <div className="bottom-buttons">
                    <Button color="secondary" className="back-button" href="/courseinfo" >Back to course list</Button>
                    <Button color="danger" className="unenroll-button" onClick={this.unenrollUser}>Unenroll from course</Button>
                </div>
            </div>
            :
            <></>

        return (
            <div className="inner-text">
                <div className="course-name">{this.props.course.name}</div>
                <div className="course-description">{this.props.course.description}</div>
                {enrolledUserItems}
                {adminItems}
                {!this.props.userInCourse || this.props.isAdmin ? <Button color="secondary" className="back-button" href="/courseinfo" >Back to course list</Button> : <></>}
            </div>
        )
    }

    /**
     * retrieves the target course and all the users with their dynamic routes in the course.
     */
    static async getInitialProps(ctx) {
        const { id, fileSubmission } = ctx.query
        let targetCourse = null;
        let userInCourse = false;
        await firestore.collection('availableCourses').withConverter(Course.courseConverter).get().then(docs => {
            docs.forEach(doc => {
                if (doc.data().id == id) {
                    targetCourse = doc.data()
                }
            })
        })
        const usersInCourse = await targetCourse.getUsersInCourse()
        let fileComponent = {}
        if (ctx.currentUser) {
            const enrolledUser = new User(ctx.currentUser.email, ctx.currentUser.password, ctx.currentUser.name)
            userInCourse = await enrolledUser.isInCourse(targetCourse)
            if (User.isAdmin(ctx.currentUser.email)) {
                await storage.ref(`courseFileUploads`).child(targetCourse.id.toString()).list().then(async courseFolder => {
                    while (courseFolder.prefixes.length > 0) {
                        let userFolder = courseFolder.prefixes.pop()
                        await userFolder.list().then(async userItems => {
                            fileComponent[userFolder.name] = userItems.items.length.toString()
                        })
                    }
                })
            } 
            //console.log(fileComponent)
            
        }

        //get storage files
        
        /* fileComponent's format
            [
                [userName1, filesLength],

                [userName2, filesLength]
            ]
                
        */

        return { course: targetCourse, userInCourse: userInCourse, userFiles: fileComponent, usersInCourse: usersInCourse}
    }
}