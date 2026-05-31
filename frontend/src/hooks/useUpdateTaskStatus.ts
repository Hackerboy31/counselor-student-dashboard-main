import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assembleActionCenter, type ActionCenterResponse, type TaskStatus } from "@csac/shared";
import { updateTaskStatus } from "@/api/actionCenterApi";
import { queryKeys } from "@/api/queryKeys";
import { useUiStore } from "@/store/uiStore";
import { TASK_STATUS_LABELS } from "@/lib/task-status";

interface UpdateTaskStatusVars {
  taskId: string;
  status: TaskStatus;
}

interface MutationContext {
  previous: ActionCenterResponse | undefined;
}

export function useUpdateTaskStatus(studentId: string) {
  const queryClient = useQueryClient();
  const pushToast = useUiStore((state) => state.pushToast);
  const key = queryKeys.actionCenter(studentId);

  return useMutation<UpdateTaskStatusResponseLike, Error, UpdateTaskStatusVars, MutationContext>({
    mutationFn: ({ taskId, status }) => updateTaskStatus(taskId, status),
    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<ActionCenterResponse>(key);

      if (previous) {
        const nextTasks = previous.tasks.map((task) =>
          task.id === taskId ? { ...task, status } : task,
        );
        const optimistic = assembleActionCenter(
          previous.student,
          nextTasks,
          previous.messages,
          new Date(previous.generatedAt),
        );
        queryClient.setQueryData<ActionCenterResponse>(key, optimistic);
      }

      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
      pushToast({
        tone: "error",
        title: "Couldn't update task",
        description: error.message,
      });
    },
    onSuccess: (result) => {
      pushToast({
        tone: "success",
        title: "Task updated",
        description: `Marked as “${TASK_STATUS_LABELS[result.task.status]}”.`,
      });
    },
    onSettled: () => {
      if (useUiStore.getState().streamStatus !== "live") {
        void queryClient.invalidateQueries({ queryKey: key });
      }
    },
  });
}

type UpdateTaskStatusResponseLike = Awaited<ReturnType<typeof updateTaskStatus>>;
