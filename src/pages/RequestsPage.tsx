import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import { formatDate, STATUS_ORDER, statusClass } from "../data/formatters";
import { STATUS_LABELS, TERMS } from "../data/glossary";
import type { ServiceRequest } from "../types";

type RequestsPageProps = {
    requests: ServiceRequest[];
};

// Permite encontrar solicitudes por texto y filtrarlas por estado.
function RequestsPage({ requests }: RequestsPageProps) {
    const [statusFilter, setStatusFilter] = useState("Todas");
    const [search, setSearch] = useState("");

    const filteredRequests = useMemo(
        () =>
            requests.filter((request) => {
                const matchesStatus =
                    statusFilter === "Todas" ||
                    request.status === statusFilter;
                const searchText =
                    `${request.id} ${request.title} ${request.area}`.toLowerCase();
                return matchesStatus && searchText.includes(search.toLowerCase());
            }),
        [requests, search, statusFilter],
    );

    return (
        <main className="container page-content">
            <div className="page-title-row">
                <div>
                    <span className="eyebrow">SEGUIMIENTO</span>
                    <h1>{TERMS.myRequests}</h1>
                    <p>Consulta el estado de tus solicitudes y conversa con el equipo a cargo.</p>
                </div>
                <Button iconStart="plus-lg" to="/solicitudes/nueva">
                    {TERMS.newRequest}
                </Button>
            </div>

            <section className="card panel-card">
                <div className="card-body">
                    <div className="row g-3 align-items-end mb-4">
                        <div className="col-lg-6">
                            <label className="form-label" htmlFor="request-search">
                                Buscar solicitud
                            </label>
                            <input
                                className="form-control"
                                id="request-search"
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Por número, título o categoría"
                                type="search"
                                value={search}
                            />
                        </div>
                        <div className="col-lg-3">
                            <label className="form-label" htmlFor="status-filter">
                                Estado
                            </label>
                            <select
                                className="form-select"
                                id="status-filter"
                                onChange={(event) =>
                                    setStatusFilter(event.target.value)
                                }
                                value={statusFilter}
                            >
                                <option>Todas</option>
                                {STATUS_ORDER.map((status) => (
                                    <option key={status} value={status}>
                                        {STATUS_LABELS[status]}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-lg-3 filter-count">
                            {filteredRequests.length}{" "}
                            {filteredRequests.length === 1
                                ? "solicitud"
                                : "solicitudes"}
                        </div>
                    </div>
                    <div className="request-table">
                        {filteredRequests.map((request) => (
                            <Link
                                className="request-row"
                                key={request.id}
                                to={`/solicitudes/${request.id}`}
                            >
                                <span className="request-id">#{request.id}</span>
                                <span className="request-row-main">
                                    <strong>{request.title}</strong>
                                    <span>
                                        {request.area} · {TERMS.received} el{" "}
                                        {formatDate(request.createdAt)}
                                    </span>
                                </span>
                                <span className={statusClass(request.status)}>
                                    {STATUS_LABELS[request.status]}
                                </span>
                                <i
                                    className="bi bi-chevron-right row-arrow"
                                    aria-hidden="true"
                                />
                            </Link>
                        ))}
                        {filteredRequests.length === 0 && (
                            <div className="empty-state">
                                No encontramos solicitudes con esos criterios.
                                Prueba otra búsqueda o crea una nueva solicitud.
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}

export default RequestsPage;
