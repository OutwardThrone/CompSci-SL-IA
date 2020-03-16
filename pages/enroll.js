import { Form, FormGroup, Input, Button, Label, FormFeedback } from "reactstrap"
import Link from 'next/link'
import { firestore } from '../firebase'
import Course from "../classes/course"
import User from "../classes/user"

const Enrollment = props => {
    if (!props.success) {
        const u = new User(props.currentUser.email, props.currentUser.password, props.currentUser.name)
        return (
            <Form className="submission-form">
                {/*MAKE DIS A FORM WHERE PERSON CHOOSE FROM DROPDOWN WITH ALL AVAILALBE COURSES. THEN COURSE KEY WHICH IS PARAM IN COURSES*/}
                Sign up for a course with a specified course key (instructor should provide this key)
                <FormGroup>
                    <Label>Choose a course</Label>
                    <Input type="select" name="selectCourse" id="selectCourse" >
                        {props.availableCourses.map(course => {
                            return (
                                <option key={course.id}>{course.name}</option>
                            )
                        })}
                    </Input>
                </FormGroup>
                <FormGroup>
                    <Label>Enter course key</Label>
                    <Input type="text" name="courseKey" id="courseKey" className="caps-only" invalid={props.invalidKey} />
                    <FormFeedback invalid>Course key invalid. The key is obtained from the instructor after signing up for a course.</FormFeedback>
                </FormGroup>
                <FormGroup>
                    <Button color="primary" >Submit</Button>
                </FormGroup>
            </Form>
        )
    } else {
        return (
            <div className='inner-text'>
                Successfully enrolled into <strong>{props.selectedCourse}</strong>
                <br/>
                <Button color="success" href="/enroll" style={{margin: "10px", "marginTop": "20px"}}><a>Enroll In Another Course</a></Button>
                {props.targetCourse ? 
                <Button color="primary" style={{margin: "10px", "marginTop": "20px"}}>
                    <Link href="/courses/[id]" as={`courses/${props.targetCourse.id}`}><a>Go to Course</a></Link>
                </Button> 
                : <></>}
            </div>
        )
    }
}

Enrollment.getInitialProps = async function(ctx) {
    const { query } = ctx;
    const { courseKey, selectCourse } = query;
    let isInvalidKey, isSuccess = false
    const currentUser = new User(ctx.currentUser.email, ctx.currentUser.password, ctx.currentUser.name)
    let targetCourse = null
    for (let course of ctx.availableCourses)  {
        if (course.name == selectCourse) {
            if (course.enrollKey.toUpperCase() == courseKey.toUpperCase()) {
                //add course to user in firestore
                targetCourse = course
                isSuccess = await currentUser.enrollInCourse(course)
                break;
            } else {
                isInvalidKey = true
            }
        }
    }
    return {invalidKey: isInvalidKey, success: isSuccess, selectedCourse: selectCourse, targetCourse: targetCourse}
}

export default Enrollment