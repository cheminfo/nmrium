import { Button, Dialog, DialogFooter, Tooltip } from '@blueprintjs/core';
import styled from '@emotion/styled';
import type {
  ACSExportOptions,
  Spectrum1D,
  Spectrum,
} from '@zakodium/nmrium-core';
import type { FormEvent } from 'react';
import {
  FieldGroupSVGTextStyleFields,
  Form,
  assert,
  svgTextStyleFieldsSchema,
  useForm,
} from 'react-science/ui';
import { z } from 'zod';

import { isSpectrum1D } from '../../data/data1d/Spectrum1D/isSpectrum1D.js';
import { ClipboardFallbackModal } from '../../utils/clipboard/clipboardComponents.tsx';
import { useClipboard } from '../../utils/clipboard/clipboardHooks.ts';
import { usePreferences } from '../context/PreferencesContext.tsx';
import { useToaster } from '../context/ToasterContext.tsx';
import { EmptyText } from '../elements/EmptyText.js';
import { StyledDialogBody } from '../elements/StyledDialogBody.js';
import { buildPublicationString } from '../hooks/use_publication_strings.ts';

const Body = styled.div`
  border: 1px solid #e9e9e9;
  min-height: 180px;
  padding: 5px;
  width: 100%;
  margin-top: 15px;
`;

interface SelectItem<T> {
  label: string;
  value: T;
}

type ExportFormatType = 'IMJA' | 'IMJ' | 'D';

type ExportSignalKind = ACSExportOptions['signalKind'];

const validationSchema = z.object({
  acs: z.object({
    signalKind: z.enum(['all', 'signal']),
    ascending: z.boolean(),
    format: z.string(),
    couplingFormat: z.string(),
    deltaFormat: z.string(),
    textStyle: svgTextStyleFieldsSchema,
  }),
  isPublicationStringShown: z.boolean(),
});

const exportOptions: Array<SelectItem<ExportSignalKind>> = [
  {
    label: 'All',
    value: 'all',
  },
  {
    label: 'Only signals',
    value: 'signal',
  },
];
const exportFormats: Array<SelectItem<ExportFormatType>> = [
  {
    label: 'Delta',
    value: 'D',
  },
  {
    label: 'Delta, Intensity, Multiplicity, Couplings, Assignment',
    value: 'IMJA',
  },
  {
    label: 'Delta, Intensity, Multiplicity, Couplings',
    value: 'IMJ',
  },
];

interface InnerPublicationStringModalProps {
  onClose: () => void;

  acsExportOptions: ACSExportOptions;
  spectrum: Spectrum;
  publicationStringVisibility?: {
    isShown: boolean;
    toggle: () => void;
  };

  allowTextStyle?: boolean;
  saveLabel?: string;
  copyOnSave?: boolean;
}

interface PublicationStringModalProps extends InnerPublicationStringModalProps {
  isOpen: boolean;
}

export function PublicationStringModal(props: PublicationStringModalProps) {
  const { isOpen, ...otherProps } = props;

  if (!isOpen) return;

  return <InnerPublicationStringModal {...otherProps} />;
}

function InnerPublicationStringModal(props: InnerPublicationStringModalProps) {
  const {
    onClose,
    acsExportOptions,
    spectrum,
    publicationStringVisibility,
    allowTextStyle = false,
    saveLabel = 'Apply',
    copyOnSave = false,
  } = props;
  const { dispatch } = usePreferences();

  const toaster = useToaster();
  const { rawWriteWithType, shouldFallback, text, cleanShouldFallback } =
    useClipboard();
  function sendToClipboard(value: string) {
    void rawWriteWithType(value, 'text/html').then(() =>
      toaster.show({ message: 'Data copied to clipboard', intent: 'success' }),
    );
  }

  const defaultValues = validationSchema.encode({
    acs: acsExportOptions,
    isPublicationStringShown: publicationStringVisibility?.isShown ?? false,
  });
  if (defaultValues.acs.textStyle.fontSize === undefined) {
    defaultValues.acs.textStyle.fontSize = '12';
  }

  const form = useForm({
    defaultValues,
    validators: { onChange: validationSchema },
    onSubmit: ({ value, formApi }) => {
      assert(spectrum && isSpectrum1D(spectrum));
      const nucleus = spectrum.info.nucleus;

      const parsedValues = validationSchema.parse(value);
      if (
        !formApi.state.fieldMeta['acs.textStyle.fontSize']?.isTouched &&
        parsedValues.acs.textStyle.fontSize === 12
      ) {
        parsedValues.acs.textStyle.fontSize = undefined;
      }

      // Apply
      dispatch({
        type: 'CHANGE_EXPORT_ACS_SETTINGS',
        payload: { options: parsedValues.acs, nucleus },
      });
      if (
        publicationStringVisibility &&
        parsedValues.isPublicationStringShown !==
          publicationStringVisibility.isShown
      ) {
        publicationStringVisibility.toggle();
      }

      // Copy
      if (copyOnSave) {
        const publicationString = buildPublicationString({
          spectrum,
          acs: parsedValues.acs,
        });
        sendToClipboard(publicationString);
      }

      // Close
      onClose();
    },
  });

  if (!spectrum || !isSpectrum1D(spectrum)) return null;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void form.handleSubmit(event);
  }

  return (
    <form.AppForm>
      <Dialog
        isOpen
        title="Publication string"
        icon={
          <span style={{ paddingRight: '16px' }}>{spectrum.info.nucleus}</span>
        }
        onClose={onClose}
        style={{ minWidth: 600 }}
      >
        <Form noValidate onSubmit={onSubmit} layout="inline">
          <HelpForm>This configuration is at the nucleus level.</HelpForm>
          <StyledDialogBody>
            <form.AppField name="acs.signalKind">
              {(field) => <field.Select label="Filter" items={exportOptions} />}
            </form.AppField>
            <form.AppField name="acs.format">
              {(field) => <field.Select label="Format" items={exportFormats} />}
            </form.AppField>
            <form.AppField name="acs.ascending">
              {(field) => <field.Checkbox label="Ascending order" />}
            </form.AppField>
            <form.AppField name="acs.deltaFormat">
              {(field) => <field.Input label="Delta format" />}
            </form.AppField>
            <form.AppField name="acs.couplingFormat">
              {(field) => <field.Input label="Couplings format" />}
            </form.AppField>

            {allowTextStyle && (
              <FieldGroupSVGTextStyleFields
                form={form}
                fields="acs.textStyle"
                label="Text style"
                previewText="Publication string"
              />
            )}

            <Body>
              <form.Subscribe selector={(s) => s.values}>
                {(values) => (
                  <PublicationStringPreview
                    values={values}
                    spectrum={spectrum}
                    onCopy={sendToClipboard}
                  />
                )}
              </form.Subscribe>
            </Body>
          </StyledDialogBody>
          <DialogFooter
            actions={
              <form.SubmitButton intent="success">
                {saveLabel}
              </form.SubmitButton>
            }
          >
            {publicationStringVisibility && (
              <form.AppField name="isPublicationStringShown">
                {(field) => (
                  <field.Checkbox
                    label="Show publication string"
                    style={{ display: 'inline-block' }}
                  />
                )}
              </form.AppField>
            )}
          </DialogFooter>
        </Form>
      </Dialog>

      <ClipboardFallbackModal
        mode={shouldFallback}
        onDismiss={cleanShouldFallback}
        text={text}
        label="Preview publication string"
      />
    </form.AppForm>
  );
}

const CopyPreviewButton = styled(Button)`
  margin-left: 5px;
  margin-bottom: 5px;
`;

const HelpForm = styled.p`
  margin: 8px;
`;

interface PublicationStringPreviewProps {
  spectrum: Spectrum1D;
  values: z.input<typeof validationSchema>;
  onCopy: (value: string) => void;
}

function PublicationStringPreview(props: PublicationStringPreviewProps) {
  const { spectrum, values, onCopy } = props;

  const { acs } = validationSchema.parse(values);
  const value = buildPublicationString({ spectrum, acs });

  if (!value) return <EmptyText text="No publication string" />;

  return (
    <>
      <Tooltip
        content="Copy"
        targetProps={{ style: { float: 'right' } }}
        placement="top"
      >
        <CopyPreviewButton onClick={() => onCopy(value)} icon="duplicate" />
      </Tooltip>
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{ __html: value }} />
    </>
  );
}
