import React, {useState} from 'react';
import Link from 'next/link';
import '../css/index.css';
import {Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, NavbarText}from 'reactstrap';
import cookies from 'next-cookies'
import User from '../classes/user.js'
import Router from 'next/router';

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

const removeCurrentUserCookie = () => {
    //Cookies.remove("currentUser")
    document.cookie = `currentUser=; path="/"; expires=Thu, 01 Jan 1970 00:00:01 GMT`
}

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


class NavigationBar extends React.Component {
    

    constructor(props) {
        super(props)
        this.state = {
            isOpen: false
        }
        this.toggle = this.toggle.bind(this)
        this.userLoggedIn = this.userLoggedIn.bind(this)
    }

    toggle() {
        this.setState({ isOpen: !this.state.isOpen });
    }

    static async getInitialProps({router}) {
        //console.log(router)
        //console.log(router.pathname)
        return {pathname: router.pathname}
    }

    userLoggedIn() {
        return JSON.stringify(this.props.currentUser) != JSON.stringify(User.identity())
    }

    render() {
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