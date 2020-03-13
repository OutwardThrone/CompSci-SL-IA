import Base from "../components/base";
import User from "../classes/user";
import Router from "next/router";
import cookies from "next-cookies";
import { Container, Row, Col, Button } from "reactstrap";
import Link from "next/link";

class ProfilePage extends React.Component {
    constructor(props) {
        super(props);
    }

    static async getInitialProps(ctx) {
        const {query, req} = ctx
        const u = cookies(ctx).currentUser || await JSON.parse(decodeURIComponent(query.user))
        const currentUser = new User(u.email, u.password, u.name)
        const courses = await currentUser.retrieveCourses(ctx.availableCourses)
        return {user: u, courses: courses}//{name: query.name, email: query.email, password: query.password}
    }

    componentDidMount() {
        //Cookies.set("currentUser", JSON.stringify(this.props.user))
        if (document.cookie.currentUser != JSON.stringify(this.props.user)) {
            document.cookie = `currentUser=${JSON.stringify(this.props.user)}; path="/"`
            Router.push(`/profile`)
        }        
    }

    render() {
        const showCourses = this.props.courses.length > 0
        return (
            <div className="inner-text">
                <div className="profile-title">
                    Welcome Back <t style={{fontWeight: 'bold'}}>{this.props.user.name}</t>
                </div>
                <Container className="profile-info">
                    <Row>
                        <Col className="left">Email</Col>
                        <Col className="right">{this.props.user.email}</Col>
                    </Row>
                    <Row>
                        {showCourses ? 
                            <>
                                <Col className="left">Courses</Col>
                                <Col className="right">
                                    {this.props.courses.map(course => {
                                        return (
                                            <p key={course.id} >
                                                <Link href="/courses/[id]" as={`/courses/${course.id}`} >
                                                    <a style={{textTransform: "capitalize"}}>{course.name}</a>
                                                </Link>
                                            </p>
                                        )
                                    })}
                                </Col> 
                            </>
                         : <></>}
                         {this.props.isAdmin ? 
                            <Button href='/courseinfo' color='primary' className='unenroll-button'>
                                Go to all courses
                            </Button> : <></>}
                    </Row>
                </Container>
            </div>
        )
    }
}

export default ProfilePage

{/* <div className="inner-text">
                <div className="profile-title">
                    Welcome Back {this.props.user.name}
                </div>
                <div className="profile-info">
                    <div>Email: {this.props.user.email}</div>
                    <div>
                        Courses: {this.props.courses.map(course => {
                            return (<li>{course.name}</li>)
                        })}
                    </div>
                </div>
            </div> */}