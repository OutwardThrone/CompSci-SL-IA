import React, {useState} from 'react';
import Link from 'next/link';
import '../css/index.css';
import {Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, NavbarText}from 'reactstrap';
import cookies from 'next-cookies'
import User from '../classes/user.js'
import Router from 'next/router';


/**
 * This button is conditionally rendered when there is no currentUser cookie in the browser
 */
const LogInButton = () => {
    return (
        <NavItem>
            <NavLink>
                <Link href="/login">
                    <a><i className="fas fa-sign-in-alt fa-lg"></i>{' '}Log-In</a>
                </Link>
            </NavLink>
        </NavItem>
    )
}

/**
 * Removes the currentUser cookie from browser, the onclick method of log out button
 */
const removeCurrentUserCookie = () => {
    //Cookies.remove("currentUser")
    document.cookie = `currentUser=; path="/"; expires=Thu, 01 Jan 1970 00:00:01 GMT`
}

/**
 * conditionally rendered if there is a currentUser cookie in the browser 
 */
const LogOutButton = props => {
    return (
        <NavItem>
            <NavLink>
                <Link href={props.pathname || "/"}>
                    <a onClick={removeCurrentUserCookie}><i class="fas fa-sign-out-alt fa-lg"></i>Log-Out</a>
                </Link>
            </NavLink>
        </NavItem>
    )
}

/**
 * This class is the navbar that is above the base component on any webpage in _app.js
 * It takes care of showing the correct buttons for which user is logged in
 */
class NavigationBar extends React.Component {
    

    constructor(props) {
        super(props)
        this.state = {
            isOpen: false
        }
        this.toggle = this.toggle.bind(this)
        this.userLoggedIn = this.userLoggedIn.bind(this)
    }

    /**
     * toggles the navbar on small width screens
     */
    toggle() {
        this.setState({ isOpen: !this.state.isOpen });
    }

    /**
     * retrieves the pathname for the logout button
     */
    static async getInitialProps({router}) {
        //console.log(router)
        //console.log(router.pathname)
        return {pathname: router.pathname}
    }

    /**
     * returns true if the currentUser cookie is in the browser
     */
    userLoggedIn() {
        return JSON.stringify(this.props.currentUser) != JSON.stringify(User.identity())
    }

    render() {
        //login or log out button to show
        let buttonToShow = this.userLoggedIn() ? <LogOutButton pathname={this.props.pathname} /> : <LogInButton />;
        return (
            <div>
                <Navbar color="dark" dark expand="md">
                    <NavbarBrand href="/" className="navbar-brand"><i className="fab fa-python"></i>{' '}Sriram's Coding Class</NavbarBrand>
                    <NavbarToggler onClick={this.toggle} />
                    <Collapse isOpen={this.state.isOpen} navbar>
                        <Nav className={`mr-auto nav`} navbar>
                            <NavItem>
                                <NavLink>
                                    <Link href="/courseinfo">
                                        <a>Course Info</a>
                                    </Link>
                                </NavLink>
                            </NavItem>                          
                        </Nav>
                        <Nav className={`ml-auto nav navbar-right`}>
                            {this.userLoggedIn() ? (
                                <>
                                {!User.isAdmin(this.props.currentUser.email) ? 
                                    <NavItem>
                                        <NavLink>
                                            <Link href="/enroll">
                                                <a>Course Enrollment</a>
                                            </Link>
                                        </NavLink>
                                    </NavItem> : <></> }
                                    <NavItem>
                                        <NavLink>
                                            <Link href="/profile">
                                                <a>User Info</a>
                                            </Link>
                                        </NavLink>
                                    </NavItem>
                                </>
                            ) : <></>}
                            {buttonToShow}
                        </Nav>
                    </Collapse>
                </Navbar>
            </div>
        )
    }
}

export default NavigationBar;