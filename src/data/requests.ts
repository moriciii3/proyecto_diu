import type { ServiceRequest } from "../types";

// Estas solicitudes de ejemplo permiten recorrer la interfaz desde el primer ingreso.
export const initialRequests: ServiceRequest[] = [
    {
        id: "USM-2841",
        title: "No puedo ingresar al correo institucional",
        area: "Correo y cuentas",
        issueType: "Problema de acceso a correo",
        description:
            "Desde esta mañana intento entrar a mi correo USM, pero aparece el mensaje “contraseña incorrecta”. Ya intenté restablecerla una vez.",
        campus: "Casa Central — Valparaíso",
        impact: "Me impide realizar una actividad",
        name: "Catalina Zenteno",
        email: "czenteno@usm.cl",
        role: "Estudiante de pregrado",
        createdAt: "2026-09-01T10:24:00",
        status: "En investigación",
        responsible: "Andrea · Soporte TI",
        updatedLabel: "Hace 2 horas",
        messages: [
            {
                id: "m-1",
                author: "Andrea",
                role: "Soporte TI",
                content:
                    "Hola Catalina, estamos revisando tu cuenta. ¿El mensaje aparece también al ingresar desde un computador?",
                sentAt: "12:12",
            },
            {
                id: "m-2",
                author: "Tú",
                role: "Tú",
                content:
                    "Sí, lo intenté desde mi celular y desde el computador de la biblioteca.",
                sentAt: "12:18",
            },
        ],
    },
    {
        id: "USM-2819",
        title: "Problema de conexión a WiFi en biblioteca",
        area: "Internet y redes",
        issueType: "Problema de conexión WiFi",
        description:
            "La conexión a la red institucional se interrumpe con frecuencia en la biblioteca.",
        campus: "Casa Central — Valparaíso",
        impact: "Puedo continuar con mis actividades",
        name: "Catalina Zenteno",
        email: "czenteno@usm.cl",
        role: "Estudiante de pregrado",
        createdAt: "2026-08-29T09:10:00",
        status: "En curso",
        responsible: "Equipo de Conectividad",
        updatedLabel: "Ayer",
        messages: [],
    },
];
