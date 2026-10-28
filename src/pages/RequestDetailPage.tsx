import { useState, type FormEvent } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { formatDate, statusClass } from "../data/formatters";
import type { ServiceRequest } from "../types";

type RequestDetailPageProps = {
    requests: ServiceRequest[];
    onSendMessage: (requestId: string, content: string) => void;
};

// Muestra el seguimiento, los datos del caso y su conversación con soporte.
function RequestDetailPage({
    requests,
    onSendMessage,
}: RequestDetailPageProps) {
    const { requestId } = useParams();
    const request = requests.find((item) => item.id === requestId);
    const [message, setMessage] = useState("");

    // Evita mensajes vacíos y actualiza la conversación mediante el estado común.
    function handleSendMessage(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const cleanedMessage = message.trim();
        if (!request || !cleanedMessage) return;
        onSendMessage(request.id, cleanedMessage);
        setMessage("");
    }

    if (!request) return <Navigate to="/solicitudes" replace />;

    return (
        <main className="container page-content">
            <Link className="back-link" to="/solicitudes">
                ← Volver a mis solicitudes
            </Link>
            <div className="detail-heading">
                <div>
                    <span className="eyebrow">Solicitud #{request.id}</span>
                    <h1>{request.title}</h1>
                </div>
                <span className={statusClass(request.status)}>
                    {request.status}
                </span>
            </div>

            <div className="row g-4 align-items-start">
                <div className="col-lg-8">
                    <section className="card panel-card mb-4">
                        <div className="card-body">
                            <h2 className="panel-title">Seguimiento</h2>
                            <div className="timeline">
                                <div className="timeline-item timeline-item--complete">
                                    <span className="timeline-marker">✓</span>
                                    <div>
                                        <h3>Solicitud recibida</h3>
                                        <p>
                                            {formatDate(request.createdAt)} · Te
                                            enviamos una confirmación por correo.
                                        </p>
                                    </div>
                                </div>
                                <div
                                    className={`timeline-item${request.status !== "En curso" ? " timeline-item--complete" : " timeline-item--current"}`}
                                >
                                    <span className="timeline-marker">
                                        {request.status === "En curso" ? "2" : "✓"}
                                    </span>
                                    <div>
                                        <h3>
                                            {request.status === "En curso"
                                                ? "El equipo está trabajando en tu caso"
                                                : "El equipo está investigando"}
                                        </h3>
                                        <p>
                                            {request.updatedLabel} ·{" "}
                                            {request.responsible} está revisando
                                            tu solicitud.
                                        </p>
                                    </div>
                                </div>
                                <div
                                    className={`timeline-item${request.status === "Resuelta" ? " timeline-item--complete" : ""}`}
                                >
                                    <span className="timeline-marker">
                                        {request.status === "Resuelta" ? "✓" : "3"}
                                    </span>
                                    <div>
                                        <h3>Solución y cierre</h3>
                                        <p>
                                            {request.status === "Resuelta"
                                                ? "Esta solicitud fue resuelta."
                                                : "Te avisaremos cuando esté resuelto."}
                                        </p>
                                    </div>
                                </div>
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
                                        al equipo de soporte.
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
                                <textarea
                                    className="form-control"
                                    id="reply-message"
                                    onChange={(event) =>
                                        setMessage(event.target.value)
                                    }
                                    placeholder="Escribe una respuesta…"
                                    rows={2}
                                    value={message}
                                />
                                <button
                                    className="btn btn-primary"
                                    disabled={!message.trim()}
                                    type="submit"
                                >
                                    Enviar
                                </button>
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
                                    <dt>Tipo específico</dt>
                                    <dd>{request.issueType}</dd>
                                </div>
                                <div>
                                    <dt>Campus</dt>
                                    <dd>{request.campus}</dd>
                                </div>
                                <div>
                                    <dt>Creada</dt>
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
