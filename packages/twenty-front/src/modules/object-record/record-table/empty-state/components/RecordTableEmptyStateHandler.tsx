import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { recordTablePendingRecordIdComponentState } from '@/object-record/record-table/states/recordTablePendingRecordIdComponentState';
import { tableRowIdsComponentState } from '@/object-record/record-table/states/tableRowIdsComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isNull } from '@sniptt/guards';

type RecordTableEmptyStateHandlerProps = {
  recordTableId: string;
  emptyStateComponent?: JSX.Element | JSX.Element[];
  children?: React.ReactNode;
};

export const RecordTableEmptyStateHandler = ({
  emptyStateComponent,
  children,
}: RecordTableEmptyStateHandlerProps) => {
  const isRecordTableInitialLoading = useRecoilComponentValueV2(
    isRecordTableInitialLoadingComponentState,
  );

  const tableRowIds = useRecoilComponentValueV2(tableRowIdsComponentState);

  const pendingRecordId = useRecoilComponentValueV2(
    recordTablePendingRecordIdComponentState,
  );

  const recordTableIsEmpty =
    !isRecordTableInitialLoading &&
    tableRowIds.length === 0 &&
    isNull(pendingRecordId);

  if (recordTableIsEmpty) {
    return emptyStateComponent;
  }

  return children;
};
