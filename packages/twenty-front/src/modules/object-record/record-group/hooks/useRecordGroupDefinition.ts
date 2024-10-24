import { recordGroupDefinitionsComponentState } from '@/object-record/record-group/states/recordGroupDefinitionsComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useMemo } from 'react';

export const useRecordGroupDefintion = () => {
  const recordGroupDefinitions = useRecoilComponentValueV2(
    recordGroupDefinitionsComponentState,
  );

  // const currentViewContext = useContext(RecordGroupTableInstanceContext);

  // if (!isDefined(currentViewContext)) {
  //   throw new Error('Current view context is not defined');
  // }

  const recordGroupDefinition = useMemo(
    () =>
      recordGroupDefinitions.find(
        (recordGroupDefinition) => recordGroupDefinition.id === 'TODO',
      ),
    [recordGroupDefinitions],
  );

  return recordGroupDefinition;
};
