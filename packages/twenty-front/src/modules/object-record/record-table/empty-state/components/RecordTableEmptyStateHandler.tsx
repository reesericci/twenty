import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { useRecoilValue } from 'recoil';
import { isNull } from '@sniptt/guards';

type RecordTableEmptyStateHandlerProps = {
  recordTableId: string;
  emptyStateComponent?: JSX.Element | JSX.Element[];
  children?: React.ReactNode;
};

export const RecordTableEmptyStateHandler = ({
  recordTableId,
  emptyStateComponent,
  children,
}: RecordTableEmptyStateHandlerProps) => {
  const {
    isRecordTableInitialLoadingState,
    tableRowIdsState,
    pendingRecordIdState,
  } = useRecordTableStates(recordTableId);

  const isRecordTableInitialLoading = useRecoilValue(
    isRecordTableInitialLoadingState,
  );

  const tableRowIds = useRecoilValue(tableRowIdsState);

  const pendingRecordId = useRecoilValue(pendingRecordIdState);

  const recordTableIsEmpty =
    !isRecordTableInitialLoading &&
    tableRowIds.length === 0 &&
    isNull(pendingRecordId);

  if (recordTableIsEmpty) {
    return emptyStateComponent;
  }

  return children;
};
