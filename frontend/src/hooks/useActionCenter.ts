import { useQuery } from "@tanstack/react-query";
import { getActionCenter } from "@/api/actionCenterApi";
import { queryKeys } from "@/api/queryKeys";

export function useActionCenter(studentId: string | null) {
  return useQuery({
    queryKey: queryKeys.actionCenter(studentId ?? "none"),
    queryFn: () => getActionCenter(studentId as string),
    enabled: studentId !== null,
  });
}
