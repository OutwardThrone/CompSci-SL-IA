import Base from "../components/base";
import { parseCookies } from "../lib/parseCookies";
import User from '../classes/user'
import cookies from 'next-cookies'

const HomePage = props => {
    return (
        <div className="inner-text">
            <h2 className="home-header">About</h2>
            Sriram's coding class is a personal class that is just starting up. He has had experience teaching his two sons and many students in the Sammamish area.<br/>
            We recommend these courses for middle schoolers looking to get a headstart on high school. Coding is an invaluable skill and most students will love it.

        </div>
    )
}

// HomePage.getInitialProps = ctx => {
//     return {currentUser: cookies(ctx).currentUser || User.identity()}    
// }


export default HomePage;