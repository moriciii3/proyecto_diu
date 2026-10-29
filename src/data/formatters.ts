import type { RequestStatus } from "../types";

// Orden único de los estados: lo usan el seguimiento, el progreso y los filtros.
export const STATUS_ORDER: RequestStatus[] = [
    "En curso",
    "En investigación",
    "Resuelta",
];

// Calcula el avance según la posición del estado dentro del flujo.
export function statusProgress(status: RequestStatus): number {
    return Math.round(
        ((STATUS_ORDER.indexOf(status) + 1) / STATUS_ORDER.length) * 100,
    );
}

// Da formato breve a las fechas para que la lista sea fácil de recorrer.
export function formatDate(date: string): string {
    return new Intl.DateTimeFormat("es-CL", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(date));
}

// Traduce el estado de cada solicitud a una clase visual de Bootstrap.
export function statusClass(status: RequestStatus): string {
    if (status === "Resuelta") return "status-pill status-pill--resolved";
    if (status === "En investigación")
        return "status-pill status-pill--investigating";
    return "status-pill status-pill--progress";
}
