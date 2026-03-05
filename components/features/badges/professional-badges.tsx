import { Badge as BadgeType } from "@/types/offer";

export function ProfessionalBadges({ badges }: { badges: BadgeType[] }) {
  if (!badges || badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2" data-testid="badges">
      {badges.map((badge) => (
        <span
          key={badge.id}
          title={badge.description}
          className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full whitespace-nowrap"
        >
          {badge.icon} {badge.name}
        </span>
      ))}
    </div>
  );
}
