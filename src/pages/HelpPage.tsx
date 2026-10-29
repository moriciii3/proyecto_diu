import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const helpArticles = [
    {
        title: "No puedo ingresar a mi correo institucional",
        category: "Correo y cuentas",
        answer:
            "Verifica que estés usando tu cuenta institucional completa. Si restableciste tu contraseña recientemente, espera unos minutos y vuelve a iniciar sesión. Nunca compartas tu contraseña en una solicitud.",
    },
    {
        title: "¿Cómo conectarme a la red WiFi USM?",
        category: "Internet y redes",
        answer:
            "Selecciona la red institucional disponible en tu campus e inicia sesión con tus credenciales USM. Si la conexión se interrumpe en distintos dispositivos, puedes reportar el sector y el horario.",
    },
    {
        title: "No puedo entrar a Aula Virtual o SIGA",
        category: "Plataformas USM",
        answer:
            "Comprueba si puedes ingresar a otros servicios institucionales. Al solicitar ayuda, indica el nombre de la plataforma, el mensaje de error y la hora aproximada del problema.",
    },
    {
        title: "¿Qué información incluir en una solicitud?",
        category: "Solicitudes",
        answer:
            "Describe qué intentabas hacer, qué ocurrió y dónde. Incluye el mensaje de error si lo hubo, pero no agregues contraseñas ni datos confidenciales.",
    },
];

// Filtra artículos breves de ayuda para orientar antes de crear una solicitud.
function HelpPage() {
    const [search, setSearch] = useState("");
    const filteredArticles = useMemo(
        () =>
            helpArticles.filter((article) =>
                `${article.title} ${article.category} ${article.answer}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
            ),
        [search],
    );

    return (
        <main className="container page-content page-content--narrow">
            <Link className="back-link" to="/">
                <i className="bi bi-arrow-left" aria-hidden="true" /> Volver al inicio
            </Link>
            <div className="page-title-row">
                <div>
                    <span className="eyebrow">CENTRO DE AYUDA</span>
                    <h1>Buscar una solución</h1>
                    <p>
                        Revisa estas respuestas rápidas o cuéntanos qué está
                        pasando.
                    </p>
                </div>
                <Link
                    className="btn btn-primary"
                    to="/solicitudes/nueva"
                >
                    <i className="bi bi-plus-lg" aria-hidden="true" /> Nueva solicitud
                </Link>
            </div>
            <section className="card panel-card">
                <div className="card-body">
                    <label className="form-label" htmlFor="help-search">
                        ¿Qué necesitas resolver?
                    </label>
                    <input
                        className="form-control mb-4"
                        id="help-search"
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Busca por tema o palabra clave"
                        type="search"
                        value={search}
                    />
                    <div className="help-articles">
                        {filteredArticles.map((article) => (
                            <details className="help-article" key={article.title}>
                                <summary>
                                    <span>
                                        <small>{article.category}</small>
                                        <strong>{article.title}</strong>
                                    </span>
                                    <i className="bi bi-plus-lg" aria-hidden="true" />
                                </summary>
                                <p>{article.answer}</p>
                            </details>
                        ))}
                        {filteredArticles.length === 0 && (
                            <div className="empty-state">
                                No encontramos una respuesta con ese texto.
                                Puedes crear una solicitud para recibir ayuda.
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}

export default HelpPage;
