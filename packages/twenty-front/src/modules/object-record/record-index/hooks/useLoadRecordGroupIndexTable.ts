import { useRecoilValue } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { useRecordTableRecordGqlFields } from '@/object-record/record-index/hooks/useRecordTableRecordGqlFields';
import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { SIGN_IN_BACKGROUND_MOCK_COMPANIES } from '@/sign-in-background-mock/constants/SignInBackgroundMockCompanies';
import { isNull } from '@sniptt/guards';
import { WorkspaceActivationStatus } from '~/generated/graphql';
import { recordGroupTableDefinitionSelector } from '@/object-record/record-group/states/recordGroupTableDefinitionSelector';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useMemo } from 'react';
import { isRecordGroupDefinitionValue } from '@/object-record/record-group/utils/isRecordGroupDefinitionValue';
import { turnFiltersIntoQueryFilter } from '@/object-record/record-filter/utils/turnFiltersIntoQueryFilter';

export const useFindManyParams = (
  objectNameSingular: string,
  recordTableId?: string,
) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { tableFiltersState, tableSortsState } =
    useRecordTableStates(recordTableId);

  const tableFilters = useRecoilValue(tableFiltersState);
  const tableSorts = useRecoilValue(tableSortsState);

  const filter = turnFiltersIntoQueryFilter(
    tableFilters,
    objectMetadataItem?.fields ?? [],
  );

  const orderBy = turnSortsIntoOrderBy(objectMetadataItem, tableSorts);

  return { objectNameSingular, filter, orderBy };
};

type UseLoadRecordIndexTableParams = {
  objectNameSingular: string;
};

export const useLoadRecordGroupIndexTable = ({
  objectNameSingular,
}: UseLoadRecordIndexTableParams) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const recordGroupDefinition = useRecoilComponentValueV2(
    recordGroupTableDefinitionSelector,
  );

  const { setRecordTableData, setIsRecordTableInitialLoading } =
    useRecordTable();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const params = useFindManyParams(objectNameSingular);

  const recordGqlFields = useRecordTableRecordGqlFields({ objectMetadataItem });

  const groupByFilter = useMemo(() => {
    if (isRecordGroupDefinitionValue(recordGroupDefinition)) {
      const fieldMetadataItem = objectMetadataItem?.fields.find(
        (fieldMetadataItem) =>
          fieldMetadataItem.id === recordGroupDefinition.fieldMetadataId,
      );

      if (!fieldMetadataItem) {
        return {};
      }

      return {
        [fieldMetadataItem.name]: {
          eq: recordGroupDefinition.value,
        },
      };
    }

    // TODO: Handle case when value is nullable

    return {};
  }, [objectMetadataItem?.fields, recordGroupDefinition]);

  // TODO: Don't fetch records based on visibleRecordGroups here, this hook instead should be placed somewhere else with a dedicated filter for a given visible record group

  const {
    records,
    loading,
    totalCount,
    fetchMoreRecords,
    queryStateIdentifier,
    hasNextPage,
  } = useFindManyRecords({
    ...params,
    filter: {
      ...params.filter,
      ...groupByFilter,
    },
    recordGqlFields,
    onCompleted: () => {
      setIsRecordTableInitialLoading(false);
    },
    onError: () => {
      setIsRecordTableInitialLoading(false);
    },
    skip: isNull(currentWorkspaceMember),
  });

  return {
    records:
      currentWorkspace?.activationStatus === WorkspaceActivationStatus.Active
        ? records
        : SIGN_IN_BACKGROUND_MOCK_COMPANIES,
    totalCount: totalCount,
    loading,
    fetchMoreRecords,
    queryStateIdentifier,
    setRecordTableData,
    hasNextPage,
  };
};
