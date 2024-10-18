import {
  RecordGroupDefinition,
  RecordGroupDefinitionNoValue,
} from '@/object-record/record-group/types/RecordGroupDefinition';

export const isRecordGroupDefinitionNoValue = (
  value?: RecordGroupDefinition | null,
): value is RecordGroupDefinitionNoValue =>
  !!value && !('fieldMetadataId' in value);
