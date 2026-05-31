import { useQuery } from "@tanstack/react-query";
import { getRoster } from "@/api/actionCenterApi";
import { queryKeys } from "@/api/queryKeys";

const DEFAULT_COUNSELOR_ID = "csl_001";

export function useRoster(counselorId: string = DEFAULT_COUNSELOR_ID) {
  return useQuery({
    queryKey: queryKeys.roster(counselorId),
    queryFn: () => getRoster(counselorId),
    select: (data) => data.students,
  });
}
