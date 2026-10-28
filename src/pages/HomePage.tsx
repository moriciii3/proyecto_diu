import { Link } from "react-router-dom";
import { statusClass } from "../data/formatters";
import type { ServiceRequest } from "../types";

type HomePageProps = {
    requests: ServiceRequest[];
};

// Resume la actividad y ofrece accesos rápidos para las tareas más comunes.
function HomePage({ requests }: HomePageProps) {
    const activeRequests = requests.filter(
        (request) => request.status !== "Resuelta",
    );
    const latestRequest = requests[0];
    const progressPercent =
        latestRequest?.status === "Resuelta"
            ? 100
            : latestRequest?.status === "En investigación"
              ? 66
              : latestRequest
                ? 38
                : 0;
    const quickActions = [
        {
            icon: "⌁",
            title: "Reportar un problema",
            description: "Algo dejó de funcionar o necesitas asistencia técnica.",
            area: "Internet y redes",
        },
        {
            icon: "＋",
            title: "Realizar una solicitud",
            description: "Pide acceso, una cuenta o un servicio institucional.",
            area: "Accesos y permisos",
        },
        {
            icon: "◇",
            title: "Buscar una solución",
            description: "Encuentra respuestas rápidas a problemas frecuentes.",
            area: "",
        },
    ];

    return (
        <main className="container page-content">
            <section className="hero-panel row g-0 align-items-stretch">
                <div className="col-lg-8 hero-copy">
                    <span className="eyebrow">MESA DE SERVICIOS 360°</span>
                    <h1>¿En qué podemos ayudarte hoy?</h1>
                    <p>
                        Reporta un problema o realiza una solicitud. Te
                        guiaremos paso a paso y podrás seguir todo el proceso.
                    </p>
                    <div className="d-flex flex-wrap gap-2 mt-4">
                        <Link
                            className="btn btn-primary btn-lg"
                            to="/solicitudes/nueva"
                        >
                            ＋ Crear solicitud
                        </Link>
                        <Link
                            className="btn btn-outline-primary btn-lg"
                            to="/solicitudes"
                        >
                            Ver mis solicitudes
                        </Link>
                    </div>
                </div>
                <div className="col-lg-4 hero-activity">
                    <div className="activity-topline">
                        <div>
                            <span className="small-label">Tu actividad</span>
                            <div className="activity-number">
                                {activeRequests.length}
                            </div>
                            <span>solicitudes activas</span>
                        </div>
                        <span className="status-pill status-pill--progress">
                            {latestRequest?.status ?? "Sin solicitudes"}
                        </span>
                    </div>
                    <p>
                        {latestRequest
                            ? `La solicitud más reciente fue actualizada ${latestRequest.updatedLabel.toLowerCase()}.`
                            : "Aún no tienes solicitudes. Puedes crear una cuando lo necesites."}
                    </p>
                    <div className="activity-progress">
                        <div className="activity-progress-label">
                            <span>Progreso del caso</span>
                            <span>{progressPercent}%</span>
                        </div>
                        <div
                            aria-label={`Progreso de la solicitud: ${progressPercent}%`}
                            aria-valuemax={100}
                            aria-valuemin={0}
                            aria-valuenow={progressPercent}
                            className="progress"
                            role="progressbar"
                        >
                            <div
                                className="progress-bar"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                    <Link
                        className="btn btn-primary activity-link"
                        to="/solicitudes"
                    >
                        Revisar avances <span aria-hidden="true">→</span>
                    </Link>
                </div>
            </section>

            <section className="section-block">
                <div className="section-heading">
                    <div>
                        <h2>Accesos rápidos</h2>
                        <p>Todo lo que necesitas, sin buscar entre menús.</p>
                    </div>
                </div>
                <div className="row g-3">
                    {quickActions.map((action) => (
                        <div className="col-md-4" key={action.title}>
                            <Link
                                className="quick-card"
                                to={
                                    action.title === "Buscar una solución"
                                        ? "/ayuda"
                                        : `/solicitudes/nueva?area=${encodeURIComponent(action.area)}`
                                }
                            >
                                <span className="quick-icon">{action.icon}</span>
                                <h3>{action.title}</h3>
                                <p>{action.description}</p>
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            <section className="section-block">
                <div className="section-heading">
                    <div>
                        <h2>Solicitudes recientes</h2>
                        <p>Revisa el estado y continúa una conversación.</p>
                    </div>
                    <Link className="text-link" to="/solicitudes">
                        Ver todas <span aria-hidden="true">→</span>
                    </Link>
                </div>
                <div className="recent-list">
                    {requests.slice(0, 3).map((request) => (
                        <Link
                            className="recent-request"
                            key={request.id}
                            to={`/solicitudes/${request.id}`}
                        >
                            <span className="request-id">#{request.id}</span>
                            <span className="recent-request-copy">
                                <strong>{request.title}</strong>
                                <span>{request.area}</span>
                            </span>
                            <span className={statusClass(request.status)}>
                                {request.status}
                            </span>
                            <span className="recent-chevron" aria-hidden="true">
                                ›
                            </span>
                        </Link>
                    ))}
                    {requests.length === 0 && (
                        <div className="empty-state">
                            Aún no tienes solicitudes. Crea una para comenzar
                            el seguimiento.
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}

export default HomePage;
