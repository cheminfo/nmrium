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

import type { AssignmentExportRowMode } from './assignmentsToCSV.js';
import { exportAssignmentsToCSV } from './assignmentsToCSV.js';

type ExportAction = 'copy' | 'export';
interface RowOption {
  label: string;
  description: string;
  value: AssignmentExportRowMode;
}

const EXPORT_MENU = [
  { text: 'Copy as CSV', icon: <FaCopy />, data: 'copy' },
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

interface AssignmentsExportAsCSVModalProps {
  groups: GroupedDiaID[];
  expandedGroups: ReadonlySet<string>;
  moleculeLabel: string;
}

export function AssignmentsExportAsCSVModal(
  props: AssignmentsExportAsCSVModalProps,
) {
  const { groups, expandedGroups, moleculeLabel } = props;
  const { data } = useChartData();
  const { current } = usePreferences();
  const defaultACSOptions = useACSSettings(undefined);
  const toaster = useToaster();
  const [action, setAction] = useState<ExportAction>('copy');
  const { dialog, openDialog, closeDialog } = useDialogToggle({
    exportAsCSV: false,
  });
  const { rawWriteWithType, shouldFallback, cleanShouldFallback, text } =
    useClipboard();

  const exportMenu = EXPORT_MENU.map((option) => ({
    ...option,
    onClick: () => handleOpenDialog(option.data),
  }));

  function handleOpenDialog(exportAction: ExportAction) {
    setAction(exportAction);
    openDialog('exportAsCSV');
  }

  async function handleExport(
    exportAction: ExportAction,
    rowMode: AssignmentExportRowMode,
  ) {
    try {
      const csv = exportAssignmentsToCSV({
        groups,
        spectra: data,
        expandedGroups,
        rowMode,
        acsExportSettings: current.acsExportSettings,
        defaultACSOptions,
      });

      if (exportAction === 'copy') {
        await rawWriteWithType(csv, 'text/plain');
        return closeDialog();
      }

      saveAs({
        blob: new Blob([csv], { type: 'text/csv;charset=utf-8' }),
        name: `${moleculeLabel}-assignments`,
        extension: '.csv',
      });

      closeDialog();
    } catch (error: unknown) {
      toaster.show({
        message: `Could not ${exportAction} assignments as CSV: ${
          error instanceof Error ? error.message : String(error)
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
      {dialog.exportAsCSV && (
        <AssignmentsExportAsCSVModalContent
          action={action}
          onClose={closeDialog}
          onSubmit={(rowMode) => handleExport(action, rowMode)}
        />
      )}
      <ClipboardFallbackModal
        mode={shouldFallback}
        onDismiss={cleanShouldFallback}
        text={text}
        label="Assignments as CSV"
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

interface AssignmentsExportAsCSVModalContentProps {
  action: ExportAction;
  onClose: () => void;
  onSubmit: (rowMode: AssignmentExportRowMode) => Promise<void>;
}

function AssignmentsExportAsCSVModalContent(
  props: AssignmentsExportAsCSVModalContentProps,
) {
  const { action, onClose, onSubmit } = props;
  const isCopy = action === 'copy';
  const form = useForm({
    defaultValues: INITIAL_VALUES,
    onSubmit: ({ value }) => onSubmit(value.rows),
  });

  return (
    <StandardDialog
      isOpen
      title={`${isCopy ? 'Copy' : 'Export'} assignment table as CSV`}
      icon={isCopy ? 'clipboard' : 'export'}
      onClose={onClose}
      style={{ width: 520 }}
    >
      <AppForm form={form}>
        <ExportDialogBody>
          <form.AppField name="rows">
            {(field) => (
              <field.RadioGroup
                label="CSV layout"
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
                {isCopy ? 'Copy CSV' : 'Download CSV'}
              </form.SubmitButton>
            </>
          }
        />
      </AppForm>
    </StandardDialog>
  );
}
