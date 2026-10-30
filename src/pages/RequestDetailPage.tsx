import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import Button from "../components/Button";
import { formatDate, STATUS_ORDER, statusClass } from "../data/formatters";
import { STATUS_LABELS, TERMS } from "../data/glossary";
import type { RequestStatus, ServiceRequest } from "../types";

// Textos de cada paso del seguimiento, nombrados igual que los estados.
const timelineDescriptions: Record<
    RequestStatus,
    { complete: string; pending: string }
> = {
    "En curso": {
        complete: "El equipo comenzó a trabajar en tu solicitud.",
        pending: "El equipo comenzará a trabajar en tu solicitud.",
    },
    "En investigación": {
        complete: "El equipo investigó la causa del problema.",
        pending: "Si es necesario, el equipo investigará la causa.",
    },
    Resuelta: {
        complete: "Esta solicitud fue resuelta.",
        pending: "Te avisaremos cuando esté resuelta.",
    },
};

type RequestDetailPageProps = {
    requests: ServiceRequest[];
    onSendMessage: (requestId: string, content: string) => void;
};

// Muestra el seguimiento, los datos de la solicitud y su conversación con soporte.
function RequestDetailPage({
    requests,
    onSendMessage,
}: RequestDetailPageProps) {
    const { requestId } = useParams();
    const location = useLocation();
    const request = requests.find((item) => item.id === requestId);
    const [message, setMessage] = useState("");
    const [messageError, setMessageError] = useState("");
    const [showCreatedBanner, setShowCreatedBanner] = useState(
        Boolean((location.state as { created?: boolean } | null)?.created),
    );

    // Evita mensajes vacíos y actualiza la conversación mediante el estado común.
    function handleSendMessage(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const cleanedMessage = message.trim();
        if (!request) return;
        if (!cleanedMessage) {
            setMessageError("Escribe un mensaje antes de enviar.");
            return;
        }
        onSendMessage(request.id, cleanedMessage);
        setMessage("");
        setMessageError("");
    }

    if (!request) return <Navigate to="/solicitudes" replace />;

    const currentStep = STATUS_ORDER.indexOf(request.status);

    return (
        <main className="container page-content">
            <div className="page-back">
                <Button iconStart="arrow-left" to="/solicitudes" variant="tertiary">
                    Volver a mis solicitudes
                </Button>
            </div>
            {showCreatedBanner && (
                <div className="alert alert-success success-banner" role="status">
                    <div>
                        <strong>¡Listo! Recibimos tu solicitud #{request.id}.</strong>
                        <p>
                            Te avisaremos por correo cada vez que avance. Si
                            necesitas agregar algo, escríbele al equipo a cargo
                            en la conversación.
                        </p>
                    </div>
                    <Button
                        aria-label="Cerrar aviso"
                        iconStart="x-lg"
                        onClick={() => setShowCreatedBanner(false)}
                        variant="tertiary"
                    >
                        Cerrar
                    </Button>
                </div>
            )}
            <div className="detail-heading">
                <div>
                    <span className="eyebrow">Solicitud #{request.id}</span>
                    <h1>{request.title}</h1>
                </div>
                <span className={statusClass(request.status)}>
                    {STATUS_LABELS[request.status]}
                </span>
            </div>

            <div className="row g-4 align-items-start">
                <div className="col-lg-8">
                    <section className="card panel-card mb-4">
                        <div className="card-body">
                            <h2 className="panel-title">Seguimiento</h2>
                            <div className="timeline">
                                <div className="timeline-item timeline-item--complete">
                                    <span className="timeline-marker">
                                        <i className="bi bi-check-lg" aria-hidden="true" />
                                    </span>
                                    <div>
                                        <h3>{TERMS.received}</h3>
                                        <p>
                                            {formatDate(request.createdAt)} · Te
                                            enviamos una confirmación por correo.
                                        </p>
                                    </div>
                                </div>
                                {STATUS_ORDER.map((status, index) => {
                                    const isComplete =
                                        index < currentStep ||
                                        (status === "Resuelta" &&
                                            index === currentStep);
                                    const isCurrent =
                                        index === currentStep && !isComplete;
                                    return (
                                        <div
                                            className={`timeline-item${isComplete ? " timeline-item--complete" : ""}${isCurrent ? " timeline-item--current" : ""}`}
                                            key={status}
                                        >
                                            <span className="timeline-marker">
                                                {isComplete ? (
                                                    <i
                                                        className="bi bi-check-lg"
                                                        aria-hidden="true"
                                                    />
                                                ) : (
                                                    index + 2
                                                )}
                                            </span>
                                            <div>
                                                <h3>{STATUS_LABELS[status]}</h3>
                                                <p>
                                                    {isCurrent
                                                        ? `${request.updatedLabel} · ${request.responsible} está revisando tu solicitud.`
                                                        : timelineDescriptions[status][
                                                              isComplete
                                                                  ? "complete"
                                                                  : "pending"
                                                          ]}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    <section className="card panel-card">
                        <div className="card-body">
                            <div className="section-heading conversation-heading">
                                <div>
                                    <h2>Conversación</h2>
                                    <p>
                                        Mantén aquí el contacto con el equipo
                                        responsable.
                                    </p>
                                </div>
                            </div>
                            <div className="conversation-thread" aria-live="polite">
                                {request.messages.map((item) => (
                                    <article
                                        className={`chat-message${item.role === "Tú" ? " chat-message--mine" : ""}`}
                                        key={item.id}
                                    >
                                        {item.role === "Soporte TI" && (
                                            <strong>
                                                {item.author} · {item.role}
                                            </strong>
                                        )}
                                        <p>{item.content}</p>
                                        <span>{item.sentAt}</span>
                                    </article>
                                ))}
                                {request.messages.length === 0 && (
                                    <div className="conversation-empty">
                                        Aún no hay mensajes. Si necesitas
                                        agregar información, puedes escribirle
                                        al equipo a cargo.
                                    </div>
                                )}
                            </div>
                            <form
                                className="message-form"
                                onSubmit={handleSendMessage}
                            >
                                <label
                                    className="visually-hidden"
                                    htmlFor="reply-message"
                                >
                                    Escribe una respuesta
                                </label>
                                <div>
                                    <textarea
                                        aria-describedby={
                                            messageError
                                                ? "reply-message-error"
                                                : undefined
                                        }
                                        aria-invalid={messageError ? true : undefined}
                                        className="form-control"
                                        id="reply-message"
                                        onChange={(event) => {
                                            setMessage(event.target.value);
                                            setMessageError("");
                                        }}
                                        placeholder="Escribe tu mensaje al equipo…"
                                        rows={2}
                                        value={message}
                                    />
                                    {messageError && (
                                        <div
                                            className="field-error"
                                            id="reply-message-error"
                                        >
                                            <i
                                                className="bi bi-exclamation-circle"
                                                aria-hidden="true"
                                            />
                                            {messageError}
                                        </div>
                                    )}
                                </div>
                                <Button iconEnd="send" type="submit">
                                    Enviar
                                </Button>
                            </form>
                        </div>
                    </section>
                </div>

                <aside className="col-lg-4">
                    <section className="card panel-card details-card">
                        <div className="card-body">
                            <h2 className="panel-title">Detalles</h2>
                            <dl className="detail-list">
                                <div>
                                    <dt>Número de solicitud</dt>
                                    <dd>#{request.id}</dd>
                                </div>
                                <div>
                                    <dt>Categoría</dt>
                                    <dd>{request.area}</dd>
                                </div>
                                <div>
                                    <dt>{TERMS.issueType}</dt>
                                    <dd>{request.issueType}</dd>
                                </div>
                                <div>
                                    <dt>Campus o sede</dt>
                                    <dd>{request.campus}</dd>
                                </div>
                                <div>
                                    <dt>{TERMS.received}</dt>
                                    <dd>{formatDate(request.createdAt)}</dd>
                                </div>
                                <div>
                                    <dt>Responsable</dt>
                                    <dd>{request.responsible}</dd>
                                </div>
                                <div>
                                    <dt>Impacto</dt>
                                    <dd>{request.impact}</dd>
                                </div>
                            </dl>
                            <div className="contact-support">
                                <strong>¿Necesitas ayuda?</strong>
                                <p>
                                    Responde en esta conversación y el equipo
                                    recibirá tu mensaje.
                                </p>
                            </div>
                        </div>
                    </section>
                </aside>
            </div>
        </main>
    );
}

export default RequestDetailPage;
