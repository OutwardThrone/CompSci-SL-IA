import Base from "../components/base";
import { firestore } from "../firebase";
import Course from "../classes/course";
import Link from "next/link";

const onCourseClick = function(course) {

}

const CourseInfo = props => (
    <>
        <div className="course-info">
            {props.availableCourses.map(course => {
                return (
                    <Link href="/courses/[id]" as={`/courses/${course.id}`}>
                        <div className="course" id={course.id} >
                            <div className="course-name">{course.name}</div>
                            <p>{course.description || "no desc"}</p>
                        </div>
                    </Link>
                )
            })}
        </div>
    </>
)

// CourseInfo.getInitialProps = async function(ctx) {
//     let availableCourses = []
//     await firestore.collection('availableCourses').withConverter(Course.courseConverter).get().then(docs => {
//         docs.forEach(doc => {
//             availableCourses.push(doc.data())
//         })
//     })
//     return {availableCourses: availableCourses}
// }

export default CourseInfo