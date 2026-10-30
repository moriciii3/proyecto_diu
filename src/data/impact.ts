export const IMPACT_VALUES = [
    "Puedo continuar con mis actividades",
    "Me impide realizar una actividad",
    "Afecta una evaluación o plazo hoy",
    "Existe un riesgo para personas o instalaciones",
] as const;

export type ImpactValue = (typeof IMPACT_VALUES)[number];

export type ImpactAnswers = {
    canContinue: "" | "si" | "no";
    scope: "" | "solo-yo" | "grupo" | "edificio";
    dueToday: "" | "si" | "no";
    safetyRisk: "" | "si" | "no";
};

export type ImpactQuestionKey = keyof ImpactAnswers;

export const emptyImpactAnswers: ImpactAnswers = {
    canContinue: "",
    scope: "",
    dueToday: "",
    safetyRisk: "",
};

type ImpactQuestion = {
    key: ImpactQuestionKey;
    legend: string;
    reviewLabel: string;
    hint?: string;
    options: { value: string; label: string }[];
};

export const impactQuestions: ImpactQuestion[] = [
    {
        key: "canContinue",
        legend: "¿Puedes seguir con lo que estabas haciendo?",
        reviewLabel: "¿Puedes seguir?",
        options: [
            { value: "si", label: "Sí, aunque con molestias" },
            { value: "no", label: "No, me impide hacer una actividad" },
        ],
    },
    {
        key: "scope",
        legend: "¿A cuántas personas afecta?",
        reviewLabel: "Afecta a",
        options: [
            { value: "solo-yo", label: "Solo a mí" },
            { value: "grupo", label: "A un grupo, curso u oficina" },
            { value: "edificio", label: "A todo un edificio, sede o servicio" },
        ],
    },
    {
        key: "dueToday",
        legend: "¿Afecta una clase, evaluación o entrega de hoy?",
        reviewLabel: "Clase, evaluación o entrega hoy",
        options: [
            { value: "no", label: "No" },
            { value: "si", label: "Sí" },
        ],
    },
    {
        key: "safetyRisk",
        legend: "¿Hay riesgo para la seguridad de alguien?",
        reviewLabel: "Riesgo para la seguridad",
        hint: "Por ejemplo: cables expuestos, una fuga de agua o gas, o algo que se pueda caer.",
        options: [
            { value: "no", label: "No" },
            { value: "si", label: "Sí" },
        ],
    },
];

export function isImpactQuestionAnswered(
    answers: ImpactAnswers,
    key: ImpactQuestionKey,
): boolean {
    return answers[key] !== "";
}

export function toImpactValue(answers: ImpactAnswers): ImpactValue {
    if (answers.safetyRisk === "si") return IMPACT_VALUES[3];
    if (answers.dueToday === "si") return IMPACT_VALUES[2];
    if (
        answers.canContinue === "no" ||
        answers.scope === "grupo" ||
        answers.scope === "edificio"
    ) {
        return IMPACT_VALUES[1];
    }
    return IMPACT_VALUES[0];
}

export function describeImpact(
    answers: ImpactAnswers,
): { label: string; value: string }[] {
    return impactQuestions.map((question) => ({
        label: question.reviewLabel,
        value:
            question.options.find(
                (option) => option.value === answers[question.key],
            )?.label ?? "Sin responder",
    }));
}
