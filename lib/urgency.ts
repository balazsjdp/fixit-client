const BG_GREEN = "bg-green-500";
const BG_ORANGE = "bg-orange-500";
const BG_REG = "bg-red-500";

const NOT_URGENT = "Ráér";
const MODERATE = "Pár napon belül";
const URGENT = "Sürgős";

export function urgencyLabel(urgency: number) {
  if (urgency === 0) return NOT_URGENT;
  if (urgency === 50) return MODERATE;
  return URGENT;
}

export function urgencyColor(urgency: number) {
  if (urgency < 50) return BG_GREEN;
  if (urgency < 100) return BG_ORANGE;
  return BG_REG;
}
