import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProReportCard } from "./pro-report-card";
import { ProReport } from "@/types/report";
import { Category } from "@/types/category";

const baseReport: ProReport = {
  id: 1,
  categoryId: 7,
  description: "Csöpögő csap a konyhában",
  urgency: 0,
  distanceKm: 3.4,
  lat: 47.49,
  lng: 19.04,
  createdAt: "2024-03-12T10:00:00Z",
};

const category: Category = { id: "7", label: "Vízvezeték", icon: "wrench" };

describe("ProReportCard – content", () => {
  it("renders the description", () => {
    render(<ProReportCard report={baseReport} category={category} />);
    expect(screen.getByText("Csöpögő csap a konyhában")).toBeDefined();
  });

  it("renders the category label", () => {
    render(<ProReportCard report={baseReport} category={category} />);
    expect(screen.getByText("Vízvezeték")).toBeDefined();
  });

  it('renders "Ismeretlen kategória" when category is undefined', () => {
    render(<ProReportCard report={baseReport} category={undefined} />);
    expect(screen.getByText("Ismeretlen kategória")).toBeDefined();
  });

  it("renders the distance", () => {
    render(<ProReportCard report={baseReport} category={category} />);
    expect(screen.getByText(/3\.4 km/)).toBeDefined();
  });

  it("renders the creation date", () => {
    render(<ProReportCard report={baseReport} category={category} />);
    // Hungarian locale date
    expect(screen.getByText(/márc\.|márc|március/i)).toBeDefined();
  });
});

describe("ProReportCard – urgency colors", () => {
  it('shows green dot and "Ráér" badge for urgency 0', () => {
    render(<ProReportCard report={{ ...baseReport, urgency: 0 }} category={category} />);
    const badges = screen.getAllByText("Ráér");
    expect(badges.length).toBeGreaterThan(0);
    // The urgency dot should have green class
    const dot = document.querySelector(".bg-green-500");
    expect(dot).toBeDefined();
  });

  it('shows orange dot and "Pár napon belül" badge for urgency 50', () => {
    render(<ProReportCard report={{ ...baseReport, urgency: 50 }} category={category} />);
    const badges = screen.getAllByText("Pár napon belül");
    expect(badges.length).toBeGreaterThan(0);
    const dot = document.querySelector(".bg-orange-500");
    expect(dot).toBeDefined();
  });

  it('shows red dot and "Sürgős" badge for urgency 100', () => {
    render(<ProReportCard report={{ ...baseReport, urgency: 100 }} category={category} />);
    const badges = screen.getAllByText("Sürgős");
    expect(badges.length).toBeGreaterThan(0);
    const dot = document.querySelector(".bg-red-500");
    expect(dot).toBeDefined();
  });
});

describe("ProReportCard – highlighted state", () => {
  it("applies highlighted border when highlighted=true", () => {
    const { container } = render(
      <ProReportCard report={baseReport} category={category} highlighted />
    );
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("border-primary");
  });

  it("does not apply highlighted border when highlighted=false", () => {
    const { container } = render(
      <ProReportCard report={baseReport} category={category} highlighted={false} />
    );
    const card = container.firstChild as HTMLElement;
    expect(card.className).not.toContain("border-primary");
  });
});

describe("ProReportCard – mouse events", () => {
  it("calls onMouseEnter when mouse enters the card", () => {
    const onMouseEnter = vi.fn();
    const { container } = render(
      <ProReportCard report={baseReport} category={category} onMouseEnter={onMouseEnter} />
    );
    fireEvent.mouseEnter(container.firstChild as HTMLElement);
    expect(onMouseEnter).toHaveBeenCalledOnce();
  });

  it("calls onMouseLeave when mouse leaves the card", () => {
    const onMouseLeave = vi.fn();
    const { container } = render(
      <ProReportCard report={baseReport} category={category} onMouseLeave={onMouseLeave} />
    );
    fireEvent.mouseLeave(container.firstChild as HTMLElement);
    expect(onMouseLeave).toHaveBeenCalledOnce();
  });
});

describe("ProReportCard – offer button", () => {
  it("does not render the offer button when onOffer is not provided", () => {
    render(<ProReportCard report={baseReport} category={category} />);
    expect(screen.queryByTestId(`offer-btn-${baseReport.id}`)).toBeNull();
  });

  it("renders the offer button when onOffer is provided", () => {
    const onOffer = vi.fn();
    render(
      <ProReportCard report={baseReport} category={category} onOffer={onOffer} />
    );
    expect(screen.getByTestId(`offer-btn-${baseReport.id}`)).toBeDefined();
    expect(screen.getByText("Ajánlatot adok")).toBeDefined();
  });

  it("calls onOffer with the report id when button is clicked", () => {
    const onOffer = vi.fn();
    render(
      <ProReportCard report={baseReport} category={category} onOffer={onOffer} />
    );
    fireEvent.click(screen.getByTestId(`offer-btn-${baseReport.id}`));
    expect(onOffer).toHaveBeenCalledWith(baseReport.id);
  });
});
