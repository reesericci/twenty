import {
  RecordGroupDefinition,
  RecordGroupDefinitionValue,
} from '@/object-record/record-group/types/RecordGroupDefinition';

export const isRecordGroupDefinitionValue = (
  value?: RecordGroupDefinition | null,
): value is RecordGroupDefinitionValue => !!value && 'fieldMetadataId' in value;
