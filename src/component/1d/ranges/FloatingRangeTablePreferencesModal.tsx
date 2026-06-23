import { DialogBody, DialogFooter } from '@blueprintjs/core';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from 'react-science/ui';

import { usePreferences } from '../../context/PreferencesContext.js';
import { StandardDialog } from '../../elements/StandardDialog.tsx';
import useNucleus from '../../hooks/useNucleus.js';
import { usePanelPreferencesByNuclei } from '../../hooks/usePanelPreferences.js';
import type { NucleusPreferenceField } from '../../panels/extra/preferences/NucleusPreferences.tsx';
import { NucleusPreferences } from '../../panels/extra/preferences/NucleusPreferences.tsx';
import { getUniqueNuclei } from '../../utility/getUniqueNuclei.js';

const formatFields: NucleusPreferenceField[] = [
  {
    id: 1,
    label: 'Serial number :',
    checkFieldName: 'floatingTablePreferences.showSerialNumber',
    hideFormatField: true,
  },
  {
    id: 2,
    label: 'Assignment label :',
    checkFieldName: 'floatingTablePreferences.showAssignmentLabel',
    hideFormatField: true,
  },
  {
    id: 3,
    label: 'From (ppm) :',
    checkFieldName: 'floatingTablePreferences.from.show',
    formatFieldName: 'floatingTablePreferences.from.format',
  },
  {
    id: 4,
    label: 'To (ppm) :',
    checkFieldName: 'floatingTablePreferences.to.show',
    formatFieldName: 'floatingTablePreferences.to.format',
  },
  {
    id: 5,
    label: 'Absolute integration :',
    checkFieldName: 'floatingTablePreferences.absolute.show',
    formatFieldName: 'floatingTablePreferences.absolute.format',
  },
  {
    id: 6,
    label: 'Relative integration :',
    checkFieldName: 'floatingTablePreferences.relative.show',
    formatFieldName: 'floatingTablePreferences.relative.format',
  },
  {
    id: 7,
    label: 'δ (ppm) :',
    checkFieldName: 'floatingTablePreferences.deltaPPM.show',
    formatFieldName: 'floatingTablePreferences.deltaPPM.format',
  },
  {
    id: 8,
    label: 'δ (Hz) :',
    checkFieldName: 'floatingTablePreferences.deltaHz.show',
    formatFieldName: 'floatingTablePreferences.deltaHz.format',
  },
  {
    id: 9,
    label: 'Coupling (Hz) :',
    checkFieldName: 'floatingTablePreferences.coupling.show',
    formatFieldName: 'floatingTablePreferences.coupling.format',
  },
  {
    id: 10,
    label: 'Kind :',
    checkFieldName: 'floatingTablePreferences.showKind',
    hideFormatField: true,
  },
  {
    id: 11,
    label: 'Multiplicity :',
    checkFieldName: 'floatingTablePreferences.showMultiplicity',
    hideFormatField: true,
  },
  {
    id: 12,
    label: 'Assignment :',
    checkFieldName: 'floatingTablePreferences.showAssignment',
    hideFormatField: true,
  },
];

interface InnerFloatingRangeTablePreferencesModalProps {
  onCloseDialog: () => void;
}

interface FloatingRangeTablePreferencesModalProps extends InnerFloatingRangeTablePreferencesModalProps {
  isOpen: boolean;
}

export function FloatingRangeTablePreferencesModal(
  props: FloatingRangeTablePreferencesModalProps,
) {
  const { onCloseDialog, isOpen } = props;

  if (!isOpen) return;

  return (
    <StandardDialog
      isOpen
      title="Ranges table preferences "
      onClose={onCloseDialog}
      style={{ width: 600 }}
    >
      <InnerFloatingRangeTablePreferencesModal onCloseDialog={onCloseDialog} />
    </StandardDialog>
  );
}

function InnerFloatingRangeTablePreferencesModal(
  props: InnerFloatingRangeTablePreferencesModalProps,
) {
  const { onCloseDialog } = props;
  const preferences = usePreferences();
  const nucleus = useNucleus();
  const nuclei = useMemo(() => getUniqueNuclei(nucleus), [nucleus]);
  const preferencesByNuclei = usePanelPreferencesByNuclei('ranges', nuclei);

  const { handleSubmit, control } = useForm<any>({
    defaultValues: preferencesByNuclei,
  });
  function saveHandler() {
    void handleSubmit((values) => {
      preferences.dispatch({
        type: 'SET_PANELS_PREFERENCES',
        payload: { key: 'ranges', value: values },
      });
      onCloseDialog();
    })();
  }

  return (
    <>
      <DialogBody style={{ backgroundColor: 'white' }}>
        {nuclei?.map((n) => (
          <NucleusPreferences
            key={n}
            control={control}
            nucleus={n}
            fields={formatFields}
          />
        ))}
      </DialogBody>
      <DialogFooter>
        <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
          <Button intent="success" onClick={saveHandler}>
            Save preferences
          </Button>
        </div>
      </DialogFooter>
    </>
  );
}
