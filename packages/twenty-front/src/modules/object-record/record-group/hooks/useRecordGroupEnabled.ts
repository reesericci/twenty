import { recordIndexGroupDefinitionsState } from '@/object-record/record-index/states/recordIndexGroupDefinitionsState';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

export const useRecordGroupEnabled = () => {
  const recordIndexGroupDefinitions = useRecoilValue(
    recordIndexGroupDefinitionsState,
  );

  const isEnabled = useMemo(
    () => recordIndexGroupDefinitions.length > 0,
    [recordIndexGroupDefinitions],
  );

  return {
    isEnabled,
  };
};
