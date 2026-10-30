import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "danger";
type ButtonSize = "md" | "lg";

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
    children: ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    onDark?: boolean;
    iconStart?: string;
    iconEnd?: string;
    to?: string;
};

const variantClasses: Record<ButtonVariant, string> = {
    primary: "btn btn-primary",
    secondary: "btn btn-outline-primary",
    tertiary: "btn-tertiary",
    danger: "btn btn-outline-danger",
};

function Button({
    children,
    variant = "primary",
    size = "md",
    onDark = false,
    iconStart,
    iconEnd,
    to,
    className,
    type = "button",
    ...buttonProps
}: ButtonProps) {
    const classes = [
        variantClasses[variant],
        size === "lg" && variant !== "tertiary" ? "btn-lg" : "",
        onDark ? "btn--on-dark" : "",
        className ?? "",
    ]
        .filter(Boolean)
        .join(" ");

    const content = (
        <>
            {iconStart && <i className={`bi bi-${iconStart}`} aria-hidden="true" />}
            {children}
            {iconEnd && <i className={`bi bi-${iconEnd}`} aria-hidden="true" />}
        </>
    );

    if (to) {
        return (
            <Link className={classes} to={to}>
                {content}
            </Link>
        );
    }

    return (
        <button className={classes} type={type} {...buttonProps}>
            {content}
        </button>
    );
}

export default Button;
