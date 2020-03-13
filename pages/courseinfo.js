import Base from "../components/base";
import { firestore } from "../firebase";
import Course from "../classes/course";
import Link from "next/link";
import User from "../classes/user";
import { Badge } from "reactstrap";

const CourseInfo = props => {
    const u = new User(props.currentUser.email, props.currentUser.password, props.currentUser.name)
    
    return (
        <>
            <div className="course-info">
                {props.courseInfo.map(courseAndInCourse => {
                    return (
                        <Link href="/courses/[id]" as={`/courses/${courseAndInCourse[0].id}`} key={courseAndInCourse[0].id}>
                            <div className="course" id={courseAndInCourse[0].id} >
                                <div className="course-name">{courseAndInCourse[0].name}  {courseAndInCourse[1] ? <Badge pill color="success">Enrolled</Badge> : <></>}</div>
                                <p>{courseAndInCourse[0].description || "no desc"}</p>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </>
    )
}

CourseInfo.getInitialProps = async function(ctx) {
    let courseInfo = []
    if (ctx.currentUser) {
        const u = new User(ctx.currentUser.email, ctx.currentUser.password, ctx.currentUser.name)
        for (let course of ctx.availableCourses) {
            let isInCourse = await u.isInCourse(course)
            courseInfo.push([course, isInCourse])
        }
    } else {
        for (let course of ctx.availableCourses) {
            courseInfo.push([course, false])
        }
    }
    return {courseInfo: courseInfo}
}

export default CourseInfo