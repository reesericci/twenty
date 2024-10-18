import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { RecordGroupTableInstanceContext } from '@/object-record/record-group/states/contexts/RecordGroupTableInstanceContext';

export const recordGroupTableRowIdsState = createComponentStateV2<string[]>({
  key: 'recordGroupTableRowIdsState',
  defaultValue: [],
  componentInstanceContext: RecordGroupTableInstanceContext,
});
