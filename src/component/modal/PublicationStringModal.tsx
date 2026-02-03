import { Button, Checkbox, Dialog, DialogFooter } from '@blueprintjs/core';
import styled from '@emotion/styled';
import type { ACSExportOptions, Spectrum1D } from '@zakodium/nmrium-core';
import type { FormEvent } from 'react';
import { Form, assert, useForm } from 'react-science/ui';
import { z } from 'zod';

import { isSpectrum1D } from '../../data/data1d/Spectrum1D/isSpectrum1D.js';
import { usePreferences } from '../context/PreferencesContext.tsx';
import { EmptyText } from '../elements/EmptyText.js';
import { StyledDialogBody } from '../elements/StyledDialogBody.js';
import useSpectrum from '../hooks/useSpectrum.js';
import { useACSSettings } from '../hooks/use_acs_settings.ts';
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
  signalKind: z.enum(['all', 'signal']),
  ascending: z.boolean(),
  format: z.enum(['IMJA', 'IMJ', 'D']),
  couplingFormat: z.string(),
  deltaFormat: z.string(),
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
  const currentACSOptions = useACSSettings();
  const form = useForm({
    defaultValues: currentACSOptions,
    validators: { onChange: validationSchema },
    onSubmit: ({ value }) => {
      assert(spectrum && isSpectrum1D(spectrum));
      const nucleus = spectrum.info.nucleus;

      dispatch({
        type: 'CHANGE_EXPORT_ACS_SETTINGS',
        payload: { options: value, nucleus },
      });
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
          <DialogBodyStyled>
            <form.Section title="Composition">
              <form.AppField name="signalKind">
                {(field) => (
                  <field.Select label="Export filter" items={exportOptions} />
                )}
              </form.AppField>
              <form.AppField name="format">
                {(field) => (
                  <field.Select label="Export format" items={exportFormats} />
                )}
              </form.AppField>
              <form.AppField name="ascending">
                {(field) => <field.Checkbox label="Ascending order" />}
              </form.AppField>
              <form.AppField name="deltaFormat">
                {(field) => <field.Input label="Delta format" />}
              </form.AppField>
              <form.AppField name="couplingFormat">
                {(field) => <field.Input label="Couplings format" />}
              </form.AppField>
            </form.Section>

            <Body>
              <form.Subscribe selector={(s) => s.values}>
                {(acs) => (
                  <PublicationStringPreview
                    acs={acs}
                    spectrum={spectrum}
                    onCopy={onCopyClick}
                  />
                )}
              </form.Subscribe>
            </Body>
          </DialogBodyStyled>
          <DialogFooter
            actions={
              <form.SubmitButton intent="success">
                Apply and close
              </form.SubmitButton>
            }
          >
            <PublicationStringCheckbox
              label="Show publication string"
              checked={isPublicationStringShown}
              onChange={togglePublicationStringVisibility}
            />
          </DialogFooter>
        </Form>
      </Dialog>
    </form.AppForm>
  );
}

const DialogBodyStyled = styled(StyledDialogBody)`
  margin-top: -15px;
`;

const CopyPreviewButton = styled(Button)`
  float: right;
  margin-left: 5px;
  margin-bottom: 5px;
`;

const PublicationStringCheckbox = styled(Checkbox)`
  display: inline-block;
`;

interface PublicationStringPreviewProps {
  spectrum: Spectrum1D;
  acs: ACSExportOptions;
  onCopy: (value: string) => void;
}

function PublicationStringPreview(props: PublicationStringPreviewProps) {
  const { spectrum, acs, onCopy } = props;

  const value = buildPublicationString({ spectrum, acs });

  if (!value) return <EmptyText text="No publication string" />;

  return (
    <>
      <CopyPreviewButton onClick={() => onCopy(value)} icon="duplicate" />
      {/*eslint-disable-next-line react/no-danger*/}
      <div dangerouslySetInnerHTML={{ __html: value }} />
    </>
  );
}
