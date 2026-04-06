import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../src/ui/MonacoWorkbench", () => ({
  MonacoWorkbench: () => <div data-testid="mock-monaco">mock editor</div>,
}));

import { App } from "../src/App";

describe("App", () => {
  it("renders the main workbench headings", () => {
    render(<App />);

    expect(screen.getByText("Browser Interpreter Studio")).toBeTruthy();
    expect(screen.getAllByText("Device Mock").length).toBeGreaterThan(0);
    expect(screen.getByText("Console")).toBeTruthy();
  });
});
