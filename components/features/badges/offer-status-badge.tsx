import { Badge } from "@/components/ui/badge";
import { OfferStatus } from "@/types/offer";

export function OfferStatusBadge({ status }: { status: OfferStatus }) {
  switch (status) {
    case "accepted":
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0 whitespace-nowrap">
          Elfogadott
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="destructive" className="border-0 whitespace-nowrap">
          Elutasított
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="border-0 whitespace-nowrap">
          Függőben
        </Badge>
      );
  }
}
