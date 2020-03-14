import {Form, Input, FormGroup, Label, Button, FormFeedback, FormText} from 'reactstrap';
import '../css/index.css';
import Base from '../components/base.js'
import { useRouter, Router } from "next/router";
import { auth } from '../firebase';
import Link from 'next/link';
import redirect from 'next-redirect';
import User from '../classes/user';
import Cookies from 'js-cookie';



class LoginPage extends React.Component {

    static DEFAULT_STATUS = ""

    constructor(props) {
        super(props)
        //this.attemptedLogin = this.attemptedLogin.bind(this)
        this.state = {
            email: this.props.user.email,
            password: this.props.user.password, //set this using query object
            emailInvalid: this.props.emailInvalid,
            passwordInvalid: this.props.passwordInvalid,
            status: this.props.status
        }
    }

    static async getInitialProps(ctx) {
        let {query} = ctx
        let currentUser = new User(query.email, query.password);
       // console.log(User.identity().email)
        //console.log("s;dlkfj")
        if (query.email && query.password) {
            return await auth.signInWithEmailAndPassword(query.email, query.password).then((userCreds) => { //https://firebase.google.com/docs/reference/js/firebase.auth.Auth.html?authuser=0#sign-inwith-email-and-password
                let {credential, user} = userCreds
                console.log("successfully logged in");
                let currentUser = new User(query.email, query.password, user.displayName);
                return redirect(ctx, `/profile?user=${encodeURIComponent(JSON.stringify(currentUser))}`)
            })
            .catch((error) => {
                //alert(error.code)
                console.log(error.code); //https://firebase.google.com/docs/reference/js/firebase.auth.Auth.html?authuser=0#createuserwithemailandpassword
                switch (error.code) {
                    case "auth/invalid-email":
                        return {user: currentUser, emailInvalid: true, passwordInvalid: false, status: "Invalid Email"}
                    case "auth/user-disabled":
                        return {user: currentUser, emailInvalid: true, passwordInvalid: false, status: "user Disabled"}
                    case "auth/user-not-found":
                        return {user: currentUser, emailInvalid: true, passwordInvalid: false, status: "User not found"}
                    case "auth/wrong-password":
                        return {user: currentUser, emailInvalid: false, passwordInvalid: true, status: "Wrong Password"}
                    default:
                        break;
                }
            });
        }
        return {user: User.identity(), emailInvalid: false, passwordInvalid: false, status: this.DEFAULT_STATUS}
    }

    /*componentDidMount() { WORKS
        Cookies.set("testcook", this.state.status)
    }*/

    render() {
        return (
            <>
                {/*
                <img src="https://miro.medium.com/max/3118/1*iwPLQjyFYRTVeQ2cb4S9rA.png" />*/}
                <Form className="submission-form" >
                    <FormGroup>
                        <Label for="email">Email</Label>
                        <Input type="email" name="email" id="emailInput" placeholder="Enter your email" invalid={this.state.emailInvalid} />
                        <FormFeedback valid>Valid email</FormFeedback>
                        <FormFeedback invalid>Invalid email</FormFeedback>
                    </FormGroup>
                    <FormGroup>
                        <Label for="password">Password</Label>
                        <Input type="password" name="password" id="passwordInput" placeholder="Enter your password" invalid={this.state.passwordInvalid} />
                        <FormFeedback valid>Valid password</FormFeedback>
                        <FormFeedback invalid>Invalid password</FormFeedback>
                    </FormGroup>
                    <FormText color="info">{this.props.status}</FormText>
                    <FormGroup>
                        <Button color="secondary" >Log In</Button>
                        <Button color="primary" href="/signup" >Sign Up</Button>
                    </FormGroup>
                </Form>
            </>
        )
    }
}
export default LoginPage;