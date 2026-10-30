import { useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "../components/Button";
import Field from "../components/Field";
import { helpAreas } from "../data/areas";
import { TERMS } from "../data/glossary";
import {
    describeImpact,
    emptyImpactAnswers,
    impactQuestions,
    isImpactQuestionAnswered,
    toImpactValue,
    type ImpactAnswers,
    type ImpactQuestionKey,
} from "../data/impact";
import { currentUser } from "../data/session";
import type { RequestDraft } from "../types";

type NewRequestPageProps = {
    onCreate: (draft: RequestDraft) => string;
};

const DRAFT_STORAGE_KEY = "mesa-servicios-draft";
const TITLE_MAX_LENGTH = 100;

const campuses = [
    "Casa Central — Valparaíso",
    "San Joaquín — Santiago",
    "Vitacura — Santiago",
    "Concepción",
];
const roles = [
    "Estudiante de pregrado",
    "Estudiante de postgrado",
    "Docente",
    "Funcionario/a",
    "Otro",
];
const steps = ["Categoría", "Detalles", "Revisar"];

type FieldKey =
    | "area"
    | "issueType"
    | "title"
    | "description"
    | "campus"
    | "location"
    | "attachment"
    | "name"
    | "email"
    | "role"
    | ImpactQuestionKey;

type FieldErrors = Partial<Record<FieldKey, string>>;

type StoredDraft = {
    step: number;
    draft: RequestDraft;
    locationDetail: string;
    answers: ImpactAnswers;
    editingContact: boolean;
};

const emptyDraft: RequestDraft = {
    title: "",
    area: "",
    issueType: "",
    description: "",
    campus: "",
    impact: "",
    name: currentUser.name,
    email: currentUser.email,
    role: currentUser.role,
};

const fieldLabels: Record<Exclude<FieldKey, ImpactQuestionKey>, string> = {
    area: TERMS.category,
    issueType: TERMS.issueType,
    title: "Resumen del problema",
    description: "¿Qué está pasando?",
    campus: "Campus o sede",
    location: "¿Dónde ocurre?",
    attachment: "Foto o captura",
    name: "Nombre completo",
    email: "Correo USM",
    role: "Rol en la universidad",
};

function isImpactKey(key: FieldKey): key is ImpactQuestionKey {
    return impactQuestions.some((question) => question.key === key);
}

function labelFor(key: FieldKey): string {
    if (isImpactKey(key)) {
        return (
            impactQuestions.find((question) => question.key === key)?.legend ??
            key
        );
    }
    return fieldLabels[key];
}

function fieldElementId(key: FieldKey): string {
    if (key === "area") return "area-0";
    if (isImpactKey(key)) return `${key}-0`;
    return key;
}

function focusLater(elementId: string) {
    window.setTimeout(() => document.getElementById(elementId)?.focus(), 0);
}

function draftHasData(
    draft: RequestDraft,
    locationDetail: string,
    answers: ImpactAnswers,
): boolean {
    return Boolean(
        draft.area ||
            draft.title.trim() ||
            draft.description.trim() ||
            locationDetail.trim() ||
            draft.attachment ||
            Object.values(answers).some(Boolean),
    );
}

function loadStoredDraft(): StoredDraft | null {
    try {
        const storedDraft = sessionStorage.getItem(DRAFT_STORAGE_KEY);
        if (!storedDraft) return null;
        const parsedDraft: unknown = JSON.parse(storedDraft);
        if (
            typeof parsedDraft === "object" &&
            parsedDraft !== null &&
            "step" in parsedDraft &&
            "draft" in parsedDraft &&
            "answers" in parsedDraft
        ) {
            return parsedDraft as StoredDraft;
        }
    } catch (error) {
        console.error("No se pudo recuperar el borrador.", error);
    }
    return null;
}

function saveStoredDraft(storedDraft: StoredDraft) {
    try {
        sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(storedDraft));
    } catch (error) {
        console.error("No se pudo guardar el borrador.", error);
    }
}

function clearStoredDraft() {
    try {
        sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (error) {
        console.error("No se pudo borrar el borrador.", error);
    }
}

// Gestiona los tres pasos del formulario y envía la solicitud solo al confirmarla.
function NewRequestPage({ onCreate }: NewRequestPageProps) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [storedDraft] = useState(loadStoredDraft);
    const requestedArea = searchParams.get("area") ?? "";
    const initialArea = helpAreas.some((area) => area.name === requestedArea)
        ? requestedArea
        : "";

    const [step, setStep] = useState(
        storedDraft?.draft.area ? storedDraft.step : 1,
    );
    const [draft, setDraft] = useState<RequestDraft>(
        storedDraft?.draft ?? { ...emptyDraft, area: initialArea },
    );
    const [locationDetail, setLocationDetail] = useState(
        storedDraft?.locationDetail ?? "",
    );
    const [answers, setAnswers] = useState<ImpactAnswers>(
        storedDraft?.answers ?? emptyImpactAnswers,
    );
    const [editingContact, setEditingContact] = useState(
        storedDraft?.editingContact ?? false,
    );
    const [isRestored, setIsRestored] = useState(
        storedDraft
            ? draftHasData(
                  storedDraft.draft,
                  storedDraft.locationDetail,
                  storedDraft.answers,
              )
            : false,
    );
    const [errors, setErrors] = useState<FieldErrors>({});
    const headingRef = useRef<HTMLHeadingElement>(null);
    const attachmentRef = useRef<HTMLInputElement>(null);
    const leaveDialogRef = useRef<HTMLDialogElement>(null);

    const selectedAreaData = helpAreas.find((area) => area.name === draft.area);
    const locationRequired = selectedAreaData?.requiresLocation ?? false;
    const errorKeys = (Object.keys(errors) as FieldKey[]).filter(
        (key) => errors[key],
    );

    function persist(changes: Partial<StoredDraft>) {
        saveStoredDraft({
            step,
            draft,
            locationDetail,
            answers,
            editingContact,
            ...changes,
        });
    }

    function clearError(key: FieldKey) {
        setErrors((currentErrors) => {
            if (!currentErrors[key]) return currentErrors;
            const nextErrors = { ...currentErrors };
            delete nextErrors[key];
            return nextErrors;
        });
    }

    function goToStep(nextStep: number, changes: Partial<StoredDraft> = {}) {
        setStep(nextStep);
        setErrors({});
        persist({ step: nextStep, ...changes });
        window.setTimeout(() => {
            window.scrollTo({ top: 0 });
            headingRef.current?.focus();
        }, 0);
    }

    function changeDraft(nextDraft: RequestDraft) {
        setDraft(nextDraft);
        persist({ draft: nextDraft });
    }

    // Actualiza un campo del formulario sin perder los valores de los otros pasos.
    function updateDraft(
        field: Exclude<keyof RequestDraft, "impact" | "attachment">,
        value: string,
    ) {
        changeDraft({ ...draft, [field]: value });
        clearError(field);
    }

    function selectArea(areaName: string) {
        changeDraft({
            ...draft,
            area: areaName,
            issueType: draft.area === areaName ? draft.issueType : "",
        });
        clearError("area");
    }

    function updateLocation(value: string) {
        setLocationDetail(value);
        persist({ locationDetail: value });
        clearError("location");
    }

    function updateAnswer(key: ImpactQuestionKey, value: string) {
        const nextAnswers = { ...answers, [key]: value } as ImpactAnswers;
        setAnswers(nextAnswers);
        persist({ answers: nextAnswers });
        clearError(key);
    }

    function openContactEditor() {
        setEditingContact(true);
        persist({ editingContact: true });
    }

    function validateStep(currentStep: number): FieldErrors {
        const foundErrors: FieldErrors = {};
        if (currentStep === 1) {
            if (!draft.area) {
                foundErrors.area = "Elige una categoría para continuar.";
            }
            return foundErrors;
        }
        if (!draft.issueType) {
            foundErrors.issueType =
                "Elige el tipo de problema que más se parece al tuyo.";
        }
        if (!draft.title.trim()) {
            foundErrors.title = "Escribe una frase que resuma el problema.";
        }
        if (!draft.description.trim()) {
            foundErrors.description =
                "Cuéntanos qué está pasando para que el equipo pueda ayudarte.";
        }
        if (!draft.campus) {
            foundErrors.campus =
                "Elige el campus o sede donde ocurre el problema.";
        }
        if (locationRequired && !locationDetail.trim()) {
            foundErrors.location = "Indica dónde ocurre: edificio, piso o sala.";
        }
        impactQuestions.forEach((question) => {
            if (!isImpactQuestionAnswered(answers, question.key)) {
                foundErrors[question.key] = "Elige una respuesta.";
            }
        });
        if (!draft.name.trim()) {
            foundErrors.name = "Escribe tu nombre completo.";
        }
        if (!draft.email.trim()) {
            foundErrors.email = "Escribe tu correo USM.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) {
            foundErrors.email =
                "Revisa tu correo: debe tener el formato nombre@usm.cl.";
        }
        if (!draft.role) {
            foundErrors.role = "Elige tu rol en la universidad.";
        }
        return foundErrors;
    }

    // Comprueba los campos obligatorios antes de pasar al siguiente paso.
    function continueToReview() {
        const foundErrors = validateStep(step);
        const foundKeys = Object.keys(foundErrors) as FieldKey[];
        if (foundKeys.length > 0) {
            setErrors(foundErrors);
            if (foundKeys.some((key) => ["name", "email", "role"].includes(key))) {
                openContactEditor();
            }
            focusLater(fieldElementId(foundKeys[0]));
            return;
        }
        goToStep(Math.min(step + 1, 3));
    }

    // Valida el archivo opcional y conserva su nombre para mostrarlo en la revisión.
    function handleAttachment(file: File | undefined) {
        if (!file) return;
        const allowedType = /\.(png|jpe?g|pdf)$/i.test(file.name);
        if (!allowedType) {
            setErrors((currentErrors) => ({
                ...currentErrors,
                attachment: "El archivo debe ser una imagen PNG o JPG, o un PDF.",
            }));
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setErrors((currentErrors) => ({
                ...currentErrors,
                attachment:
                    "El archivo pesa más de 10 MB. Prueba con una captura o una foto más liviana.",
            }));
            return;
        }
        changeDraft({ ...draft, attachment: file.name });
        clearError("attachment");
    }

    function removeAttachment() {
        changeDraft({ ...draft, attachment: undefined });
        if (attachmentRef.current) attachmentRef.current.value = "";
        clearError("attachment");
        focusLater("attachment");
    }

    function startOver() {
        clearStoredDraft();
        setDraft(emptyDraft);
        setLocationDetail("");
        setAnswers(emptyImpactAnswers);
        setEditingContact(false);
        setErrors({});
        setIsRestored(false);
        setStep(1);
        focusLater("area-0");
    }

    function requestLeave() {
        if (!draftHasData(draft, locationDetail, answers)) {
            clearStoredDraft();
            navigate("/");
            return;
        }
        leaveDialogRef.current?.showModal();
    }

    function keepDraftAndLeave() {
        leaveDialogRef.current?.close();
        navigate("/");
    }

    function discardDraftAndLeave() {
        leaveDialogRef.current?.close();
        clearStoredDraft();
        navigate("/");
    }

    // Guarda los datos revisados y navega al seguimiento de la solicitud nueva.
    function submitRequest() {
        const place = locationDetail.trim();
        const description = draft.description.trim();
        const requestId = onCreate({
            ...draft,
            title: draft.title.trim(),
            description: place
                ? `Ubicación: ${place}\n\n${description}`
                : description,
            impact: toImpactValue(answers),
        });
        clearStoredDraft();
        navigate(`/solicitudes/${requestId}`, { state: { created: true } });
    }

    return (
        <main className="container page-content page-content--narrow">
            <div className="page-back">
                <Button iconStart="arrow-left" onClick={requestLeave} variant="tertiary">
                    Volver al inicio
                </Button>
            </div>
            <div className="form-page-heading">
                <div>
                    <span className="eyebrow">NUEVA SOLICITUD</span>
                    <h1>Cuéntanos qué necesitas</h1>
                </div>
                <span className="step-count">Paso {step} de 3</span>
            </div>
            <ol className="stepper" aria-label="Pasos para crear la solicitud">
                {steps.map((label, index) => {
                    const stepNumber = index + 1;
                    const stepClass =
                        stepNumber < step
                            ? "stepper-item stepper-item--complete"
                            : stepNumber === step
                              ? "stepper-item stepper-item--active"
                              : "stepper-item";
                    return (
                        <li
                            aria-current={stepNumber === step ? "step" : undefined}
                            className={stepClass}
                            key={label}
                        >
                            <span aria-hidden="true">
                                {stepNumber < step ? (
                                    <i className="bi bi-check-lg" />
                                ) : (
                                    stepNumber
                                )}
                            </span>
                            {label}
                            {stepNumber < step && (
                                <span className="visually-hidden"> (listo)</span>
                            )}
                        </li>
                    );
                })}
            </ol>

            {isRestored && (
                <div
                    className="alert alert-info d-flex flex-wrap align-items-center justify-content-between gap-2"
                    role="status"
                >
                    Retomamos la solicitud que dejaste a medias.
                    <Button onClick={startOver} variant="tertiary">
                        Empezar de nuevo
                    </Button>
                </div>
            )}

            {errorKeys.length > 1 && (
                <div className="alert alert-danger error-summary" role="alert">
                    <strong>
                        Revisa {errorKeys.length} campos antes de continuar:
                    </strong>
                    <ul>
                        {errorKeys.map((key) => (
                            <li key={key}>
                                <Button
                                    onClick={() =>
                                        document
                                            .getElementById(fieldElementId(key))
                                            ?.focus()
                                    }
                                    variant="tertiary"
                                >
                                    {labelFor(key)}
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {step === 1 && (
                <section className="card panel-card form-panel">
                    <div className="card-body">
                        <h2 ref={headingRef} tabIndex={-1}>
                            Elige la categoría de tu problema
                        </h2>
                        <p className="panel-intro">
                            Agrupamos los temas para que encuentres el tuyo
                            rápido. Si no estás seguro, elige «Otra categoría».
                        </p>
                        <div className="row g-3 category-grid">
                            {helpAreas.map((area, index) => (
                                <div className="col-md-6" key={area.name}>
                                    <button
                                        aria-describedby={
                                            errors.area ? "area-error" : undefined
                                        }
                                        aria-pressed={draft.area === area.name}
                                        className={`area-card${draft.area === area.name ? " area-card--selected" : ""}`}
                                        id={`area-${index}`}
                                        onClick={() => selectArea(area.name)}
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
                        {errors.area && (
                            <div className="field-error" id="area-error">
                                <i className="bi bi-exclamation-circle" aria-hidden="true" />
                                {errors.area}
                            </div>
                        )}
                        <div className="form-step-footer">
                            <span className="helper-text">
                                En el siguiente paso podrás elegir el tipo de
                                problema.
                            </span>
                            <Button iconEnd="arrow-right" onClick={continueToReview}>
                                {TERMS.next}
                            </Button>
                        </div>
                    </div>
                </section>
            )}

            {step === 2 && selectedAreaData && (
                <section className="card panel-card form-panel">
                    <div className="card-body">
                        <h2 ref={headingRef} tabIndex={-1}>
                            Describe el problema
                        </h2>
                        <p className="panel-intro">
                            Mientras más detalles nos des, más rápido podremos
                            ayudarte. Todos los campos son obligatorios, salvo
                            los que dicen «(opcional)».
                        </p>
                        <div className="row g-3">
                            <div className="col-12">
                                <Field
                                    error={errors.issueType}
                                    id="issueType"
                                    label={TERMS.issueType}
                                >
                                    {(controlProps) => (
                                        <select
                                            {...controlProps}
                                            className="form-select"
                                            onChange={(event) =>
                                                updateDraft(
                                                    "issueType",
                                                    event.target.value,
                                                )
                                            }
                                            value={draft.issueType}
                                        >
                                            <option value="">Elige una opción</option>
                                            {selectedAreaData.issues.map((issue) => (
                                                <option key={issue} value={issue}>
                                                    {issue}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </Field>
                                <div className="selection-note">
                                    {TERMS.category}:{" "}
                                    <strong>{draft.area}</strong>.{" "}
                                    <Button
                                        onClick={() => goToStep(1)}
                                        variant="tertiary"
                                    >
                                        Cambiar categoría
                                    </Button>
                                </div>
                            </div>
                            <div className="col-12">
                                <Field
                                    error={errors.title}
                                    hint={
                                        <>
                                            Una frase corta basta.
                                            <span className="field-counter">
                                                {draft.title.length}/{TITLE_MAX_LENGTH}
                                            </span>
                                        </>
                                    }
                                    id="title"
                                    label="Resume el problema en una frase"
                                >
                                    {(controlProps) => (
                                        <input
                                            {...controlProps}
                                            className="form-control"
                                            maxLength={TITLE_MAX_LENGTH}
                                            onChange={(event) =>
                                                updateDraft("title", event.target.value)
                                            }
                                            placeholder={selectedAreaData.titleExample}
                                            value={draft.title}
                                        />
                                    )}
                                </Field>
                            </div>
                            <div className="col-12">
                                <Field
                                    error={errors.description}
                                    hint="Cuéntanos qué pasó, desde cuándo y, si apareció, el mensaje de error. No incluyas contraseñas."
                                    id="description"
                                    label="¿Qué está pasando?"
                                >
                                    {(controlProps) => (
                                        <textarea
                                            {...controlProps}
                                            className="form-control"
                                            onChange={(event) =>
                                                updateDraft(
                                                    "description",
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Ej.: Desde las 10:00 la sala está sin luz y no podemos proyectar."
                                            rows={4}
                                            value={draft.description}
                                        />
                                    )}
                                </Field>
                            </div>
                            <div className="col-md-6">
                                <Field
                                    error={errors.campus}
                                    id="campus"
                                    label="Campus o sede"
                                >
                                    {(controlProps) => (
                                        <select
                                            {...controlProps}
                                            className="form-select"
                                            onChange={(event) =>
                                                updateDraft("campus", event.target.value)
                                            }
                                            value={draft.campus}
                                        >
                                            <option value="">Elige tu campus</option>
                                            {campuses.map((campus) => (
                                                <option key={campus} value={campus}>
                                                    {campus}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </Field>
                            </div>
                            <div className="col-md-6">
                                <Field
                                    error={errors.location}
                                    hint="Mientras más precisa la ubicación, más rápido llegamos."
                                    id="location"
                                    label="¿Dónde ocurre?"
                                    optional={!locationRequired}
                                >
                                    {(controlProps) => (
                                        <input
                                            {...controlProps}
                                            className="form-control"
                                            onChange={(event) =>
                                                updateLocation(event.target.value)
                                            }
                                            placeholder="Ej.: Edificio P, 2.º piso, sala P-201"
                                            value={locationDetail}
                                        />
                                    )}
                                </Field>
                            </div>
                            <div className="col-12">
                                <span
                                    className="form-label d-block"
                                    id="attachment-label"
                                >
                                    Foto o captura
                                    <span className="field-optional"> (opcional)</span>
                                </span>
                                <label className="attachment-box" htmlFor="attachment">
                                    <i className="bi bi-paperclip attachment-symbol" aria-hidden="true" />
                                    <span>
                                        <strong>
                                            {draft.attachment ??
                                                "Toca para adjuntar una foto o captura"}
                                        </strong>
                                        <small id="attachment-hint">
                                            {draft.attachment
                                                ? "Toca para cambiar el archivo · PNG, JPG o PDF, hasta 10 MB"
                                                : "PNG, JPG o PDF, hasta 10 MB"}
                                        </small>
                                    </span>
                                    <input
                                        accept=".png,.jpg,.jpeg,.pdf"
                                        aria-describedby={
                                            errors.attachment
                                                ? "attachment-hint attachment-error"
                                                : "attachment-hint"
                                        }
                                        aria-invalid={errors.attachment ? true : undefined}
                                        aria-labelledby="attachment-label"
                                        className="visually-hidden"
                                        id="attachment"
                                        onChange={(event) =>
                                            handleAttachment(
                                                event.target.files?.[0],
                                            )
                                        }
                                        ref={attachmentRef}
                                        type="file"
                                    />
                                </label>
                                {draft.attachment && (
                                    <Button
                                        iconStart="x-lg"
                                        onClick={removeAttachment}
                                        variant="tertiary"
                                    >
                                        Quitar archivo
                                    </Button>
                                )}
                                {errors.attachment && (
                                    <div className="field-error" id="attachment-error">
                                        <i className="bi bi-exclamation-circle" aria-hidden="true" />
                                        {errors.attachment}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="impact-block">
                            <span className="eyebrow">ALCANCE Y URGENCIA</span>
                            <h2>¿Cómo afecta este problema?</h2>
                            <p className="panel-intro">
                                Estas preguntas nos ayudan a ordenar la atención
                                según cuántas personas se ven afectadas y qué
                                tan urgente es. Responde con lo que está
                                pasando: todas las solicitudes se revisan,
                                aunque el problema te afecte solo a ti.
                            </p>
                            {impactQuestions.map((question) => {
                                const error = errors[question.key];
                                const hintId = `${question.key}-hint`;
                                const errorId = `${question.key}-error`;
                                const describedBy =
                                    [question.hint ? hintId : "", error ? errorId : ""]
                                        .filter(Boolean)
                                        .join(" ") || undefined;
                                return (
                                    <fieldset
                                        aria-describedby={describedBy}
                                        aria-invalid={error ? true : undefined}
                                        className={`choice-group${error ? " choice-group--invalid" : ""}`}
                                        key={question.key}
                                    >
                                        <legend className="form-label">
                                            {question.legend}
                                        </legend>
                                        {question.hint && (
                                            <div className="form-text mb-2" id={hintId}>
                                                {question.hint}
                                            </div>
                                        )}
                                        <div className="choice-options">
                                            {question.options.map((option, index) => (
                                                <label
                                                    className="choice-option"
                                                    key={option.value}
                                                >
                                                    <input
                                                        checked={
                                                            answers[question.key] ===
                                                            option.value
                                                        }
                                                        className="form-check-input"
                                                        id={`${question.key}-${index}`}
                                                        name={question.key}
                                                        onChange={() =>
                                                            updateAnswer(
                                                                question.key,
                                                                option.value,
                                                            )
                                                        }
                                                        required
                                                        type="radio"
                                                        value={option.value}
                                                    />
                                                    {option.label}
                                                </label>
                                            ))}
                                        </div>
                                        {error && (
                                            <div className="field-error" id={errorId}>
                                                <i className="bi bi-exclamation-circle" aria-hidden="true" />
                                                {error}
                                            </div>
                                        )}
                                    </fieldset>
                                );
                            })}
                        </div>

                        <div className="contact-block">
                            <span className="eyebrow">DATOS DE CONTACTO</span>
                            <h2>¿A quién debemos contactar?</h2>
                            {editingContact ? (
                                <>
                                    <p className="panel-intro">
                                        Usaremos estos datos para identificarte
                                        y avisarte cuando la solicitud avance.
                                    </p>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <Field
                                                error={errors.name}
                                                id="name"
                                                label="Nombre completo"
                                            >
                                                {(controlProps) => (
                                                    <input
                                                        {...controlProps}
                                                        autoComplete="name"
                                                        className="form-control"
                                                        onChange={(event) =>
                                                            updateDraft(
                                                                "name",
                                                                event.target.value,
                                                            )
                                                        }
                                                        placeholder="Ej.: Ana Pérez"
                                                        value={draft.name}
                                                    />
                                                )}
                                            </Field>
                                        </div>
                                        <div className="col-md-6">
                                            <Field
                                                error={errors.email}
                                                hint="Aquí te avisaremos cuando la solicitud avance."
                                                id="email"
                                                label="Correo USM"
                                            >
                                                {(controlProps) => (
                                                    <input
                                                        {...controlProps}
                                                        autoComplete="email"
                                                        className="form-control"
                                                        onChange={(event) =>
                                                            updateDraft(
                                                                "email",
                                                                event.target.value,
                                                            )
                                                        }
                                                        placeholder="nombre.apellido@usm.cl"
                                                        type="email"
                                                        value={draft.email}
                                                    />
                                                )}
                                            </Field>
                                        </div>
                                        <div className="col-md-6">
                                            <Field
                                                error={errors.role}
                                                id="role"
                                                label="Tu rol en la universidad"
                                            >
                                                {(controlProps) => (
                                                    <select
                                                        {...controlProps}
                                                        className="form-select"
                                                        onChange={(event) =>
                                                            updateDraft(
                                                                "role",
                                                                event.target.value,
                                                            )
                                                        }
                                                        value={draft.role}
                                                    >
                                                        <option value="">Elige tu rol</option>
                                                        {roles.map((role) => (
                                                            <option key={role} value={role}>
                                                                {role}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}
                                            </Field>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="contact-summary">
                                    <p className="panel-intro">
                                        Usaremos los datos de tu cuenta USM para
                                        avisarte cuando la solicitud avance.
                                    </p>
                                    <dl className="review-details review-details--three">
                                        <div>
                                            <dt>Nombre completo</dt>
                                            <dd>{draft.name}</dd>
                                        </div>
                                        <div>
                                            <dt>Correo USM</dt>
                                            <dd>{draft.email}</dd>
                                        </div>
                                        <div>
                                            <dt>Rol</dt>
                                            <dd>{draft.role}</dd>
                                        </div>
                                    </dl>
                                    <Button
                                        iconStart="pencil"
                                        onClick={() => {
                                            openContactEditor();
                                            focusLater("name");
                                        }}
                                        variant="tertiary"
                                    >
                                        Editar mis datos
                                    </Button>
                                </div>
                            )}
                        </div>
                        <div className="form-step-footer">
                            <Button
                                iconStart="arrow-left"
                                onClick={() => goToStep(1)}
                                variant="secondary"
                            >
                                {TERMS.back}
                            </Button>
                            <Button iconEnd="arrow-right" onClick={continueToReview}>
                                Revisar
                            </Button>
                        </div>
                    </div>
                </section>
            )}

            {step === 3 && (
                <section className="card panel-card form-panel">
                    <div className="card-body">
                        <h2 ref={headingRef} tabIndex={-1}>
                            Revisa antes de enviar
                        </h2>
                        <p className="panel-intro">
                            Confirma que la información y tus datos de contacto
                            estén correctos.
                        </p>
                        <div className="review-card">
                            <div className="review-heading">
                                <div>
                                    <span className="eyebrow">SOLICITUD</span>
                                    <h3>¿La información está correcta?</h3>
                                </div>
                                <Button
                                    aria-label="Editar la información de la solicitud"
                                    iconStart="pencil"
                                    onClick={() => goToStep(2)}
                                    variant="tertiary"
                                >
                                    {TERMS.edit}
                                </Button>
                            </div>
                            <dl className="review-details">
                                <div>
                                    <dt>{TERMS.category}</dt>
                                    <dd>{draft.area}</dd>
                                </div>
                                <div>
                                    <dt>{TERMS.issueType}</dt>
                                    <dd>{draft.issueType}</dd>
                                </div>
                                <div>
                                    <dt>Resumen</dt>
                                    <dd>{draft.title}</dd>
                                </div>
                                <div>
                                    <dt>¿Qué está pasando?</dt>
                                    <dd>{draft.description}</dd>
                                </div>
                                <div>
                                    <dt>Campus o sede</dt>
                                    <dd>{draft.campus}</dd>
                                </div>
                                {locationDetail.trim() && (
                                    <div>
                                        <dt>¿Dónde ocurre?</dt>
                                        <dd>{locationDetail}</dd>
                                    </div>
                                )}
                                {draft.attachment && (
                                    <div>
                                        <dt>Foto o captura</dt>
                                        <dd>{draft.attachment}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                        <div className="review-card">
                            <div className="review-heading">
                                <div>
                                    <span className="eyebrow">ALCANCE Y URGENCIA</span>
                                    <h3>¿Cómo afecta este problema?</h3>
                                </div>
                                <Button
                                    aria-label="Editar el alcance y la urgencia"
                                    iconStart="pencil"
                                    onClick={() => goToStep(2)}
                                    variant="tertiary"
                                >
                                    {TERMS.edit}
                                </Button>
                            </div>
                            <dl className="review-details">
                                {describeImpact(answers).map((item) => (
                                    <div key={item.label}>
                                        <dt>{item.label}</dt>
                                        <dd>{item.value}</dd>
                                    </div>
                                ))}
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
                                <Button
                                    aria-label="Editar los datos de contacto"
                                    iconStart="pencil"
                                    onClick={() => {
                                        setEditingContact(true);
                                        goToStep(2, { editingContact: true });
                                    }}
                                    variant="tertiary"
                                >
                                    {TERMS.edit}
                                </Button>
                            </div>
                            <dl className="review-details review-details--three">
                                <div>
                                    <dt>Nombre completo</dt>
                                    <dd>{draft.name}</dd>
                                </div>
                                <div>
                                    <dt>Correo USM</dt>
                                    <dd>{draft.email}</dd>
                                </div>
                                <div>
                                    <dt>Rol</dt>
                                    <dd>{draft.role}</dd>
                                </div>
                            </dl>
                        </div>
                        <div className="next-steps-note">
                            <strong>¿Qué pasará después?</strong>
                            <p>
                                Recibirás un número de solicitud y te avisaremos
                                por correo cada vez que avance. Desde ella
                                podrás conversar con el equipo a cargo.
                            </p>
                        </div>
                        <div className="form-step-footer">
                            <Button
                                iconStart="arrow-left"
                                onClick={() => goToStep(2)}
                                variant="secondary"
                            >
                                {TERMS.back}
                            </Button>
                            <Button iconEnd="send" onClick={submitRequest}>
                                {TERMS.submitRequest}
                            </Button>
                        </div>
                    </div>
                </section>
            )}

            <dialog
                aria-labelledby="leave-dialog-title"
                className="leave-dialog"
                ref={leaveDialogRef}
            >
                <h2 id="leave-dialog-title">¿Quieres salir?</h2>
                <p>
                    Guardaremos lo que llevas escrito para que puedas retomarlo
                    mientras no cierres esta pestaña. Si prefieres, puedes
                    descartarlo.
                </p>
                <div className="leave-dialog-actions">
                    <Button onClick={() => leaveDialogRef.current?.close()}>
                        Seguir completando
                    </Button>
                    <Button onClick={keepDraftAndLeave} variant="secondary">
                        Guardar y salir
                    </Button>
                    <Button iconStart="trash" onClick={discardDraftAndLeave} variant="danger">
                        Descartar borrador
                    </Button>
                </div>
            </dialog>
        </main>
    );
}

export default NewRequestPage;
