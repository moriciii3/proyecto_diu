export type RequestStatus = "En investigación" | "En curso" | "Resuelta";

export type RequestMessage = {
    id: string;
    author: string;
    role: "Soporte TI" | "Tú";
    content: string;
    sentAt: string;
};

export type ServiceRequest = {
    id: string;
    title: string;
    area: string;
    issueType: string;
    description: string;
    campus: string;
    impact: string;
    attachment?: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    status: RequestStatus;
    responsible: string;
    updatedLabel: string;
    messages: RequestMessage[];
};

export type RequestDraft = Omit<
    ServiceRequest,
    "id" | "createdAt" | "status" | "responsible" | "updatedLabel" | "messages"
>;
