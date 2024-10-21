import { useEffect, useState } from 'react';
import { Key } from 'ts-key-enum';
import {
  IconBaselineDensitySmall,
  IconChevronLeft,
  IconEyeOff,
  IconFileExport,
  IconFileImport,
  IconRotate2,
  IconSettings,
  IconTag,
  useIcons,
} from 'twenty-ui';

import { useObjectNamePluralFromSingular } from '@/object-metadata/hooks/useObjectNamePluralFromSingular';
import { useHandleToggleTrashColumnFilter } from '@/object-record/record-index/hooks/useHandleToggleTrashColumnFilter';
import { RECORD_INDEX_OPTIONS_DROPDOWN_ID } from '@/object-record/record-index/options/constants/RecordIndexOptionsDropdownId';

import {
  displayedExportProgress,
  useExportRecordData,
} from '@/action-menu/hooks/useExportRecordData';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useRecordIndexOptionsForBoard } from '@/object-record/record-index/options/hooks/useRecordIndexOptionsForBoard';
import { useRecordIndexOptionsForTable } from '@/object-record/record-index/options/hooks/useRecordIndexOptionsForTable';
import { TableOptionsHotkeyScope } from '@/object-record/record-table/types/TableOptionsHotkeyScope';
import { useOpenObjectRecordsSpreasheetImportDialog } from '@/object-record/spreadsheet-import/hooks/useOpenObjectRecordsSpreasheetImportDialog';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { UndecoratedLink } from '@/ui/navigation/link/components/UndecoratedLink';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { MenuItemNavigate } from '@/ui/navigation/menu-item/components/MenuItemNavigate';
import { MenuItemToggle } from '@/ui/navigation/menu-item/components/MenuItemToggle';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { ViewFieldsVisibilityDropdownSection } from '@/views/components/ViewFieldsVisibilityDropdownSection';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { ViewType } from '@/views/types/ViewType';
import { useLocation } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { ViewGroupsVisibilityDropdownSection } from '@/views/components/ViewGroupsVisibilityDropdownSection';
import { useRecordGroupStates } from '@/object-record/record-group/hooks/useRecordGroupStates';
import { useRecordGroupVisibility } from '@/object-record/record-group/hooks/useRecordGroupVisibility';
import { useRecordGroupReorder } from '@/object-record/record-group/hooks/useRecordGroupReorder';
import { useRecordGroupSelector } from '@/object-record/record-group/hooks/useRecordGroupSelector';

type RecordIndexOptionsMenu =
  | 'groupBy'
  | 'groupBySelectField'
  | 'viewGroups'
  | 'hiddenViewGroups'
  | 'fields'
  | 'hiddenFields';

type RecordIndexOptionsDropdownContentProps = {
  recordIndexId: string;
  objectMetadataItem: ObjectMetadataItem;
  viewType: ViewType;
};

export const RecordIndexOptionsDropdownContent = ({
  viewType,
  recordIndexId,
  objectMetadataItem,
}: RecordIndexOptionsDropdownContentProps) => {
  const { currentViewWithCombinedFiltersAndSorts } = useGetCurrentView();

  const { getIcon } = useIcons();

  const { closeDropdown } = useDropdown(RECORD_INDEX_OPTIONS_DROPDOWN_ID);

  const [currentMenu, setCurrentMenu] = useState<
    RecordIndexOptionsMenu | undefined
  >(undefined);

  const resetMenu = () => setCurrentMenu(undefined);

  const handleSelectMenu = (option: RecordIndexOptionsMenu) => {
    setCurrentMenu(option);
  };

  const { objectNamePlural } = useObjectNamePluralFromSingular({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const settingsUrl = getSettingsPagePath(SettingsPath.ObjectDetail, {
    objectSlug: objectNamePlural,
  });

  useScopedHotkeys(
    [Key.Escape],
    () => {
      closeDropdown();
    },
    TableOptionsHotkeyScope.Dropdown,
  );

  const {
    handleColumnVisibilityChange,
    handleReorderColumns,
    visibleTableColumns,
    hiddenTableColumns,
  } = useRecordIndexOptionsForTable(recordIndexId);

  const { handleToggleTrashColumnFilter, toggleSoftDeleteFilterState } =
    useHandleToggleTrashColumnFilter({
      objectNameSingular: objectMetadataItem.nameSingular,
      viewBarId: recordIndexId,
    });

  const {
    visibleBoardFields,
    hiddenBoardFields,
    handleReorderBoardFields,
    handleBoardFieldVisibilityChange,
    isCompactModeActive,
    setAndPersistIsCompactModeActive,
  } = useRecordIndexOptionsForBoard({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordBoardId: recordIndexId,
    viewBarId: recordIndexId,
  });

  const {
    hiddenRecordGroups,
    visibleRecordGroups,
    viewGroupFieldMetadataItem,
    selectableFieldMetadataItems,
  } = useRecordGroupStates({
    objectNameSingular,
  });
  const { handleFieldMetadataItemChange } = useRecordGroupSelector({
    viewBarComponentId: recordIndexId,
  });
  const { handleVisibilityChange: handleRecordGroupVisibilityChange } =
    useRecordGroupVisibility({
      viewBarId: recordIndexId,
    });
  const { handleOrderChange: handleRecordGroupOrderChange } =
    useRecordGroupReorder({
      objectNameSingular,
      viewBarId: recordIndexId,
    });

  const viewGroupSettingsUrl = getSettingsPagePath(SettingsPath.ObjectDetail, {
    id: viewGroupFieldMetadataItem?.name,
    objectSlug: objectNamePlural,
  });

  const visibleRecordFields =
    viewType === ViewType.Kanban ? visibleBoardFields : visibleTableColumns;

  const hiddenRecordFields =
    viewType === ViewType.Kanban ? hiddenBoardFields : hiddenTableColumns;

  const handleReorderFields =
    viewType === ViewType.Kanban
      ? handleReorderBoardFields
      : handleReorderColumns;

  const handleChangeFieldVisibility =
    viewType === ViewType.Kanban
      ? handleBoardFieldVisibilityChange
      : handleColumnVisibilityChange;

  const { openObjectRecordsSpreasheetImportDialog } =
    useOpenObjectRecordsSpreasheetImportDialog(objectMetadataItem.nameSingular);

  const { progress, download } = useExportRecordData({
    delayMs: 100,
    filename: `${objectMetadataItem.nameSingular}.csv`,
    objectMetadataItem,
    recordIndexId,
    viewType,
  });

  const location = useLocation();
  const setNavigationMemorizedUrl = useSetRecoilState(
    navigationMemorizedUrlState,
  );

  const viewGroupMenuItem =
    viewGroupFieldMetadataItem &&
    (visibleRecordGroups.length > 0 || hiddenRecordGroups.length > 0) ? (
      <MenuItem
        onClick={() => handleSelectMenu('viewGroups')}
        LeftIcon={getIcon(currentViewWithCombinedFiltersAndSorts?.icon)}
        text={viewGroupFieldMetadataItem.label}
        hasSubMenu
      />
    ) : null;

  useEffect(() => {
    if (currentMenu === 'hiddenViewGroups' && hiddenRecordGroups.length === 0) {
      setCurrentMenu('viewGroups');
    }
  }, [hiddenRecordGroups, currentMenu]);

  return (
    <>
      {!currentMenu && (
        <DropdownMenuItemsContainer>
          <MenuItem
            onClick={() =>
              viewGroupFieldMetadataItem
                ? handleSelectMenu('groupBy')
                : handleSelectMenu('groupBySelectField')
            }
            LeftIcon={IconTag}
            text="Group by"
            hasSubMenu
          />
          {viewGroupMenuItem}
          <MenuItem
            onClick={() => handleSelectMenu('fields')}
            LeftIcon={IconTag}
            text="Fields"
            hasSubMenu
          />
          <MenuItem
            onClick={() => openObjectRecordsSpreasheetImportDialog()}
            LeftIcon={IconFileImport}
            text="Import"
          />
          <MenuItem
            onClick={download}
            LeftIcon={IconFileExport}
            text={displayedExportProgress(progress)}
          />
          <MenuItem
            onClick={() => {
              handleToggleTrashColumnFilter();
              toggleSoftDeleteFilterState(true);
              closeDropdown();
            }}
            LeftIcon={IconRotate2}
            text={`Deleted ${objectNamePlural}`}
          />
        </DropdownMenuItemsContainer>
      )}
      {currentMenu === 'groupBySelectField' && (
        <>
          <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={resetMenu}>
            Group by
          </DropdownMenuHeader>
          <MenuItem text="None" />
          {selectableFieldMetadataItems.map((fieldMetadataItem) => (
            <MenuItem
              key={fieldMetadataItem.id}
              onClick={() => {
                handleFieldMetadataItemChange(fieldMetadataItem);
              }}
              LeftIcon={getIcon(fieldMetadataItem.icon)}
              text={fieldMetadataItem.label}
            />
          ))}
          <DropdownMenuSeparator />
          <UndecoratedLink
            to={viewGroupSettingsUrl}
            onClick={() => {
              setNavigationMemorizedUrl(location.pathname + location.search);
              closeDropdown();
            }}
          >
            <DropdownMenuItemsContainer>
              <MenuItem LeftIcon={IconSettings} text="Create select field" />
            </DropdownMenuItemsContainer>
          </UndecoratedLink>
        </>
      )}
      {currentMenu === 'groupBy' && (
        <>
          <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={resetMenu}>
            Group by
          </DropdownMenuHeader>
          <MenuItem
            onClick={() => handleSelectMenu('groupBySelectField')}
            text={`Group by "${viewGroupFieldMetadataItem?.label}"`}
            hasSubMenu
          />
          <DropdownMenuSeparator />
          <ViewGroupsVisibilityDropdownSection
            title={viewGroupFieldMetadataItem?.label ?? ''}
            viewGroups={visibleRecordGroups}
            onDragEnd={handleRecordGroupOrderChange}
            onVisibilityChange={handleRecordGroupVisibilityChange}
            isDraggable
            showSubheader={false}
            showDragGrip={true}
          />
          {hiddenRecordGroups.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItemsContainer>
                <MenuItemNavigate
                  onClick={() => handleSelectMenu('hiddenViewGroups')}
                  LeftIcon={IconEyeOff}
                  text={`Hidden ${viewGroupFieldMetadataItem?.label ?? ''}`}
                />
              </DropdownMenuItemsContainer>
            </>
          )}
        </>
      )}
      {currentMenu === 'viewGroups' && (
        <>
          <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={resetMenu}>
            {viewGroupFieldMetadataItem?.label}
          </DropdownMenuHeader>
          <ViewGroupsVisibilityDropdownSection
            title={viewGroupFieldMetadataItem?.label ?? ''}
            viewGroups={visibleRecordGroups}
            onDragEnd={handleRecordGroupOrderChange}
            onVisibilityChange={handleRecordGroupVisibilityChange}
            isDraggable
            showSubheader={false}
            showDragGrip={true}
          />
          {hiddenRecordGroups.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItemsContainer>
                <MenuItemNavigate
                  onClick={() => handleSelectMenu('hiddenViewGroups')}
                  LeftIcon={IconEyeOff}
                  text={`Hidden ${viewGroupFieldMetadataItem?.label ?? ''}`}
                />
              </DropdownMenuItemsContainer>
            </>
          )}
        </>
      )}
      {currentMenu === 'fields' && (
        <>
          <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={resetMenu}>
            Fields
          </DropdownMenuHeader>
          <ViewFieldsVisibilityDropdownSection
            title="Visible"
            fields={visibleRecordFields}
            isDraggable
            onDragEnd={handleReorderFields}
            onVisibilityChange={handleChangeFieldVisibility}
            showSubheader={false}
            showDragGrip={true}
          />
          <DropdownMenuSeparator />
          <DropdownMenuItemsContainer>
            <MenuItemNavigate
              onClick={() => handleSelectMenu('hiddenFields')}
              LeftIcon={IconEyeOff}
              text="Hidden Fields"
            />
          </DropdownMenuItemsContainer>
        </>
      )}
      {currentMenu === 'hiddenViewGroups' && (
        <>
          <DropdownMenuHeader
            StartIcon={IconChevronLeft}
            onClick={() => setCurrentMenu('viewGroups')}
          >
            Hidden {viewGroupFieldMetadataItem?.label}
          </DropdownMenuHeader>
          <ViewGroupsVisibilityDropdownSection
            title={`Hidden ${viewGroupFieldMetadataItem?.label}`}
            viewGroups={hiddenRecordGroups}
            onVisibilityChange={handleRecordGroupVisibilityChange}
            isDraggable={false}
            showSubheader={false}
            showDragGrip={false}
          />
          <DropdownMenuSeparator />
          <UndecoratedLink
            to={viewGroupSettingsUrl}
            onClick={() => {
              setNavigationMemorizedUrl(location.pathname + location.search);
              closeDropdown();
            }}
          >
            <DropdownMenuItemsContainer>
              <MenuItem LeftIcon={IconSettings} text="Edit field values" />
            </DropdownMenuItemsContainer>
          </UndecoratedLink>
        </>
      )}
      {currentMenu === 'hiddenFields' && (
        <>
          <DropdownMenuHeader
            StartIcon={IconChevronLeft}
            onClick={() => setCurrentMenu('fields')}
          >
            Hidden Fields
          </DropdownMenuHeader>
          {hiddenRecordFields.length > 0 && (
            <>
              <ViewFieldsVisibilityDropdownSection
                title="Hidden"
                fields={hiddenRecordFields}
                isDraggable={false}
                onVisibilityChange={handleChangeFieldVisibility}
                showSubheader={false}
                showDragGrip={false}
              />
            </>
          )}
          <DropdownMenuSeparator />

          <UndecoratedLink
            to={settingsUrl}
            onClick={() => {
              setNavigationMemorizedUrl(location.pathname + location.search);
              closeDropdown();
            }}
          >
            <DropdownMenuItemsContainer>
              <MenuItem LeftIcon={IconSettings} text="Edit Fields" />
            </DropdownMenuItemsContainer>
          </UndecoratedLink>
        </>
      )}

      {viewType === ViewType.Kanban && !currentMenu && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItemsContainer>
            <MenuItemToggle
              LeftIcon={IconBaselineDensitySmall}
              onToggleChange={() =>
                setAndPersistIsCompactModeActive(
                  !isCompactModeActive,
                  currentViewWithCombinedFiltersAndSorts,
                )
              }
              toggled={isCompactModeActive}
              text="Compact view"
              toggleSize="small"
            />
          </DropdownMenuItemsContainer>
        </>
      )}
    </>
  );
};
