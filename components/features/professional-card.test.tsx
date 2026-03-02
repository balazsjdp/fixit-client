import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProfessionalCard } from "./professional-card";
import { Badge } from "@/types/offer";

const baseBadge: Badge = {
  id: 1,
  name: "Megbízható",
  description: "10+ elfogadott ajánlat",
  icon: "🏅",
};

describe("ProfessionalCard – name and rating", () => {
  it("renders the professional name", () => {
    render(
      <ProfessionalCard
        name="Kiss Péter"
        avgRating={4.5}
        ratingCount={10}
        badges={[]}
      />
    );
    expect(screen.getByText("Kiss Péter")).toBeDefined();
  });

  it("renders the average rating formatted to 1 decimal", () => {
    render(
      <ProfessionalCard
        name="Kiss Péter"
        avgRating={4.5}
        ratingCount={10}
        badges={[]}
      />
    );
    expect(screen.getByText("4.5")).toBeDefined();
  });

  it("renders 0.0 when avgRating is 0 (no ratings yet)", () => {
    render(
      <ProfessionalCard
        name="Kiss Péter"
        avgRating={0}
        ratingCount={0}
        badges={[]}
      />
    );
    expect(screen.getByText("0.0")).toBeDefined();
  });

  it("renders 0.0 when avgRating is undefined (fallback for stale API responses)", () => {
    render(
      <ProfessionalCard
        name="Kiss Péter"
        avgRating={undefined as unknown as number}
        ratingCount={0}
        badges={[]}
      />
    );
    expect(screen.getByText("0.0")).toBeDefined();
  });

  it("renders the rating count", () => {
    render(
      <ProfessionalCard
        name="Kiss Péter"
        avgRating={4.5}
        ratingCount={10}
        badges={[]}
      />
    );
    expect(screen.getByText("(10 értékelés)")).toBeDefined();
  });

  it("renders the rating section with data-testid", () => {
    render(
      <ProfessionalCard
        name="Kiss Péter"
        avgRating={3.2}
        ratingCount={5}
        badges={[]}
      />
    );
    expect(screen.getByTestId("rating")).toBeDefined();
  });
});

describe("ProfessionalCard – badges", () => {
  it("does not render badges section when badges is empty", () => {
    render(
      <ProfessionalCard
        name="Kiss Péter"
        avgRating={4.5}
        ratingCount={10}
        badges={[]}
      />
    );
    expect(screen.queryByTestId("badges")).toBeNull();
  });

  it("renders badge name and icon when badges are provided", () => {
    render(
      <ProfessionalCard
        name="Kiss Péter"
        avgRating={4.5}
        ratingCount={10}
        badges={[baseBadge]}
      />
    );
    expect(screen.getByTestId("badges")).toBeDefined();
    expect(screen.getByText(/Megbízható/)).toBeDefined();
  });

  it("renders badge description as title attribute", () => {
    render(
      <ProfessionalCard
        name="Kiss Péter"
        avgRating={4.5}
        ratingCount={10}
        badges={[baseBadge]}
      />
    );
    const badgeEl = screen.getByTitle("10+ elfogadott ajánlat");
    expect(badgeEl).toBeDefined();
  });

  it("renders multiple badges", () => {
    const secondBadge: Badge = {
      id: 2,
      name: "Gyors válasz",
      description: "Átlagos válaszidő < 2 óra",
      icon: "⚡",
    };
    render(
      <ProfessionalCard
        name="Kiss Péter"
        avgRating={4.5}
        ratingCount={10}
        badges={[baseBadge, secondBadge]}
      />
    );
    expect(screen.getByText(/Megbízható/)).toBeDefined();
    expect(screen.getByText(/Gyors válasz/)).toBeDefined();
  });
});
