import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RadiusSlider } from "./radius-slider";

// Mock Slider so onValueChange is exercisable in jsdom
vi.mock("@/components/ui/slider", () => ({
  Slider: ({
    onValueChange,
    value,
    min,
    max,
    step,
    ...rest
  }: {
    onValueChange?: (v: number[]) => void;
    value?: number[];
    min?: number;
    max?: number;
    step?: number;
    [key: string]: unknown;
  }) => (
    <input
      role="slider"
      type="range"
      data-testid="slider-input"
      defaultValue={value?.[0] ?? 0}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onValueChange?.([Number(e.target.value)])}
      {...rest}
    />
  ),
}));

describe("RadiusSlider", () => {
  it("renders the section label", () => {
    render(<RadiusSlider value={20} onChange={vi.fn()} />);
    expect(screen.getByText("Keresési sugár")).toBeDefined();
  });

  it("displays the current km value", () => {
    render(<RadiusSlider value={35} onChange={vi.fn()} />);
    expect(screen.getByText(/35 km/)).toBeDefined();
  });

  it("shows min and max labels", () => {
    render(<RadiusSlider value={20} onChange={vi.fn()} />);
    expect(screen.getByText("5 km")).toBeDefined();
    expect(screen.getByText("100 km")).toBeDefined();
  });

  it("renders a slider input", () => {
    render(<RadiusSlider value={20} onChange={vi.fn()} />);
    expect(screen.getByRole("slider")).toBeDefined();
  });

  it("calls onChange when slider value changes", () => {
    const onChange = vi.fn();
    render(<RadiusSlider value={20} onChange={onChange} />);
    fireEvent.change(screen.getByRole("slider"), { target: { value: "40" } });
    expect(onChange).toHaveBeenCalledWith(40);
  });

  it("shows saving indicator when saving=true", () => {
    render(<RadiusSlider value={20} onChange={vi.fn()} saving />);
    expect(screen.getByText(/mentés/)).toBeDefined();
  });

  it("does not show saving indicator when saving=false", () => {
    render(<RadiusSlider value={20} onChange={vi.fn()} saving={false} />);
    expect(screen.queryByText(/mentés/)).toBeNull();
  });
});
