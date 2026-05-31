import { render, screen, waitFor, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { QueryClientProvider } from "@tanstack/react-query";
import { assembleActionCenter } from "@csac/shared";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "@/App";
import { createQueryClient } from "@/api/queryClient";
import { useUiStore } from "@/store/uiStore";
import { server } from "./msw/server";
import { MockEventSource } from "./mock-event-source";
import { FIXED_NOW, maya, mayaMessages, mayaTasks } from "./fixtures";

function renderApp() {
  const client = createQueryClient();
  return render(
    <QueryClientProvider client={client}>
      <App />
    </QueryClientProvider>,
  );
}

function markStreamLive(): void {
  act(() => useUiStore.setState({ streamStatus: "live" }));
}

beforeEach(() => {
  useUiStore.setState({
    selectedStudentId: null,
    statusFilter: "all",
    streamStatus: "idle",
    toasts: [],
  });
});

describe("ActionCenterPage", () => {
  it("auto-selects the top student and renders summary, urgency, and overdue task first", async () => {
    renderApp();

    expect(await screen.findByRole("heading", { name: "Maya Patel" })).toBeInTheDocument();
    expect(screen.getAllByText("Critical").length).toBeGreaterThan(0);
    expect(screen.getByText("Attendance improvement plan")).toBeInTheDocument();
    expect(screen.getAllByText("Overdue").length).toBeGreaterThan(0);
  });

  it("optimistically completes a task and confirms with a success toast", async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByRole("heading", { name: "Maya Patel" });
    markStreamLive();

    expect(screen.getAllByRole("button", { name: /^Completed/ })).toHaveLength(1);

    const fafsa = screen.getByText("Submit FAFSA application").closest("li");
    expect(fafsa).not.toBeNull();
    await user.click(within(fafsa as HTMLElement).getByRole("button", { name: /To do/i }));
    await user.click(await screen.findByRole("menuitemradio", { name: "Completed" }));

    expect(await screen.findByText("Task updated")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getAllByRole("button", { name: /^Completed/ })).toHaveLength(2),
    );
  });

  it("rolls back and shows an error toast when the update fails", async () => {
    server.use(
      http.patch("/api/tasks/:taskId/status", () =>
        HttpResponse.json(
          { error: { code: "INTERNAL_ERROR", message: "Update failed.", requestId: "x" } },
          { status: 500 },
        ),
      ),
    );
    const user = userEvent.setup();
    renderApp();
    await screen.findByRole("heading", { name: "Maya Patel" });
    markStreamLive();

    const fafsa = screen.getByText("Submit FAFSA application").closest("li");
    await user.click(within(fafsa as HTMLElement).getByRole("button", { name: /To do/i }));
    await user.click(await screen.findByRole("menuitemradio", { name: "Completed" }));

    expect(await screen.findByText("Couldn't update task")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getAllByRole("button", { name: /^Completed/ })).toHaveLength(1),
    );
  });

  it("reconciles the optimistic update with the matching SSE snapshot without reverting", async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByRole("heading", { name: "Maya Patel" });

    const source = MockEventSource.instances.at(-1);
    expect(source).toBeDefined();
    act(() => source?.emitOpen());

    const fafsa = screen.getByText("Submit FAFSA application").closest("li");
    await user.click(within(fafsa as HTMLElement).getByRole("button", { name: /To do/i }));
    await user.click(await screen.findByRole("menuitemradio", { name: "Completed" }));
    await waitFor(() =>
      expect(screen.getAllByRole("button", { name: /^Completed/ })).toHaveLength(2),
    );

    const reconciled = assembleActionCenter(
      maya,
      mayaTasks.map((task) => (task.id === "tsk_001" ? { ...task, status: "completed" } : task)),
      mayaMessages,
      FIXED_NOW,
    );
    act(() => source?.emitSnapshot(reconciled));

    await waitFor(() =>
      expect(screen.getAllByRole("button", { name: /^Completed/ })).toHaveLength(2),
    );
    expect(screen.queryByText("Couldn't update task")).not.toBeInTheDocument();
  });
});
