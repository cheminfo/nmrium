import { DialogBody, DialogFooter, MenuItem } from '@blueprintjs/core';
import { MultiSelect } from '@blueprintjs/select';
import type { SignalKind } from '@zakodium/nmr-types';
import { useMemo } from 'react';
import type { Control } from 'react-hook-form';
import { useController, useForm } from 'react-hook-form';
import { Button } from 'react-science/ui';

import type { SignalKindItem } from '../../../data/constants/signalsKinds.ts';
import { SIGNAL_KINDS } from '../../../data/constants/signalsKinds.ts';
import { usePreferences } from '../../context/PreferencesContext.js';
import { fieldLabelStyle } from '../../elements/FormatField.tsx';
import Label from '../../elements/Label.tsx';
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
            renderBottom={() => (
              <SignalKindFilter control={control} nucleus={n} />
            )}
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

interface SignalKindFilterProps {
  control: Control<any>;
  nucleus: string;
}

function SignalKindFilter({ control, nucleus }: SignalKindFilterProps) {
  const { field } = useController({
    control,
    name: `nuclei.${nucleus}.floatingTablePreferences.signalKinds`,
    defaultValue: [],
  });

  const selectedKinds: SignalKind[] = field.value ?? [];

  function handleSelect(item: SignalKindItem) {
    const already = selectedKinds.includes(item.value);
    field.onChange(
      already
        ? selectedKinds.filter((k) => k !== item.value)
        : [...selectedKinds, item.value],
    );
  }

  function handleRemove(item: SignalKindItem, index: number) {
    field.onChange(selectedKinds.filter((_, i) => i !== index));
  }

  function handleClear() {
    field.onChange([]);
  }

  const selectedItems = SIGNAL_KINDS.filter((k) =>
    selectedKinds.includes(k.value),
  );

  return (
    <Label title="Signal kinds :" style={fieldLabelStyle}>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '23px' }} />

        <MultiSelect<SignalKindItem>
          items={SIGNAL_KINDS}
          selectedItems={selectedItems}
          itemRenderer={(item, { handleClick, modifiers }) => (
            <MenuItem
              key={item.value}
              text={item.label}
              active={modifiers.active}
              selected={selectedKinds.includes(item.value)}
              onClick={handleClick}
              roleStructure="listoption"
            />
          )}
          tagRenderer={(item) => item.label}
          onItemSelect={handleSelect}
          itemPredicate={(query, item) =>
            item.label.toLowerCase().includes(query.toLowerCase())
          }
          onRemove={handleRemove}
          onClear={selectedKinds.length > 0 ? handleClear : undefined}
          placeholder="All signal kinds…"
          fill
          popoverProps={{ minimal: true, matchTargetWidth: true }}
          resetOnSelect
        />
      </div>
    </Label>
  );
}
