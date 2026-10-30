import { Link } from "react-router-dom";
import Button from "../components/Button";
import { statusClass, statusStep, TOTAL_STEPS } from "../data/formatters";
import { STATUS_LABELS, TERMS } from "../data/glossary";
import type { ServiceRequest } from "../types";

type HomePageProps = {
    requests: ServiceRequest[];
};

const quickActions = [
    {
        icon: "exclamation-triangle",
        title: "Algo no funciona",
        description:
            "Cuéntanos qué falla: el WiFi, un equipo, una plataforma, una sala o un baño.",
        to: "/solicitudes/nueva",
    },
    {
        icon: "clipboard-plus",
        title: "Necesito un acceso o servicio",
        description:
            "Pide un permiso, una cuenta o la instalación de un programa.",
        to: "/solicitudes/nueva",
    },
    {
        icon: "search",
        title: "Buscar una solución",
        description: "Encuentra respuestas rápidas a problemas frecuentes.",
        to: "/ayuda",
    },
];

// Resume la actividad y ofrece accesos rápidos para las tareas más comunes.
function HomePage({ requests }: HomePageProps) {
    const activeRequests = requests.filter(
        (request) => request.status !== "Resuelta",
    );
    const latestRequest = requests[0];
    const currentStep = latestRequest ? statusStep(latestRequest.status) : 0;
    const stepText = latestRequest
        ? `Paso ${currentStep} de ${TOTAL_STEPS}: ${STATUS_LABELS[latestRequest.status]}`
        : "";

    return (
        <main className="container page-content">
            <section className="hero-panel row g-0 align-items-stretch">
                <div className="col-lg-8 hero-copy">
                    <span className="eyebrow">AYUDA USM</span>
                    <h1>¿En qué podemos ayudarte hoy?</h1>
                    <p>
                        Cuéntanos qué pasa o qué necesitas. Te guiaremos paso a
                        paso y podrás seguir tu solicitud hasta que esté
                        resuelta.
                    </p>
                    <div className="d-flex flex-wrap gap-2 mt-4">
                        <Button
                            iconStart="plus-lg"
                            onDark
                            size="lg"
                            to="/solicitudes/nueva"
                        >
                            {TERMS.newRequest}
                        </Button>
                        <Button
                            onDark
                            size="lg"
                            to="/solicitudes"
                            variant="secondary"
                        >
                            {TERMS.viewMyRequests}
                        </Button>
                    </div>
                </div>
                <div className="col-lg-4 hero-activity">
                    <div className="activity-topline">
                        <div>
                            <span className="small-label">Tu actividad</span>
                            <div className="activity-number">
                                {activeRequests.length}
                            </div>
                            <span>
                                {activeRequests.length === 1
                                    ? "solicitud activa"
                                    : "solicitudes activas"}
                            </span>
                        </div>
                        <span
                            className={
                                latestRequest
                                    ? statusClass(latestRequest.status)
                                    : "status-pill"
                            }
                        >
                            {latestRequest
                                ? STATUS_LABELS[latestRequest.status]
                                : "Sin solicitudes"}
                        </span>
                    </div>
                    <p>
                        {latestRequest
                            ? `Tu solicitud más reciente fue actualizada ${latestRequest.updatedLabel.toLowerCase()}.`
                            : "Aún no tienes solicitudes. Puedes crear una cuando lo necesites."}
                    </p>
                    {latestRequest && (
                        <div className="activity-progress">
                            <div className="activity-progress-label">
                                <span>Avance de tu última solicitud</span>
                                <span>
                                    Paso {currentStep} de {TOTAL_STEPS}
                                </span>
                            </div>
                            <div
                                aria-label="Avance de tu última solicitud"
                                aria-valuemax={TOTAL_STEPS}
                                aria-valuemin={1}
                                aria-valuenow={currentStep}
                                aria-valuetext={stepText}
                                className="progress"
                                role="progressbar"
                            >
                                <div
                                    className="progress-bar"
                                    style={{
                                        width: `${(currentStep / TOTAL_STEPS) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>
                    )}
                    {latestRequest && (
                        <Button
                            className="activity-link"
                            iconEnd="arrow-right"
                            to={`/solicitudes/${latestRequest.id}`}
                            variant="tertiary"
                        >
                            Ver detalle
                        </Button>
                    )}
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
                            <Link className="quick-card" to={action.to}>
                                <span className="quick-icon">
                                    <i
                                        className={`bi bi-${action.icon}`}
                                        aria-hidden="true"
                                    />
                                </span>
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
                    <Button
                        iconEnd="arrow-right"
                        to="/solicitudes"
                        variant="tertiary"
                    >
                        Ver todas
                    </Button>
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
                                {STATUS_LABELS[request.status]}
                            </span>
                            <i
                                className="bi bi-chevron-right recent-chevron"
                                aria-hidden="true"
                            />
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
