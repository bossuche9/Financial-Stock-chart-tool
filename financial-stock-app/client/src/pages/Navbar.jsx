import { Link } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
    return (
        <nav>
            <ul>
                <li><Link to = "/">Home(Register)</Link></li>
                <li><Link to = "/login">Login</Link></li>
                <li><Link to = "/watchlist">WatchList</Link></li>
                <li><Link to = "/charts">Stock Search</Link></li>
            </ul>
        </nav>
    )
}

export default Navbar;