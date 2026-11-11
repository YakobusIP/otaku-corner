import { useMemo } from "react";

import { auditLogService } from "@/services/audit-log.service";

import type { AuditLogItem } from "@/types/audit-log.type";

import { useDialogSelection } from "@/hooks/useDialogSelection";
import { auditLogKeys } from "@/lib/query-keys";

import { useInfiniteQuery } from "@tanstack/react-query";

const PAGE_SIZE = 25;

export const useAuditLogInfinite = () => {
  const query = useInfiniteQuery({
    queryKey: auditLogKeys.infinite({}),
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const result = await auditLogService.list({
        limit: PAGE_SIZE,
        cursor: pageParam
      });
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined
  });

  const items = useMemo(
    () =>
      query.data?.pages.flatMap((page) => page.items) ?? ([] as AuditLogItem[]),
    [query.data?.pages]
  );

  return {
    ...query,
    items
  };
};

export const useAuditLogDetailSelection = () => useDialogSelection<AuditLogItem>();
