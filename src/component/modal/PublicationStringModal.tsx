import { Button, Dialog, DialogFooter } from '@blueprintjs/core';
import styled from '@emotion/styled';
import type { ACSExportOptions, Spectrum1D } from '@zakodium/nmrium-core';
import type { FormEvent } from 'react';
import { useMemo } from 'react';
import { assert, FieldGroupSVGTextStyleFields, Form, svgTextStyleFieldsSchema, useForm, } from 'react-science/ui';
import { z } from 'zod';

import { isSpectrum1D } from '../../data/data1d/Spectrum1D/index.js';
import { usePreferences } from '../context/PreferencesContext.js';
import { EmptyText } from '../elements/EmptyText.js';
import { StyledDialogBody } from '../elements/StyledDialogBody.js';
import useSpectrum from '../hooks/useSpectrum.js';
import { useActiveACSSettings } from '../hooks/use_acs_settings.js';
import { buildPublicationString } from '../hooks/use_publication_strings.js';

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
    label: 'Export all',
    value: 'all',
  },
  {
    label: 'Export only signals',
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
  onCopyClick: (text: string) => void;

  isPublicationStringShown: boolean;
  togglePublicationStringVisibility: () => void;
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
    onCopyClick,
    isPublicationStringShown,
    togglePublicationStringVisibility,
  } = props;
  const spectrum = useSpectrum();
  const { dispatch } = usePreferences();
  const currentACSOptions = useActiveACSSettings();

  const defaultValues = useMemo(() => {
    const values = validationSchema.encode({
      acs: currentACSOptions,
      isPublicationStringShown,
    });

    if (values.acs.textStyle.fontSize === undefined) {
      values.acs.textStyle.fontSize = '12';
    }

    return values;
  }, [currentACSOptions, isPublicationStringShown]);
  const form = useForm({
    defaultValues,
    validators: { onChange: validationSchema },
    onSubmit: ({ value }) => {
      assert(spectrum && isSpectrum1D(spectrum));
      const nucleus = spectrum.info.nucleus;

      const parsedValues = validationSchema.parse(value);
      if (parsedValues.acs.textStyle.fontSize === 12) {
        parsedValues.acs.textStyle.fontSize = undefined;
      }
      dispatch({
        type: 'CHANGE_EXPORT_ACS_SETTINGS',
        payload: { options: parsedValues.acs, nucleus },
      });
      if (parsedValues.isPublicationStringShown !== isPublicationStringShown) {
        togglePublicationStringVisibility();
      }
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
        onClose={onClose}
        style={{ minWidth: 600 }}
      >
        <Form noValidate onSubmit={onSubmit} layout="inline">
          <StyledDialogBody>
            <form.AppField name="acs.signalKind">
              {(field) => (
                <field.Select label="Export filter" items={exportOptions} />
              )}
            </form.AppField>
            <form.AppField name="acs.format">
              {(field) => (
                <field.Select label="Export format" items={exportFormats} />
              )}
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

            <FieldGroupSVGTextStyleFields
              form={form}
              fields="acs.textStyle"
              label="Text style"
              previewText="Publication string"
            />

            <Body>
              <form.Subscribe selector={(s) => s.values}>
                {(values) => (
                  <PublicationStringPreview
                    values={values}
                    spectrum={spectrum}
                    onCopy={onCopyClick}
                  />
                )}
              </form.Subscribe>
            </Body>
          </StyledDialogBody>
          <DialogFooter
            actions={
              <form.SubmitButton intent="success">
                Apply and close
              </form.SubmitButton>
            }
          >
            <form.AppField name="isPublicationStringShown">
              {(field) => (
                <field.Checkbox
                  label="Show publication string"
                  style={{ display: 'inline-block' }}
                />
              )}
            </form.AppField>
          </DialogFooter>
        </Form>
      </Dialog>
    </form.AppForm>
  );
}

const CopyPreviewButton = styled(Button)`
  float: right;
  margin-left: 5px;
  margin-bottom: 5px;
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
      <CopyPreviewButton onClick={() => onCopy(value)} icon="duplicate" />
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{ __html: value }} />
    </>
  );
}
