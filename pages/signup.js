import {Form, Input, FormGroup, Label, Button, FormFeedback} from 'reactstrap';
import '../css/index.css';
import Base from '../components/base.js'
import { useRouter } from "next/router";
import { auth } from '../firebase';
import redirect from 'next-redirect'
import User from '../classes/user';

class SignUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: this.props.user.email,
            password: this.props.user.password,
            name: this.props.user.name,
            emailInvalid: this.props.emailInvalid,
            passwordInvalid: this.props.passwordInvalid,
            status: this.props.status
        }
    }

    static async getInitialProps(ctx) {
        let {query} = ctx
        let currentUser = new User(query.email, query.password, query.name)
        if (query.email && query.password && query.name) { 
            return await auth.createUserWithEmailAndPassword(query.email, query.password)
            .then(userCred => {
                userCred.user.updateProfile({displayName: query.name});
                //maybe redirect to home page? //https://github.com/matthewmueller/next-redirect/
                return redirect(ctx, `/profile?user=${encodeURIComponent(JSON.stringify(currentUser))}`)
                //return {email: query.email, password: query.password, emailInvalid: false, passwordInvalid: false, status: "success", name: query.name}
            }).catch(error => {
                //handling
                switch (error.code) {
                    case "auth/email-already-in-use":
                        return {user: currentUser, emailInvalid: true, passwordInvalid: false, status: "Email already linked to an account"}
                    case "auth/invalid-email":
                        return {user: currentUser, emailInvalid: true, passwordInvalid: false, status: "Invalid Email"}
                    case "auth/operation-not-allowed":
                        return {user: currentUser, emailInvalid: false, passwordInvalid: false, status: "An error occured: operation not allowed"}
                    case "auth/weak-password":
                        return {user: currentUser, emailInvalid: false, passwordInvalid: true, status: "Weak Password"}
                    default:
                        break;
                }
            })
        }
        return {user: currentUser, emailInvalid: false, passwordInvalid: false, status: "missing params"}
    }

    render() {
        return (
            <>
                <Form className="submission-form" >
                    <FormGroup>
                        <Label for="name">Name</Label>
                        <Input type="name" name="name" id="nameInput" placeholder="Enter your first and last name" />
                    </FormGroup>
                    <FormGroup>
                        <Label for="email">Email</Label>
                        <Input type="email" name="email" id="emailInput" invalid={this.props.emailInvalid} placeholder="Enter your email" />
                        <FormFeedback valid>Valid email</FormFeedback>
                        <FormFeedback invalid>Invalid email</FormFeedback>
                    </FormGroup>
                    <FormGroup>
                        <Label for="password">Password</Label>
                        <Input type="password" name="password" id="passwordInput" invalid={this.props.passwordInvalid} placeholder="Enter a secure password" />
                        <FormFeedback valid>Wrong password</FormFeedback>
                        <FormFeedback invalid>Invalid password</FormFeedback>
                    </FormGroup>
                    <FormText color="info">{this.props.status}</FormText>
                    <FormGroup>
                        <Button color="secondary" size="sm" href="/login">
                            <i className="fas fa-long-arrow-alt-left" ></i>
                            Log In
                        </Button>
                        <Button color="success">Sign Up</Button>
                    </FormGroup>
                </Form>
                <div>
                    {this.props.status}
                </div>
            </>
        )
    }
}

export default SignUp