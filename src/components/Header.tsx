import { NavLink } from "react-router-dom";
import { TERMS } from "../data/glossary";
import { currentUser } from "../data/session";

type HeaderProps = {
    isAdministrative: boolean;
    onChangeView: (isAdministrative: boolean) => void;
};

// Presenta la marca, navegación y selector de vista en todas las páginas.
//function Header({ isAdministrative, onChangeView }: HeaderProps) {
function Header({ }: HeaderProps) {
    // Resalta el enlace de la sección que está abierta.
    const linkClass = ({ isActive }: { isActive: boolean }) =>
        `header-link${isActive ? " header-link--active" : ""}`;

    return (
        <header className="site-header">
            <div className="container d-flex align-items-center justify-content-between gap-3 flex-wrap">
                <NavLink className="brand-lockup" to="/" aria-label="USM Inicio">
                    <span className="brand-mark"><img src="/logo-usm.png" alt="Escudo de la USM" /></span>
                    <span className="brand-name">Mesa de Servicios</span>
                </NavLink>
                <nav className="site-nav" aria-label="Navegación principal">
                    <NavLink className={linkClass} to="/" end>
                        Inicio
                    </NavLink>
                    <NavLink className={linkClass} to="/solicitudes">
                        {TERMS.myRequests}
                    </NavLink>
                    <NavLink className={linkClass} to="/ayuda">
                        Ayuda
                    </NavLink>
                </nav>
                <div className="d-flex align-items-center gap-3 ms-auto">
                    {/*
                    <div
                        className="view-switch"
                        role="group"
                        aria-label="Vista del prototipo"
                    >
                       <button
                            aria-pressed={!isAdministrative}
                            className={!isAdministrative ? "selected" : ""}
                            onClick={() => onChangeView(false)}
                            type="button"
                        >
                            Estudiante
                        </button>
                        <button
                            aria-pressed={isAdministrative}
                            className={isAdministrative ? "selected" : ""}
                            onClick={() => onChangeView(true)}
                            type="button"
                        >
                            Administrativo
                        </button>
                    </div> */}
                    <span
                        className="user-avatar"
                        role="img"
                        aria-label={`Sesión iniciada como ${currentUser.name}`}
                    >
                        {currentUser.initials}
                    </span>
                </div>
            </div>
        </header>
    );
}

export default Header;
