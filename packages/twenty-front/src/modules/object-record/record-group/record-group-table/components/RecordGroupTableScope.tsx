import { useRecordGroupEnabled } from '@/object-record/record-group/hooks/useRecordGroupEnabled';
import { useRecordGroups } from '@/object-record/record-group/hooks/useRecordGroups';
import { RecordGroupTableInstanceContext } from '@/object-record/record-group/states/contexts/RecordGroupTableInstanceContext';
import { ReactNode } from 'react';

type RecordGroupTableScopeProps = {
  objectNameSingular: string;
  children?: ReactNode;
};

export const RecordGroupTableScope = ({
  objectNameSingular,
  children,
}: RecordGroupTableScopeProps) => {
  const { isEnabled } = useRecordGroupEnabled();

  const { visibleRecordGroups } = useRecordGroups({ objectNameSingular });

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
