import { RecordGroupTableInstanceContext } from '@/object-record/record-group/states/contexts/RecordGroupTableInstanceContext';
import { recordGroupDefinitionsComponentState } from '@/object-record/record-group/states/recordGroupDefinitionsComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useContext, useMemo } from 'react';
import { isDefined } from '~/utils/isDefined';

export const useRecordGroupDefintion = () => {
  const recordGroupDefinitions = useRecoilComponentValueV2(
    recordGroupDefinitionsComponentState,
  );

  const currentViewContext = useContext(RecordGroupTableInstanceContext);

  const recordGroupDefinition = useMemo(() => {
    if (!isDefined(currentViewContext)) {
      return null;
    }

    return recordGroupDefinitions.find(
      (recordGroupDefinition) =>
        recordGroupDefinition.id === currentViewContext.instanceId,
    );
  }, [recordGroupDefinitions, currentViewContext]);

  return recordGroupDefinition;
};
