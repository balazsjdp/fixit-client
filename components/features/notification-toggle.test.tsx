import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { NotificationToggle } from "./notification-toggle";

describe("NotificationToggle", () => {
  it("renders label and 'Bekapcsolva' when enabled", () => {
    render(
      <NotificationToggle enabled={true} onToggle={vi.fn()} />
    );
    expect(screen.getByText("Email értesítők")).toBeInTheDocument();
    expect(screen.getByText("Bekapcsolva")).toBeInTheDocument();
  });

  it("renders 'Kikapcsolva' when disabled", () => {
    render(
      <NotificationToggle enabled={false} onToggle={vi.fn()} />
    );
    expect(screen.getByText("Kikapcsolva")).toBeInTheDocument();
  });

  it("calls onToggle with false when toggled off", () => {
    const onToggle = vi.fn().mockResolvedValue(undefined);
    render(
      <NotificationToggle enabled={true} onToggle={onToggle} />
    );
    fireEvent.click(screen.getByRole("switch"));
    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it("calls onToggle with true when toggled on", () => {
    const onToggle = vi.fn().mockResolvedValue(undefined);
    render(
      <NotificationToggle enabled={false} onToggle={onToggle} />
    );
    fireEvent.click(screen.getByRole("switch"));
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it("disables switch when isLoading is true", () => {
    render(
      <NotificationToggle enabled={true} onToggle={vi.fn()} isLoading={true} />
    );
    expect(screen.getByRole("switch")).toBeDisabled();
  });

  it("switch is enabled by default (isLoading not passed)", () => {
    render(
      <NotificationToggle enabled={false} onToggle={vi.fn()} />
    );
    expect(screen.getByRole("switch")).not.toBeDisabled();
  });
});
