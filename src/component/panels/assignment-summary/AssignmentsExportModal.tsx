import { Classes, DialogFooter, RadioCard } from '@blueprintjs/core';
import styled from '@emotion/styled';
import type { GroupedDiaID } from 'openchemlib-utils';
import { useState } from 'react';
import { FaCopy, FaDownload, FaFileExport } from 'react-icons/fa';
import { AppForm, Button, useForm } from 'react-science/ui';

import { ClipboardFallbackModal } from '../../../utils/clipboard/clipboardComponents.js';
import { useClipboard } from '../../../utils/clipboard/clipboardHooks.js';
import { useChartData } from '../../context/ChartContext.js';
import { usePreferences } from '../../context/PreferencesContext.js';
import { useToaster } from '../../context/ToasterContext.js';
import { StandardDialog } from '../../elements/StandardDialog.js';
import { StyledDialogBody } from '../../elements/StyledDialogBody.js';
import type { ToolbarPopoverMenuItem } from '../../elements/ToolbarPopoverItem.js';
import { ToolbarPopoverItem } from '../../elements/ToolbarPopoverItem.js';
import { useDialogToggle } from '../../hooks/useDialogToggle.js';
import { useACSSettings } from '../../hooks/use_acs_settings.js';
import { saveAs } from '../../utility/save_as.js';

import type { AssignmentExportRowMode } from './utilities/exportAssignments.js';
import { exportAssignments } from './utilities/exportAssignments.js';

type ExportAction = 'copy' | 'export';

interface RowOption {
  label: string;
  description: string;
  value: AssignmentExportRowMode;
}

const EXPORT_MENU = [
  { text: 'Copy as TSV', icon: <FaCopy />, data: 'copy' },
  { text: 'Export as CSV', icon: <FaDownload />, data: 'export' },
] satisfies Array<ToolbarPopoverMenuItem<ExportAction>>;

const ROW_OPTIONS: RowOption[] = [
  {
    label: 'Current table view',
    description: 'Keep the rows exactly as they are currently shown.',
    value: 'current',
  },
  {
    label: 'Expanded view',
    description:
      'Show each hydrogen group on a separate row below its parent atom.',
    value: 'expanded',
  },
  {
    label: 'Collapsed view',
    description:
      'Include hydrogen numbers and labels in parentheses on the parent row.',
    value: 'collapsed',
  },
];

const INITIAL_VALUES: { rows: AssignmentExportRowMode } = { rows: 'current' };

interface AssignmentsExportModalProps {
  groups: GroupedDiaID[];
  expandedGroups: ReadonlySet<string>;
  moleculeLabel: string;
}

export function AssignmentsExportModal(props: AssignmentsExportModalProps) {
  const { groups, expandedGroups, moleculeLabel } = props;
  const { data } = useChartData();
  const { current } = usePreferences();
  const defaultACSOptions = useACSSettings(undefined);
  const toaster = useToaster();
  const [action, setAction] = useState<ExportAction>('copy');
  const { dialog, openDialog, closeDialog } = useDialogToggle({
    exportAssignments: false,
  });
  const { rawWriteWithType, shouldFallback, cleanShouldFallback, text } =
    useClipboard();

  const exportMenu = EXPORT_MENU.map((option) => ({
    ...option,
    onClick: () => handleOpenDialog(option.data),
  }));

  function handleOpenDialog(exportAction: ExportAction) {
    setAction(exportAction);
    openDialog('exportAssignments');
  }

  async function handleExport(
    exportAction: ExportAction,
    rowMode: AssignmentExportRowMode,
  ) {
    const isCopy = exportAction === 'copy';
    try {
      const delimitedText = exportAssignments({
        groups,
        spectra: data,
        expandedGroups,
        rowMode,
        acsExportSettings: current.acsExportSettings,
        defaultACSOptions,
        delimiter: isCopy ? '\t' : ',',
      });

      if (isCopy) {
        await rawWriteWithType(delimitedText, 'text/plain');
        return closeDialog();
      }

      saveAs({
        blob: new Blob([delimitedText], { type: 'text/csv;charset=utf-8' }),
        name: `${moleculeLabel}-assignments`,
        extension: '.csv',
      });

      closeDialog();
    } catch (error: unknown) {
      toaster.show({
        message: `Could not ${exportAction} assignments as ${isCopy ? 'TSV' : 'CSV'}: ${error instanceof Error ? error.message : String(error)
          }`,
        intent: 'danger',
      });
    }
  }

  return (
    <>
      <ToolbarPopoverItem<ExportAction>
        id="assignment-export"
        icon={<FaFileExport />}
        tooltip="Export"
        options={exportMenu}
        disabled={groups.length === 0}
      />
      {dialog.exportAssignments && (
        <AssignmentsExportModalContent
          action={action}
          onClose={closeDialog}
          onSubmit={(rowMode) => handleExport(action, rowMode)}
        />
      )}
      <ClipboardFallbackModal
        mode={shouldFallback}
        onDismiss={cleanShouldFallback}
        text={text}
        label="Assignments as TSV"
      />
    </>
  );
}

const ExportDialogBody = styled(StyledDialogBody)`
  .${Classes.FORM_GROUP} > div {
    width: 100%;
  }

  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Description = styled.p`
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.5;
`;

interface AssignmentsExportModalContentProps {
  action: ExportAction;
  onClose: () => void;
  onSubmit: (rowMode: AssignmentExportRowMode) => Promise<void>;
}

function AssignmentsExportModalContent(
  props: AssignmentsExportModalContentProps,
) {
  const { action, onClose, onSubmit } = props;
  const isCopy = action === 'copy';
  const actionLabel = isCopy ? 'Copy' : 'Export';
  const formatLabel = isCopy ? 'TSV' : 'CSV';
  const form = useForm({
    defaultValues: INITIAL_VALUES,
    onSubmit: ({ value }) => onSubmit(value.rows),
  });

  return (
    <StandardDialog
      isOpen
      title={`${actionLabel} assignment table as ${formatLabel}`}
      icon={isCopy ? 'clipboard' : 'export'}
      onClose={onClose}
      style={{ width: 520 }}
    >
      <AppForm form={form}>
        <ExportDialogBody>
          <form.AppField name="rows">
            {(field) => (
              <field.RadioGroup
                label={`${formatLabel} layout`}
                style={{ display: 'grid', gap: 10 }}
              >
                {ROW_OPTIONS.map((option) => (
                  <RadioCard
                    key={option.value}
                    value={option.value}
                    alignIndicator="start"
                  >
                    <strong>{option.label}</strong>
                    <Description className={Classes.TEXT_MUTED}>
                      {option.description}
                    </Description>
                  </RadioCard>
                ))}
              </field.RadioGroup>
            )}
          </form.AppField>
        </ExportDialogBody>
        <DialogFooter
          actions={
            <>
              <Button variant="outlined" onClick={onClose}>
                Cancel
              </Button>
              <form.SubmitButton
                intent="primary"
                icon={isCopy ? <FaCopy /> : <FaDownload />}
              >
                {`${isCopy ? 'Copy' : 'Download'} ${formatLabel}`}
              </form.SubmitButton>
            </>
          }
        />
      </AppForm>
    </StandardDialog>
  );
}
