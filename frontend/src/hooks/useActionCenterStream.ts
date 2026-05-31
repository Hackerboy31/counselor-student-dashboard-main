import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SSE_SNAPSHOT_EVENT, type ActionCenterResponse } from "@csac/shared";
import { actionCenterStreamUrl } from "@/api/actionCenterApi";
import { queryKeys } from "@/api/queryKeys";
import { useUiStore } from "@/store/uiStore";

export function useActionCenterStream(studentId: string | null): void {
  const queryClient = useQueryClient();
  const setStreamStatus = useUiStore((state) => state.setStreamStatus);

  useEffect(() => {
    if (!studentId) {
      setStreamStatus("idle");
      return;
    }

    const key = queryKeys.actionCenter(studentId);
    setStreamStatus("connecting");
    const source = new EventSource(actionCenterStreamUrl(studentId));

    source.addEventListener("open", () => setStreamStatus("live"));

    source.addEventListener(SSE_SNAPSHOT_EVENT, (event) => {
      try {
        const snapshot = JSON.parse((event as MessageEvent).data) as ActionCenterResponse;
        queryClient.setQueryData(key, snapshot);
        setStreamStatus("live");
      } catch {
        
      }
    });

    source.addEventListener("error", () => {
      setStreamStatus("reconnecting");
      void queryClient.invalidateQueries({ queryKey: key });
    });

    return () => {
      source.close();
      setStreamStatus("idle");
    };
  }, [studentId, queryClient, setStreamStatus]);
}
