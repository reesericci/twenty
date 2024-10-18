import { RecordGroupTableInstanceContext } from '@/object-record/record-group/states/contexts/RecordGroupTableInstanceContext';
import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';

import { createComponentSelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentSelectorV2';
import { recordIndexGroupDefinitionsState } from '@/object-record/record-index/states/recordIndexGroupDefinitionsState';

export const recordGroupTableDefinitionSelector =
  createComponentSelectorV2<RecordGroupDefinition | null>({
    key: 'recordGroupDefinitionState',
    instanceContext: RecordGroupTableInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const recordGroupDefinitions = get(recordIndexGroupDefinitionsState);

        return (
          recordGroupDefinitions.find(
            (recordGroupDefinition) => recordGroupDefinition.id === instanceId,
          ) ?? null
        );
      },
  });
