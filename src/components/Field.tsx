import type { ReactNode } from "react";

export type FieldControlProps = {
    id: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
    "aria-required"?: boolean;
};

type FieldProps = {
    id: string;
    label: string;
    hint?: ReactNode;
    error?: string;
    optional?: boolean;
    children: (controlProps: FieldControlProps) => ReactNode;
};

function Field({ id, label, hint, error, optional = false, children }: FieldProps) {
    const hintId = `${id}-hint`;
    const errorId = `${id}-error`;
    const describedBy =
        [hint ? hintId : "", error ? errorId : ""].filter(Boolean).join(" ") ||
        undefined;

    return (
        <div className={`field${error ? " field--invalid" : ""}`}>
            <label className="form-label" htmlFor={id}>
                {label}
                {optional && <span className="field-optional"> (opcional)</span>}
            </label>
            {children({
                id,
                "aria-describedby": describedBy,
                "aria-invalid": error ? true : undefined,
                "aria-required": optional ? undefined : true,
            })}
            {hint && (
                <div className="form-text" id={hintId}>
                    {hint}
                </div>
            )}
            {error && (
                <div className="field-error" id={errorId}>
                    <i className="bi bi-exclamation-circle" aria-hidden="true" />
                    {error}
                </div>
            )}
        </div>
    );
}

export default Field;
