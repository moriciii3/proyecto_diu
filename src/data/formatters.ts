import type { RequestStatus } from "../types";

// Da formato breve a las fechas para que la lista sea fácil de recorrer.
export function formatDate(date: string): string {
    return new Intl.DateTimeFormat("es-CL", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(date));
}

// Traduce el estado de cada caso a una clase visual de Bootstrap.
export function statusClass(status: RequestStatus): string {
    if (status === "Resuelta") return "status-pill status-pill--resolved";
    if (status === "En investigación")
        return "status-pill status-pill--investigating";
    return "status-pill status-pill--progress";
}
