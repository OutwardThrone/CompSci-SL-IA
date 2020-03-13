import App from 'next/app';
import Head from 'next/head';
import NavigationBar from '../components/navbar';
import Base from '../components/base';
import '../css/app.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import "../css/index.css";
import { render } from 'react-dom';
import User from '../classes/user';
import cookies from 'next-cookies';
import { firestore } from '../firebase';
import Course from '../classes/course.js';
//import Router from 'next/router';

//Router.events.on('')

class MyApp extends App {

    constructor(props) {
        super(props)
    }

    static async getInitialProps(appctx) {
        const {ctx} = appctx

        let availableCourses = []
        await firestore.collection('availableCourses').withConverter(Course.courseConverter).get().then(docs => {
            docs.forEach(doc => {
                availableCourses.push(doc.data())
            })
        })
        const currentUser = cookies(ctx).currentUser
        appctx.ctx["availableCourses"] = availableCourses
        appctx.ctx["currentUser"] = currentUser
        const appProps = await App.getInitialProps(appctx)
        const navProps = await NavigationBar.getInitialProps(appctx)

        const isAdminBool = currentUser ? User.isAdmin(currentUser.email) : false
        return {currentUser: currentUser || User.identity(), ...appProps, ...navProps, availableCourses: availableCourses, isAdmin: isAdminBool}
    }

    render() {
        const {Component, pageProps, currentUser, navProps, availableCourses, isAdmin} = this.props;
        return (
            <div>
                <Head>
                    {/*do stuff here*/}
                    <title>Coding Class</title>
                    <script src="https://kit.fontawesome.com/27622bad5b.js" crossOrigin="anonymous"></script>
                </Head>
                <NavigationBar currentUser={currentUser} {...navProps} isAdmin={isAdmin} />
                <Base>
                    <Component {...pageProps} currentUser={currentUser} availableCourses={availableCourses} isAdmin={isAdmin} />
                </Base>
            </div>
        )
    }
}

export default MyApp;