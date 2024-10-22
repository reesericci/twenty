import { RecordGroupTableInstanceContext } from '@/object-record/record-group/states/contexts/RecordGroupTableInstanceContext';
import { recordGroupDefinitionState } from '@/object-record/record-group/states/recordGroupDefinitionState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useContext, useMemo } from 'react';
import { isDefined } from '~/utils/isDefined';

export const useRecordGroupDefintion = () => {
  const recordGroupDefinitions = useRecoilComponentValueV2(
    recordGroupDefinitionState,
  );

  const currentViewContext = useContext(RecordGroupTableInstanceContext);

  if (!isDefined(currentViewContext)) {
    throw new Error('Current view context is not defined');
  }

  const recordGroupDefinition = useMemo(
    () =>
      recordGroupDefinitions.find(
        (recordGroupDefinition) =>
          recordGroupDefinition.id === currentViewContext.instanceId,
      ),
    [recordGroupDefinitions, currentViewContext.instanceId],
  );

  return recordGroupDefinition;
};
