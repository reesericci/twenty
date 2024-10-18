import { useRecordGroupStates } from '@/object-record/record-group/hooks/useRecordGroupStates';
import { ReactNode } from 'react';
import { RecordGroupTableInstanceContext } from '@/object-record/record-group/states/contexts/RecordGroupTableInstanceContext';
import { useRecordGroupEnabled } from '@/object-record/record-group/hooks/useRecordGroupEnabled';

type RecordGroupTableScopeProps = {
  objectNameSingular: string;
  children?: ReactNode;
};

export const RecordGroupTableScope = ({
  objectNameSingular,
  children,
}: RecordGroupTableScopeProps) => {
  const { isEnabled } = useRecordGroupEnabled();

  const { visibleRecordGroups } = useRecordGroupStates({ objectNameSingular });

  if (!isEnabled) {
    return null;
  }

  return visibleRecordGroups.map((recordGroup) => (
    <RecordGroupTableInstanceContext.Provider
      value={{ instanceId: recordGroup.id }}
    >
      {children}
    </RecordGroupTableInstanceContext.Provider>
  ));
};
