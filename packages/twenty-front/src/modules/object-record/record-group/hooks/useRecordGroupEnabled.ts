import { recordGroupDefinitionState } from '@/object-record/record-group/states/recordGroupDefinitionState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useMemo } from 'react';

export const useRecordGroupEnabled = () => {
  const recordIndexGroupDefinitions = useRecoilComponentValueV2(
    recordGroupDefinitionState,
  );

  const isEnabled = useMemo(
    () => recordIndexGroupDefinitions.length > 0,
    [recordIndexGroupDefinitions],
  );

  return {
    isEnabled,
  };
};
