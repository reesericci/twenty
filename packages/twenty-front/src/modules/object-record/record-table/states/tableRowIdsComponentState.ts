import { RecordGroupTableInstanceContext } from '@/object-record/record-group/states/contexts/RecordGroupTableInstanceContext';
import { RecordTableScopeInternalContext } from '@/object-record/record-table/scopes/scope-internal-context/RecordTableScopeInternalContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const tableRowIdsComponentState = createComponentStateV2<string[]>({
  key: 'tableRowIdsComponentState',
  defaultValue: [],
  componentInstanceContext: [
    RecordTableScopeInternalContext,
    RecordGroupTableInstanceContext,
  ],
});
