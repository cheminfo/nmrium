import { forwardRef, memo, useCallback, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { usePreferences } from '../../context/PreferencesContext.js';
import { fieldLabelStyle } from '../../elements/FormatField.tsx';
import Label from '../../elements/Label.tsx';
import { NumberInput2Controller } from '../../elements/NumberInput2Controller.tsx';
import { Select2Controller } from '../../elements/Select2Controller.tsx';
import useNucleus from '../../hooks/useNucleus.js';
import { usePanelPreferencesByNuclei } from '../../hooks/usePanelPreferences.js';
import { PEAKS_SHAPES } from '../../modal/EditPeakShapeModal.tsx';
import { getUniqueNuclei } from '../../utility/getUniqueNuclei.js';
import type { NucleusPreferenceField } from '../extra/preferences/NucleusPreferences.js';
import { NucleusPreferences } from '../extra/preferences/NucleusPreferences.js';
import { PreferencesContainer } from '../extra/preferences/PreferencesContainer.js';
import type { SettingsRef } from '../extra/utilities/settingImperativeHandle.js';
import { useSettingImperativeHandle } from '../extra/utilities/settingImperativeHandle.js';

const formatFields: NucleusPreferenceField[] = [
  {
    id: 1,
    label: 'Serial number :',
    checkFieldName: 'showSerialNumber',
    hideFormatField: true,
  },
  {
    id: 2,
    label: 'δ (ppm) :',
    checkFieldName: 'deltaPPM.show',
    formatFieldName: 'deltaPPM.format',
  },
  {
    id: 3,
    label: 'δ (Hz) :',
    checkFieldName: 'deltaHz.show',
    formatFieldName: 'deltaHz.format',
  },
  {
    id: 4,
    label: 'Peak Width (Hz)',
    checkFieldName: 'peakWidth.show',
    formatFieldName: 'peakWidth.format',
  },
  {
    id: 5,
    label: 'Intensity :',
    checkFieldName: 'intensity.show',
    formatFieldName: 'intensity.format',
  },
  {
    id: 6,
    label: 'kind :',
    checkFieldName: 'fwhm.show',
  },
  {
    id: 7,
    label: 'fwhm :',
    checkFieldName: 'fwhm.show',
    formatFieldName: 'fwhm.format',
  },
  {
    id: 8,
    label: 'mu :',
    checkFieldName: 'mu.show',
    formatFieldName: 'mu.format',
  },
  {
    id: 11,
    label: 'gamma :',
    checkFieldName: 'gamma.show',
    formatFieldName: 'gamma.format',
  },
  {
    id: 9,
    label: 'Delete action :',
    checkFieldName: 'showDeleteAction',
    hideFormatField: true,
  },
  {
    id: 10,
    label: 'Edit peak shape action :',
    checkFieldName: 'showEditPeakShapeAction',
    hideFormatField: true,
  },
];

export default memo(
  forwardRef<SettingsRef | null>(function PeaksPreferences(_, ref) {
    const preferences = usePreferences();
    const nucleus = useNucleus();
    const nuclei = useMemo(() => getUniqueNuclei(nucleus), [nucleus]);
    const preferencesByNuclei = usePanelPreferencesByNuclei('peaks', nuclei);

    const saveHandler = useCallback(
      (values: any) => {
        preferences.dispatch({
          type: 'SET_PANELS_PREFERENCES',
          payload: { key: 'peaks', value: values },
        });
      },
      [preferences],
    );

    const { handleSubmit, control } = useForm<any>({
      defaultValues: preferencesByNuclei,
    });

    useSettingImperativeHandle(ref, handleSubmit, saveHandler);
    const currentPreferences = useWatch({ control, name: 'nuclei' });

    return (
      <PreferencesContainer>
        {nuclei?.map((n) => {
          const kind = currentPreferences?.[n].defaultPeakShape?.kind;
          return (
            <NucleusPreferences
              control={control}
              key={n}
              nucleus={n}
              fields={formatFields}
              renderBottom={() => (
                <>
                  <Label title="Kind:" style={fieldLabelStyle}>
                    <Select2Controller
                      items={PEAKS_SHAPES}
                      control={control}
                      name={`nuclei.${n}.defaultPeakShape.kind`}
                    />
                  </Label>

                  <Label title="FWHM:" style={fieldLabelStyle}>
                    <NumberInput2Controller
                      min={0}
                      control={control}
                      name={`nuclei.${n}.defaultPeakShape.fwhm`}
                      controllerProps={{
                        rules: { required: true },
                        defaultValue: 1,
                      }}
                    />
                  </Label>

                  {kind === 'pseudoVoigt' && (
                    <Label title="Mu:" style={fieldLabelStyle}>
                      <NumberInput2Controller
                        min={0}
                        control={control}
                        name={`nuclei.${n}.defaultPeakShape.mu`}
                        controllerProps={{
                          rules: { required: true },
                          defaultValue: 0.5,
                        }}
                      />
                    </Label>
                  )}
                  {kind === 'generalizedLorentzian' && (
                    <Label title="Gamma:" style={fieldLabelStyle}>
                      <NumberInput2Controller
                        min={-1}
                        max={2}
                        control={control}
                        name={`nuclei.${n}.defaultPeakShape.gamma`}
                        controllerProps={{
                          rules: { required: true },
                          defaultValue: 0.5,
                        }}
                      />
                    </Label>
                  )}
                </>
              )}
            />
          );
        })}
      </PreferencesContainer>
    );
  }),
);
