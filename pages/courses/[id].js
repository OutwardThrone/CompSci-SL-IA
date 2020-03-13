import { firestore } from "../../firebase"
import Course from "../../classes/course"
import User from "../../classes/user"
import { Button, Form, FormGroup, Label, Input, FormText } from "reactstrap"
import Router from "next/router"
import { storage } from "../../firebase"
global.XMLHttpRequest = require("xhr2");


export default class IndividualCourse extends React.Component {
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

    unenrollUser() {
        const enrolledUser = new User(this.state.currentUser.email, this.state.currentUser.password, this.state.currentUser.name)
        enrolledUser.removeFromCourse(this.state.course)
        Router.push(`/courses/${this.state.course.id}`)
    }

    onChangeHandler(event) {
        this.setState({
            currentFile: event.target.files[0]
        })
    }

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
                <h5>Student Submitted Files</h5>
                {this.props.uploadedFiles.map(file => {
                    return (
                        <>
                            <div className="file-view-name" key={`${file[0]}`}>{file[0]}'s uploaded files</div>
                            <div className="file-view">
                                {file[1].map((url, index) => {
                                    return (
                                        <Button className="file-button" key={index} href={url} color="primary" target="_blank" >{index+1}</Button>
                                    )
                                })}
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
                        <Label for="fileSubmission">Submit a file</Label><br />
                        <Input type="file" name="fileSubmission" id="fileSubmission" onChange={this.onChangeHandler} />
                        <FormText>{this.state.uploadRes}</FormText>
                    </FormGroup>
                    <Button color="success" onClick={this.uploadFile}>Submit</Button>
                </Form>
                <div className="unenroll-button">
                    <Button color="danger" onClick={this.unenrollUser}>Unenroll from course</Button>
                </div>
            </div>
            :
            <></>

        return (
            <div className="inner-text">
                <div className="course-name">{this.props.course.name}</div>
                <div className="course-description">{this.props.course.description}</div>
                <br />
                {enrolledUserItems}
                <br />
                {adminItems}
            </div>
        )
    }

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
        if (ctx.currentUser) {
            const enrolledUser = new User(ctx.currentUser.email, ctx.currentUser.password, ctx.currentUser.name)
            userInCourse = await enrolledUser.isInCourse(targetCourse)
        }

        //get storage files
        let fileComponent = []
        if (User.isAdmin(ctx.currentUser.email)) {
            await storage.ref(`courseFileUploads`).child(targetCourse.id.toString()).list().then(async courseFolder => {
                while (courseFolder.prefixes.length > 0) {
                    let userFolder = courseFolder.prefixes.pop()
                    fileComponent.push([userFolder.name, []])
                    await userFolder.list().then(async userItems => {
                        for (let item of userItems.items) {
                            await item.getDownloadURL().then(downloadURL => {
                                fileComponent[fileComponent.length-1][1].push(downloadURL)
                            })
                        }
                    })
                }
            })
        }

        return { course: targetCourse, userInCourse: userInCourse, uploadedFiles: fileComponent}
    }
}