import React, {PropTypes} from 'react';
import { Link, IndexLink } from 'react-router';


const Header = ({
    home,
    alt_title,
    logged_in,
    extra_classes
}) => home ? 
(<div className={extra_classes ? "header" + extra_classes : "header"}>
    <div className="header-title">
        What Floats Your Vote
    </div>

    <div className="header-right">
        <Link to="/login">Log in</Link>
        <Link to="/signup">Sign up</Link>
        <Link to="/admin"> Admin </Link>
    </div>
</div>)
:
(<div className={extra_classes ? "header" + extra_classes : "header"}>
    <Link to="/">
        <div id="topic-header-home-button">
            Home
        </div>
    </Link>
    <div className="header-title">
        {alt_title ? alt_title : "What Floats Your Vote"}
    </div>
    
    {!logged_in ?
        <div className="header-right">
            <Link to="/login">Log in</Link>
            <Link to="/signup">Sign up</Link>
        </div>
        : null 
    }
</div>)

Header.propTypes = {
    home: PropTypes.bool.isRequired
};

export default Header;