import { format } from "date-fns";
import { uk } from "date-fns/locale";

export const formatDateLocalized = (isoDateStr) => {
  if (!isoDateStr) return "—";
  const date = new Date(isoDateStr);
  return format(date, "d MMMM yyyy, HH:mm", { locale: uk }) + " (за вашим часом)";
};
