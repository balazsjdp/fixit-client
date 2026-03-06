import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MyOfferCard } from "./my-offer-card";
import { MyOffer } from "@/types/offer";
import { Category } from "@/types/category";

const category: Category = { id: "1", label: "Vízvezeték-szerelés", icon: "wrench" };

const baseOffer: MyOffer = {
  id: 1,
  reportId: 5,
  categoryId: 1,
  shortDescription: "Csöpög a konyhai csap",
  description: "Csöpög a konyhai csap részletesen",
  urgency: 50,
  estimatedPrice: 25000,
  travelFee: 3000,
  status: "pending",
  createdAt: "2026-03-05T10:00:00Z",
};

describe("MyOfferCard", () => {
  it("renders category label and description", () => {
    render(<MyOfferCard offer={baseOffer} category={category} />);
    expect(screen.getByText("Vízvezeték-szerelés")).toBeInTheDocument();
    expect(screen.getByText("Csöpög a konyhai csap")).toBeInTheDocument();
  });

  it("renders estimated price and travel fee", () => {
    render(<MyOfferCard offer={baseOffer} category={category} />);
    expect(screen.getByText(/25/)).toBeInTheDocument();
    expect(screen.getByText(/3/)).toBeInTheDocument();
  });

  it("shows 'Függőben' badge for pending status", () => {
    render(<MyOfferCard offer={baseOffer} category={category} />);
    expect(screen.getByText("Függőben")).toBeInTheDocument();
  });

  it("shows 'Elfogadott' badge for accepted status", () => {
    render(<MyOfferCard offer={{ ...baseOffer, status: "accepted" }} category={category} />);
    expect(screen.getByText("Elfogadott")).toBeInTheDocument();
  });

  it("shows 'Elutasított' badge for rejected status", () => {
    render(<MyOfferCard offer={{ ...baseOffer, status: "rejected" }} category={category} />);
    expect(screen.getByText("Elutasított")).toBeInTheDocument();
  });

  it("does not show address for pending offer", () => {
    render(<MyOfferCard offer={baseOffer} category={category} />);
    expect(screen.queryByTestId("accepted-address")).not.toBeInTheDocument();
  });

  it("shows address for accepted offer with address", () => {
    const acceptedOffer: MyOffer = {
      ...baseOffer,
      status: "accepted",
      address: {
        postcode: "2085",
        city: "Pilisvörösvár",
        street: "Fő út",
        houseNumber: "12",
      },
    };
    render(<MyOfferCard offer={acceptedOffer} category={category} />);
    expect(screen.getByTestId("accepted-address")).toBeInTheDocument();
    expect(screen.getByText(/Pilisvörösvár/)).toBeInTheDocument();
    expect(screen.getByText(/Fő út/)).toBeInTheDocument();
  });

  it("does not show address section if accepted but no address provided", () => {
    render(
      <MyOfferCard offer={{ ...baseOffer, status: "accepted" }} category={category} />
    );
    expect(screen.queryByTestId("accepted-address")).not.toBeInTheDocument();
  });

  it("shows fallback category label when category is undefined", () => {
    render(<MyOfferCard offer={baseOffer} category={undefined} />);
    expect(screen.getByText("Ismeretlen")).toBeInTheDocument();
  });

  it("does not show travel fee row when travelFee is 0", () => {
    render(<MyOfferCard offer={{ ...baseOffer, travelFee: 0 }} category={category} />);
    expect(screen.queryByText(/Kiszállás/)).not.toBeInTheDocument();
  });
});
