import { CategorySelector } from "@/components/features/category-selector";

export default function Client() {
  return (
    <main>
      <div className="mb-10">
        <h1 className="text-4xl font-black leading-tight tracking-tight mb-1">
          Hiba bejelentése
        </h1>
        <p className="text-lg text-muted-foreground">
          Írja le a problémát, és mi keresünk Önnek egy közeli szakembert.
        </p>
      </div>

      <div className="mb-10">
        <CategorySelector />
      </div>
    </main>
  );
}
