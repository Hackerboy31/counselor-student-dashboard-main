import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { createQueryClient } from "@/api/queryClient";
import { queryKeys } from "@/api/queryKeys";
import { useActionCenterStream } from "@/hooks/useActionCenterStream";
import { MockEventSource } from "./mock-event-source";
import { buildMayaSnapshot } from "./fixtures";

describe("useActionCenterStream", () => {
  it("writes a pushed snapshot straight into the query cache", async () => {
    const client = createQueryClient();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    renderHook(() => useActionCenterStream("stu_001"), { wrapper });

    const source = MockEventSource.instances.at(-1);
    expect(source).toBeDefined();

    const snapshot = buildMayaSnapshot();
    act(() => {
      source?.emitOpen();
      source?.emitSnapshot(snapshot);
    });

    await waitFor(() => {
      expect(client.getQueryData(queryKeys.actionCenter("stu_001"))).toEqual(snapshot);
    });
  });
});
