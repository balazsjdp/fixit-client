import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ReportCard } from "./report-card";

vi.mock("@/app.config", () => ({
  config: { apiBaseUrl: "http://localhost:8080" },
}));

const baseProps = {
  id: 1,
  shortDescription: "Csöpögő csap",
  description: "Részletes leírás a csapról",
  urgency: 0,
  filePath: "",
  createdAt: "2024-03-12T10:00:00Z",
  categoryLabel: "Vízvezeték",
};

describe("ReportCard – basic rendering", () => {
  it("renders shortDescription as title", () => {
    render(<ReportCard {...baseProps} />);
    expect(screen.getByText("Csöpögő csap")).toBeDefined();
  });

  it("renders category label", () => {
    render(<ReportCard {...baseProps} />);
    expect(screen.getByText("Vízvezeték")).toBeDefined();
  });

  it("renders urgency badge", () => {
    render(<ReportCard {...baseProps} urgency={0} />);
    expect(screen.getByText("Ráér")).toBeDefined();
  });

  it("renders date", () => {
    render(<ReportCard {...baseProps} />);
    expect(screen.getByText(/márc\.|márc|március/i)).toBeDefined();
  });

  it("renders statusBadges slot", () => {
    render(<ReportCard {...baseProps} statusBadges={<span>Folyamatban</span>} />);
    expect(screen.getByText("Folyamatban")).toBeDefined();
  });

  it("renders stats slot", () => {
    render(<ReportCard {...baseProps} stats={<span data-testid="stat">5.2 km</span>} />);
    expect(screen.getByTestId("stat")).toBeDefined();
  });

  it("renders actions slot", () => {
    render(<ReportCard {...baseProps} actions={<button>Részletek</button>} />);
    expect(screen.getByRole("button", { name: "Részletek" })).toBeDefined();
  });

  it("does not render description until expanded", () => {
    render(<ReportCard {...baseProps} />);
    expect(screen.queryByText("Részletes leírás a csapról")).toBeNull();
  });
});

describe("ReportCard – highlighted state", () => {
  it("applies border-primary when highlighted", () => {
    const { container } = render(<ReportCard {...baseProps} highlighted />);
    expect(container.querySelector(".border-primary")).not.toBeNull();
  });

  it("does not apply border-primary when not highlighted", () => {
    const { container } = render(<ReportCard {...baseProps} highlighted={false} />);
    expect(container.querySelector(".border-primary")).toBeNull();
  });
});

describe("ReportCard – mouse events", () => {
  it("calls onMouseEnter when mouse enters", () => {
    const onMouseEnter = vi.fn();
    const { container } = render(<ReportCard {...baseProps} onMouseEnter={onMouseEnter} />);
    fireEvent.mouseEnter(container.querySelector(".rounded-xl") as HTMLElement);
    expect(onMouseEnter).toHaveBeenCalledOnce();
  });

  it("calls onMouseLeave when mouse leaves", () => {
    const onMouseLeave = vi.fn();
    const { container } = render(<ReportCard {...baseProps} onMouseLeave={onMouseLeave} />);
    fireEvent.mouseLeave(container.querySelector(".rounded-xl") as HTMLElement);
    expect(onMouseLeave).toHaveBeenCalledOnce();
  });
});

describe("ReportCard – expand/collapse", () => {
  it("shows 'Részletek és leírás' toggle button by default", () => {
    render(<ReportCard {...baseProps} />);
    expect(screen.getByText("Részletek és leírás")).toBeDefined();
  });

  it("shows description after clicking expand button", () => {
    render(<ReportCard {...baseProps} />);
    fireEvent.click(screen.getByText("Részletek és leírás"));
    expect(screen.getByText("Részletes leírás a csapról")).toBeDefined();
  });

  it("shows 'Kevesebb részlet' when expanded", () => {
    render(<ReportCard {...baseProps} />);
    fireEvent.click(screen.getByText("Részletek és leírás"));
    expect(screen.getByText("Kevesebb részlet")).toBeDefined();
  });

  it("hides description again after collapsing", () => {
    render(<ReportCard {...baseProps} />);
    fireEvent.click(screen.getByText("Részletek és leírás"));
    fireEvent.click(screen.getByText("Kevesebb részlet"));
    expect(screen.queryByText("Részletes leírás a csapról")).toBeNull();
  });
});

describe("ReportCard – image", () => {
  it("does not render image when filePath is empty", () => {
    render(<ReportCard {...baseProps} filePath="" />);
    expect(screen.queryByAltText("Hiba fotója")).toBeNull();
  });

  it("renders image when filePath is set", () => {
    render(<ReportCard {...baseProps} filePath="uploads/test.jpg" />);
    const img = screen.getByAltText("Hiba fotója") as HTMLImageElement;
    expect(img).toBeDefined();
    expect(img.src).toContain("uploads/test.jpg");
  });

  it("opens image modal on image click", () => {
    render(<ReportCard {...baseProps} filePath="uploads/test.jpg" />);
    const imgContainer = screen.getByAltText("Hiba fotója").parentElement!;
    fireEvent.click(imgContainer);
    expect(screen.getByAltText("Hiba fotója nagyítva")).toBeDefined();
  });

  it("closes image modal on backdrop click", () => {
    render(<ReportCard {...baseProps} filePath="uploads/test.jpg" />);
    fireEvent.click(screen.getByAltText("Hiba fotója").parentElement!);
    const backdrop = document.querySelector(".fixed.inset-0") as HTMLElement;
    fireEvent.click(backdrop);
    expect(screen.queryByAltText("Hiba fotója nagyítva")).toBeNull();
  });

  it("closes image modal on close button click", () => {
    render(<ReportCard {...baseProps} filePath="uploads/test.jpg" />);
    fireEvent.click(screen.getByAltText("Hiba fotója").parentElement!);
    expect(screen.getByAltText("Hiba fotója nagyítva")).toBeDefined();
    const closeBtn = document.querySelector(".fixed.inset-0 button") as HTMLElement;
    fireEvent.click(closeBtn);
    expect(screen.queryByAltText("Hiba fotója nagyítva")).toBeNull();
  });
});
