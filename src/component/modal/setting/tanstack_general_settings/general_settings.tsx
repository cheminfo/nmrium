import { Dialog as BPDialog } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { revalidateLogic } from '@tanstack/react-form';
import { Form, useForm } from 'react-science/ui';
import type { z } from 'zod/v4';

import { usePreferences } from '../../../context/PreferencesContext.js';
import { useSaveSettings } from '../../../hooks/useSaveSettings.tsx';

import { GeneralSettingsDialogBody } from './general_settings_dialog_body.tsx';
import { GeneralSettingsDialogFooter } from './general_settings_dialog_footer.js';
import { GeneralSettingsDialogHeader } from './general_settings_dialog_header.js';
import { workspaceValidation } from './validation.js';

interface GeneralSettingsProps {
  isOpen: boolean;
  close: () => void;
  height?: number;
}

const Dialog = styled(BPDialog)`
  max-width: 1000px;
  width: 50vw;
  min-width: 800px;
`;

export type GeneralSettingsFormType = z.input<typeof workspaceValidation>;
export function GeneralSettings(props: GeneralSettingsProps) {
  const { isOpen, close, height } = props;

  const { current: currentWorkspace } = usePreferences();
  const { saveSettings } = useSaveSettings();

  const defaultValues: z.input<typeof workspaceValidation> = {
    peaksLabel: {
      marginTop: currentWorkspace.peaksLabel.marginTop,
    },
    general: {
      dimmedSpectraOpacity: currentWorkspace.general.dimmedSpectraOpacity,
      invertScroll: currentWorkspace.general.invertScroll,
      invertActions: currentWorkspace.general.invert,
      spectraRendering: currentWorkspace.general.spectraRendering,
      popupLoggingLevel: currentWorkspace.general.popupLoggingLevel,
      loggingLevel: currentWorkspace.general.loggingLevel,
      experimentalFeatures:
        currentWorkspace.display.general?.experimentalFeatures?.display ||
        false,
    },
  };

  const form = useForm({
    validators: { onDynamic: workspaceValidation },
    validationLogic: revalidateLogic({ mode: 'change' }),
    defaultValues,
    onSubmit: ({ value }) => {
      const parsedValues = workspaceValidation.parse(value);

      saveSettings({
        display: {
          general: {
            experimentalFeatures: {
              display: parsedValues.general.experimentalFeatures,
              visible: true,
            },
          },
        },
        peaksLabel: {
          marginTop: parsedValues.peaksLabel.marginTop,
        },
        general: {
          invert: parsedValues.general.invertActions,
          invertScroll: parsedValues.general.invertScroll,
          dimmedSpectraOpacity: parsedValues.general.dimmedSpectraOpacity,
          spectraRendering: parsedValues.general.spectraRendering,
          verticalSplitterCloseThreshold: 0,
          verticalSplitterPosition: '1px',
          loggingLevel: parsedValues.general.loggingLevel,
          popupLoggingLevel: parsedValues.general.popupLoggingLevel,
        },
      });
    },
  });

  return (
    <Dialog isOpen={isOpen} onClose={close} title="General settings" icon="cog">
      <Form
        layout="inline"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <GeneralSettingsDialogHeader<GeneralSettingsFormType>
          reset={form.reset}
          currentValues={form.state.values}
        />

        <GeneralSettingsDialogBody form={form} height={height} />
        <GeneralSettingsDialogFooter form={form} onCancel={close} />
      </Form>
    </Dialog>
  );
}
