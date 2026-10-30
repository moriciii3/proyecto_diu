import type { RequestStatus } from "../types";

export const TERMS = {
    newRequest: "Nueva solicitud",
    myRequests: "Mis solicitudes",
    viewMyRequests: "Ver mis solicitudes",
    submitRequest: "Enviar solicitud",
    responsibleTeam: "equipo a cargo",
    received: "Recibida",
    issueType: "Tipo de problema",
    category: "Categoría",
    back: "Atrás",
    next: "Siguiente",
    edit: "Editar",
} as const;

export const STATUS_LABELS: Record<RequestStatus, string> = {
    "En curso": "En curso",
    "En investigación": "En investigación",
    Resuelta: "Resuelta",
};
