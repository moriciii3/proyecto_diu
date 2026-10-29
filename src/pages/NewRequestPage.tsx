import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { helpAreas } from "../data/areas";
import type { RequestDraft } from "../types";

type NewRequestPageProps = {
    onCreate: (draft: RequestDraft) => string;
};

const campuses = [
    "Casa Central — Valparaíso",
    "San Joaquín — Santiago",
    "Vitacura — Santiago",
    "Concepción",
];
const impacts = [
    "Puedo continuar con mis actividades",
    "Me impide realizar una actividad",
    "Afecta una evaluación o plazo hoy",
    "Existe un riesgo para personas o instalaciones",
];
const roles = [
    "Estudiante de pregrado",
    "Estudiante de postgrado",
    "Docente",
    "Funcionario/a",
    "Otro",
];

// Gestiona los tres pasos del formulario y envía la solicitud solo al confirmarla.
function NewRequestPage({ onCreate }: NewRequestPageProps) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const requestedArea = searchParams.get("area") ?? "";
    const [step, setStep] = useState(1);
    const [selectedArea, setSelectedArea] = useState(
        helpAreas.some((area) => area.name === requestedArea)
            ? requestedArea
            : "",
    );
    const [error, setError] = useState("");
    const [draft, setDraft] = useState<RequestDraft>({
        title: "",
        area: requestedArea,
        issueType: "",
        description: "",
        campus: campuses[0],
        impact: impacts[0],
        name: "Catalina Zenteno",
        email: "czenteno@usm.cl",
        role: roles[0],
    });

    const selectedAreaData = helpAreas.find(
        (area) => area.name === selectedArea,
    );

    // Actualiza un campo del formulario sin perder los valores de los otros pasos.
    function updateDraft(field: keyof RequestDraft, value: string) {
        setDraft((currentDraft) => ({ ...currentDraft, [field]: value }));
        setError("");
    }

    // Comprueba los campos obligatorios antes de pasar al siguiente paso.
    function continueToReview() {
        if (step === 1 && !selectedArea) {
            setError("Selecciona la categoría que mejor describe tu solicitud.");
            return;
        }
        if (step === 2) {
            if (!draft.issueType) {
                setError("Selecciona el tipo específico de problema.");
                return;
            }
            if (!draft.title.trim() || !draft.description.trim()) {
                setError("Completa el título y la descripción del problema.");
                return;
            }
            if (!draft.name.trim() || !draft.email.trim()) {
                setError("Completa tus datos de contacto.");
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) {
                setError("Ingresa un correo electrónico válido.");
                return;
            }
        }

        setError("");
        setStep((currentStep) => Math.min(currentStep + 1, 3));
    }

    // Valida el archivo opcional y conserva su nombre para mostrarlo en la revisión.
    function handleAttachment(file: File | undefined) {
        if (!file) return;
        const allowedType = /\.(png|jpe?g|pdf)$/i.test(file.name);
        if (!allowedType) {
            setError("El archivo debe ser PNG, JPG o PDF.");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setError("El archivo no puede superar los 10 MB.");
            return;
        }
        updateDraft("attachment", file.name);
    }

    // Guarda los datos revisados y navega al seguimiento de la solicitud nueva.
    function submitRequest() {
        const requestId = onCreate({ ...draft, area: selectedArea });
        navigate(`/solicitudes/${requestId}`);
    }

    return (
        <main className="container page-content page-content--narrow">
            <Link className="back-link" to="/">
                <i className="bi bi-arrow-left" aria-hidden="true" /> Volver al inicio
            </Link>
            <div className="form-page-heading">
                <div>
                    <span className="eyebrow">NUEVA SOLICITUD</span>
                    <h1>Cuéntanos qué necesitas</h1>
                </div>
                <span className="step-count">Paso {step} de 3</span>
            </div>
            <div className="stepper" aria-label={`Paso ${step} de 3`}>
                {["Categoría", "Detalles", "Revisar"].map(
                    (label, index) => {
                        const stepNumber = index + 1;
                        const stepClass =
                            stepNumber < step
                                ? "stepper-item stepper-item--complete"
                                : stepNumber === step
                                  ? "stepper-item stepper-item--active"
                                  : "stepper-item";
                        return (
                            <div className={stepClass} key={label}>
                                <span>{stepNumber < step ? <i className="bi bi-check-lg" aria-hidden="true" /> : stepNumber}</span>
                                {label}
                            </div>
                        );
                    },
                )}
            </div>

            {step === 1 && (
                <section className="card panel-card form-panel">
                    <div className="card-body">
                        <h2>Selecciona la categoría del problema</h2>
                        <p className="panel-intro">
                            Agrupamos los servicios para que no tengas que
                            buscar en una lista técnica extensa.
                        </p>
                        <div className="row g-3">
                            {helpAreas.map((area) => (
                                <div className="col-md-6" key={area.name}>
                                    <button
                                        aria-pressed={selectedArea === area.name}
                                        className={`area-card${selectedArea === area.name ? " area-card--selected" : ""}`}
                                        onClick={() => {
                                            setSelectedArea(area.name);
                                            updateDraft("area", area.name);
                                            updateDraft("issueType", "");
                                        }}
                                        type="button"
                                    >
                                        <span className="area-icon">
                                            <i className={`bi bi-${area.icon}`} aria-hidden="true" />
                                        </span>
                                        <span>
                                            <strong>{area.name}</strong>
                                            <small>{area.description}</small>
                                        </span>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="form-step-footer">
                            <span className="helper-text">
                                En el siguiente paso podrás especificar el tipo
                                de problema.
                            </span>
                            <button
                                className="btn btn-primary"
                                onClick={continueToReview}
                                type="button"
                            >
                                Continuar <i className="bi bi-arrow-right" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {step === 2 && selectedAreaData && (
                <section className="card panel-card form-panel">
                    <div className="card-body">
                        <h2>Describe el problema</h2>
                        <p className="panel-intro">
                            Mientras más claro seas, más rápido podremos
                            ayudarte.
                        </p>
                        <div className="row g-3">
                            <div className="col-12">
                                <label className="form-label" htmlFor="issue-type">
                                    Tipo específico de problema
                                </label>
                                <select
                                    className="form-select"
                                    id="issue-type"
                                    onChange={(event) =>
                                        updateDraft(
                                            "issueType",
                                            event.target.value,
                                        )
                                    }
                                    value={draft.issueType}
                                >
                                    <option value="">Selecciona una opción</option>
                                    {selectedAreaData.issues.map((issue) => (
                                        <option key={issue}>{issue}</option>
                                    ))}
                                </select>
                                <div className="selection-note">
                                    Categoría seleccionada:{" "}
                                    <strong>{selectedArea}</strong>.{" "}
                                    <button
                                        className="inline-button"
                                        onClick={() => setStep(1)}
                                        type="button"
                                    >
                                        Cambiar categoría
                                    </button>
                                </div>
                            </div>
                            <div className="col-12">
                                <label className="form-label" htmlFor="title">
                                    Título breve
                                </label>
                                <input
                                    className="form-control"
                                    id="title"
                                    maxLength={100}
                                    onChange={(event) =>
                                        updateDraft("title", event.target.value)
                                    }
                                    placeholder="Ej.: No puedo ingresar al correo institucional"
                                    value={draft.title}
                                />
                                <div className="form-text">
                                    Resume el problema en una frase.
                                </div>
                            </div>
                            <div className="col-12">
                                <label
                                    className="form-label"
                                    htmlFor="description"
                                >
                                    ¿Qué ocurrió?
                                </label>
                                <textarea
                                    className="form-control"
                                    id="description"
                                    onChange={(event) =>
                                        updateDraft(
                                            "description",
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Cuéntanos qué estabas intentando hacer, qué ocurrió y si apareció algún mensaje de error."
                                    rows={4}
                                    value={draft.description}
                                />
                                <div className="form-text">
                                    No incluyas contraseñas ni información
                                    confidencial.
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label" htmlFor="campus">
                                    Campus o sede
                                </label>
                                <select
                                    className="form-select"
                                    id="campus"
                                    onChange={(event) =>
                                        updateDraft("campus", event.target.value)
                                    }
                                    value={draft.campus}
                                >
                                    {campuses.map((campus) => (
                                        <option key={campus}>{campus}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label" htmlFor="impact">
                                    Impacto: ¿cuánto te afecta?
                                </label>
                                <select
                                    className="form-select"
                                    id="impact"
                                    onChange={(event) =>
                                        updateDraft("impact", event.target.value)
                                    }
                                    value={draft.impact}
                                >
                                    {impacts.map((impact) => (
                                        <option key={impact}>{impact}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-12">
                                <label
                                    className="form-label"
                                    htmlFor="attachment"
                                >
                                    Evidencia (opcional)
                                </label>
                                <label className="attachment-box" htmlFor="attachment">
                                    <i className="bi bi-paperclip attachment-symbol" aria-hidden="true" />
                                    <span>
                                        <strong>
                                            {draft.attachment ??
                                                "Arrastra una captura aquí o presiona para buscar"}
                                        </strong>
                                        <small>PNG, JPG o PDF · Máximo 10 MB</small>
                                    </span>
                                    <input
                                        accept=".png,.jpg,.jpeg,.pdf"
                                        className="visually-hidden"
                                        id="attachment"
                                        onChange={(event) =>
                                            handleAttachment(
                                                event.target.files?.[0],
                                            )
                                        }
                                        type="file"
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="contact-block">
                            <span className="eyebrow">DATOS DE CONTACTO</span>
                            <h2>¿A quién debemos contactar?</h2>
                            <p className="panel-intro">
                                Usaremos estos datos para identificarte y
                                avisarte sobre el avance de la solicitud.
                            </p>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label" htmlFor="name">
                                        Nombre completo
                                    </label>
                                    <input
                                        className="form-control"
                                        id="name"
                                        onChange={(event) =>
                                            updateDraft(
                                                "name",
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Ej.: Catalina Zenteno"
                                        value={draft.name}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label" htmlFor="email">
                                        Correo institucional
                                    </label>
                                    <input
                                        className="form-control"
                                        id="email"
                                        onChange={(event) =>
                                            updateDraft(
                                                "email",
                                                event.target.value,
                                            )
                                        }
                                        placeholder="nombre@usm.cl"
                                        type="email"
                                        value={draft.email}
                                    />
                                    <div className="form-text">
                                        Aquí recibirás las notificaciones de la
                                        solicitud.
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label" htmlFor="role">
                                        Rol en la universidad
                                    </label>
                                    <select
                                        className="form-select"
                                        id="role"
                                        onChange={(event) =>
                                            updateDraft("role", event.target.value)
                                        }
                                        value={draft.role}
                                    >
                                        {roles.map((role) => (
                                            <option key={role}>{role}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="form-step-footer">
                            <button
                                className="btn btn-outline-primary"
                                onClick={() => setStep(1)}
                                type="button"
                            >
                                <i className="bi bi-arrow-left" aria-hidden="true" /> Volver
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={continueToReview}
                                type="button"
                            >
                                Revisar solicitud <i className="bi bi-arrow-right" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {step === 3 && (
                <section className="card panel-card form-panel">
                    <div className="card-body">
                        <h2>Revisa antes de enviar</h2>
                        <p className="panel-intro">
                            Confirma que tanto la solicitud como tus datos
                            de contacto estén correctos.
                        </p>
                        <div className="review-card">
                            <div className="review-heading">
                                <div>
                                    <span className="eyebrow">SOLICITUD</span>
                                    <h3>¿La información está correcta?</h3>
                                </div>
                                <button
                                    className="inline-button"
                                    onClick={() => setStep(2)}
                                    type="button"
                                >
                                    Editar solicitud
                                </button>
                            </div>
                            <dl className="review-details">
                                <div>
                                    <dt>Categoría</dt>
                                    <dd>{selectedArea}</dd>
                                </div>
                                <div>
                                    <dt>Tipo específico</dt>
                                    <dd>{draft.issueType}</dd>
                                </div>
                                <div>
                                    <dt>Título</dt>
                                    <dd>{draft.title}</dd>
                                </div>
                                <div>
                                    <dt>Descripción</dt>
                                    <dd>{draft.description}</dd>
                                </div>
                                <div>
                                    <dt>Campus o sede · Impacto</dt>
                                    <dd>
                                        {draft.campus} · {draft.impact}
                                    </dd>
                                </div>
                                {draft.attachment && (
                                    <div>
                                        <dt>Evidencia</dt>
                                        <dd>{draft.attachment}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                        <div className="review-card">
                            <div className="review-heading">
                                <div>
                                    <span className="eyebrow">
                                        DATOS DE CONTACTO
                                    </span>
                                    <h3>¿Estos datos están correctos?</h3>
                                </div>
                                <button
                                    className="inline-button"
                                    onClick={() => setStep(2)}
                                    type="button"
                                >
                                    Editar datos
                                </button>
                            </div>
                            <dl className="review-details review-details--three">
                                <div>
                                    <dt>Nombre completo</dt>
                                    <dd>{draft.name}</dd>
                                </div>
                                <div>
                                    <dt>Correo institucional</dt>
                                    <dd>{draft.email}</dd>
                                </div>
                                <div>
                                    <dt>Rol</dt>
                                    <dd>{draft.role}</dd>
                                </div>
                            </dl>
                            <div className="confirmation-note">
                                <i className="bi bi-check-circle" aria-hidden="true" /> Confirma que estos datos son correctos antes
                                de enviar.
                            </div>
                        </div>
                        <div className="next-steps-note">
                            <strong>¿Qué pasará después?</strong>
                            <p>
                                Recibirás un número de solicitud y te
                                avisaremos cada vez que la solicitud avance. Podrás
                                conversar con soporte desde ella.
                            </p>
                        </div>
                        <div className="form-step-footer">
                            <button
                                className="btn btn-outline-primary"
                                onClick={() => setStep(2)}
                                type="button"
                            >
                                <i className="bi bi-arrow-left" aria-hidden="true" /> Volver
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={submitRequest}
                                type="button"
                            >
                                Confirmar y enviar solicitud
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {error && (
                <div className="alert alert-danger mt-3" role="alert">
                    {error}
                </div>
            )}
        </main>
    );
}

export default NewRequestPage;
