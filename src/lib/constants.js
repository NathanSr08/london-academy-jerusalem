// Shared front-end constants (safe for client components).

export const NEIGHBORHOODS = [
  "Baka",
  "Katamon",
  "German Colony",
  "Arnona",
  "Talbiya",
  "Rehavia",
  "City Center",
  "Old Katamon",
  "Other",
];

export const SUBJECTS = [
  { value: "english", label: "English" },
  { value: "math", label: "Mathematics" },
  { value: "combined", label: "Combined Pack" },
];

export const AGES = [4, 5, 6, 7, 8, 9, 10];

export const FORMATS = [
  { value: "in_person", label: "In-Person / At Home" },
  { value: "online", label: "Online Video / Visio" },
];

export const DAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export function ils(n) {
  const value = Number(n || 0);
  return `${value.toLocaleString("en-IL", { maximumFractionDigits: 2 })} ILS`;
}

export function subjectLabel(v) {
  return SUBJECTS.find((s) => s.value === v)?.label || v;
}

export function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
