import { firestore } from "../../firebase"
import Course from "../../classes/course"
import User from "../../classes/user"
import { Button, Form, FormGroup, Label, Input, FormText } from "reactstrap"
import Router from "next/router"
import { storage, firebase } from "../../firebase"
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
        this.getCourseFiles = this.getCourseFiles.bind(this)
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

    async getCourseFiles() {
        const fileComponent = {}
        const courseRef = storage.ref(`courseFileUploads`).child(this.state.course.id.toString())
        return await courseRef.listAll().then(async function (courseFolder) {
            if (courseFolder.prefixes.length > 0) {
                courseFolder.prefixes.map(userFolder => {
                    console.log(userFolder.name)
                    fileComponent[userFolder.name] = {}
                    return (
                        <div>
                            {userFolder.name}
                        </div>
                    )
                    /*await userFolder.listAll().then(async function(userItems) {
                        userItems.items.forEach(async function(item) {
                            await item.getDownloadURL().then(res => {
                                console.log(res)
                                fileComponent[userFolder.name][item.name] = res
                            })
                        })
                    })*/
                })
            }
        }).catch(e => {
            console.log('error viewing admin items', e)
        })
    }

    render() {

        const adminItems = this.props.isAdmin ?
            <div>
                Student Submitted Files
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

        let fileComponent = {}
        let files = []
        console.log(1)
        await storage.ref(`courseFileUploads`).child(targetCourse.id.toString()).list().then(courseFolder => {
            if (courseFolder.prefixes.length > 0) {
                courseFolder.prefixes.forEach(async userFolder => {
                    fileComponent[userFolder.name] = []
                    console.log(2)
                    const userItems = await userFolder.list()
                    userItems.items.forEach(async item => {
                        console.log(3)
                        const downloadURL = await item.getDownloadURL()
                        fileComponent[userFolder.name].push(downloadURL)
                    })
                })
            }
        })
        console.log(4)
        console.log(files)
        console.log(fileComponent)

        return { course: targetCourse, userInCourse: userInCourse }
    }
}