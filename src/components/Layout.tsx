import { useEffect, useState } from "react";
import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from "react-router-dom";
import HomePage from "../pages/HomePage";
import NewRequestPage from "../pages/NewRequestPage";
import RequestDetailPage from "../pages/RequestDetailPage";
import RequestsPage from "../pages/RequestsPage";
import { initialRequests } from "../data/requests";
import type { RequestDraft, ServiceRequest } from "../types";
import HelpPage from "../pages/HelpPage";
import Header from "./Header";

const STORAGE_KEY = "mesa-servicios-requests";

// Comprueba que los datos guardados tengan la estructura mínima esperada antes de usarlos.
function isServiceRequest(value: unknown): value is ServiceRequest {
    if (typeof value !== "object" || value === null) return false;
    const request = value as Partial<ServiceRequest>;
    return (
        typeof request.id === "string" &&
        typeof request.title === "string" &&
        typeof request.area === "string" &&
        Array.isArray(request.messages)
    );
}

// Recupera las solicitudes guardadas; si es la primera visita, usa las solicitudes de muestra.
function loadRequests(): ServiceRequest[] {
    try {
        const storedRequests = localStorage.getItem(STORAGE_KEY);
        if (!storedRequests) return initialRequests;

        const parsedRequests: unknown = JSON.parse(storedRequests);
        if (
            Array.isArray(parsedRequests) &&
            parsedRequests.every(isServiceRequest)
        ) {
            return parsedRequests;
        }
        console.error("Las solicitudes guardadas no tienen un formato válido.");
    } catch (error) {
        console.error("No se pudieron cargar las solicitudes guardadas.", error);
    }

    return initialRequests;
}

// Comparte el listado entre páginas y mantiene los cambios al recargar el navegador.
function MesaServicios() {
    const [requests, setRequests] = useState<ServiceRequest[]>(loadRequests);
    const [isAdministrative, setIsAdministrative] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
        } catch (error) {
            console.error("No se pudieron guardar las solicitudes.", error);
        }
    }, [requests]);

    // Convierte el formulario confirmado en una nueva solicitud y abre su seguimiento.
    function createRequest(draft: RequestDraft) {
        let nextNumber = Number(String(Date.now()).slice(-4));
        while (requests.some((request) => request.id === `USM-${nextNumber}`)) {
            nextNumber = (nextNumber + 1) % 10_000;
        }
        const request: ServiceRequest = {
            ...draft,
            id: `USM-${String(nextNumber).padStart(4, "0")}`,
            createdAt: new Date().toISOString(),
            status: "En curso",
            responsible: "Equipo de Soporte TI",
            updatedLabel: "Ahora",
            messages: [],
        };
        setRequests((currentRequests) => [request, ...currentRequests]);
        return request.id;
    }

    // Agrega la respuesta enviada a la conversación visible de la solicitud.
    function sendMessage(requestId: string, content: string) {
        const message = {
            id: `m-${Date.now()}`,
            author: "Tú",
            role: "Tú" as const,
            content,
            sentAt: new Intl.DateTimeFormat("es-CL", {
                hour: "2-digit",
                minute: "2-digit",
            }).format(new Date()),
        };
        setRequests((currentRequests) =>
            currentRequests.map((request) =>
                request.id === requestId
                    ? {
                          ...request,
                          updatedLabel: "Ahora",
                          messages: [...request.messages, message],
                      }
                    : request,
            ),
        );
    }

    return (
        <BrowserRouter>
            <div className="app-shell">
                <Header
                    isAdministrative={isAdministrative}
                    onChangeView={setIsAdministrative}
                />
                <Routes>
                    <Route
                        path="/"
                        element={<HomePage requests={requests} />}
                    />
                    <Route
                        path="/solicitudes"
                        element={<RequestsPage requests={requests} />}
                    />
                    <Route path="/ayuda" element={<HelpPage />} />
                    <Route
                        path="/solicitudes/nueva"
                        element={<NewRequestPage onCreate={createRequest} />}
                    />
                    <Route
                        path="/solicitudes/:requestId"
                        element={
                            <RequestDetailPage
                                requests={requests}
                                onSendMessage={sendMessage}
                            />
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <footer className="app-footer">
                    <div className="container">
                        Mesa de Servicios · Universidad Técnica Federico Santa
                        María
                    </div>
                </footer>
            </div>
        </BrowserRouter>
    );
}

// Mantiene el nombre del componente de entrada usado por App.tsx.
function Layout() {
    return <MesaServicios />;
}

export default Layout;
