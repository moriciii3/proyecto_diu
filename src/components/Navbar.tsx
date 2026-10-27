import { NavLink } from "react-router-dom";

function NavBar() {
    const navLinkClass = ({ isActive }: { isActive: boolean }) => {
        const classes = ["nav-bar__link"];
        if (isActive) classes.push("nav-bar__link--active");
        return classes.join(" ");
    };
    return (
        <nav className="nav-bar">
            <NavLink className={navLinkClass} to="/">
                Inicio
            </NavLink>
            <NavLink className={navLinkClass} to="/lightbulb">
                Ampolleta
            </NavLink>
        </nav>
    );
}

export default NavBar;
