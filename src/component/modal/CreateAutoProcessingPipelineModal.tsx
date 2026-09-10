import { Checkbox, Dialog, DialogFooter } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { yupResolver } from '@hookform/resolvers/yup/src/yup.js';
import type { Filter1DOptions, Filter2DOptions } from '@zakodium/nmr-types';
import dlv from 'dlv';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaList } from 'react-icons/fa';
import { ObjectInspector } from 'react-inspector';
import { Toolbar, useOnOff } from 'react-science/ui';
import * as Yup from 'yup';

import { getFilterLabel } from '../../data/getFilterLabel.ts';
import Button from '../elements/Button.js';
import { EmptyText } from '../elements/EmptyText.tsx';
import { GroupPane } from '../elements/GroupPane.tsx';
import { Input2Controller } from '../elements/Input2Controller.tsx';
import Label from '../elements/Label.tsx';
import { Sections } from '../elements/Sections.tsx';
import { StyledDialogBody } from '../elements/StyledDialogBody.js';
import useSpectrum from '../hooks/useSpectrum.ts';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
`;
const FiltersContainer = styled.div`
  flex: 1;
  height: 100%;
`;
const PipelineOptionsContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0.9em;
`;

const selectors = [
  {
    jpath: ['info', 'nucleus'],
    label: 'Is it the same nucleus / nuclei',
  },
  {
    jpath: ['info', 'experiment'],
    label: 'Is it the same experiment',
  },
  {
    jpath: ['info', 'pulseSequence'],
    label: 'Is it the same pulse sequence',
  },
];

type AutoProcessingFilterEntry = Omit<
  Filter1DOptions | Filter2DOptions,
  'value'
>;

interface Selector {
  jpath: string[];
  value: string | number | string[] | number[];
}

interface AutProcessingPipeline {
  id: string;
  label?: string;
  enabled: boolean; // by default value is true
  selectors: Selector[]; // ordered by hierarchy
  filters: AutoProcessingFilterEntry[];
}

type AutoProcessingItem = Required<
  Omit<AutProcessingPipeline, 'id' | 'enabled'>
>;

const defaultValues = {
  filters: [
    {
      id: '1',
      name: 'digitalFilter',
      enabled: true,
      settings: {},
    },
    {
      id: '2',
      name: 'apodization',
      enabled: false,
      settings: {},
    },
    {
      id: '3',
      name: 'zeroFilling',
      enabled: true,
      settings: {},
    },
    {
      id: '4',
      name: 'fft',
      enabled: true,
      settings: {},
    },
    {
      id: '5',
      name: 'phaseCorrection',
      enabled: true,
      settings: {},
    },
  ],
};

const defaultPipeline: AutoProcessingItem = {
  label: '',
  selectors: [],
  filters: defaultValues.filters.slice(0) as AutoProcessingFilterEntry[],
};

const filterSettingsPanels = {};

const validationSchema = Yup.object().shape({
  label: Yup.string().required(),
  selectors: Yup.array().required(),
  filters: Yup.array().required().min(1),
});

interface CreateAutoProcessingPipelineModalProps {
  onClose?: (element?: string) => void;
}

export default function CreateAutoProcessingPipelineModal({
  onClose = () => null,
}: CreateAutoProcessingPipelineModalProps) {
  const [isOpenDialog, openDialog, closeDialog] = useOnOff(false);
  const spectrum = useSpectrum(defaultValues);
  const [selectedSections, openSection] = useState<Record<string, boolean>>({});
  const { handleSubmit, control } = useForm({
    defaultValues: defaultPipeline,
    resolver: yupResolver(validationSchema),
  });

  const submitHandler = useCallback((values) => {}, []);

  function handleReorderFilters(sourceIndex, targetIndex) {}

  const { filters } = spectrum;

  return (
    <>
      <Toolbar.Item
        icon={<FaList />}
        tooltip="Create an auto-processing pipeline"
        onClick={openDialog}
      />
      <Dialog
        isOpen={isOpenDialog}
        onClose={() => {
          onClose();
          closeDialog();
        }}
        style={{ width: 1200, maxWidth: 1000, height: 600 }}
        title="New auto-processing pipeline"
      >
        <StyledDialogBody>
          <Container>
            <FiltersContainer>
              <Sections isOverflow renderActiveSectionContentOnly>
                {filters.map((filter, index) => {
                  const { id, name, error, value } = filter;
                  const FilterSettingsPanel = filterSettingsPanels[filter.name];
                  return (
                    <Sections.Item
                      index={index}
                      key={id}
                      id={name}
                      dragLabel={getFilterLabel(name)}
                      onReorder={handleReorderFilters}
                      title={error || getFilterLabel(name)}
                      serial={index + 1}
                      isOpen={selectedSections[name]}
                      sticky
                      onClick={() => {
                        openSection((prevSections) => {
                          return {
                            ...prevSections,
                            [name]: !(name in prevSections)
                              ? true
                              : !prevSections[name],
                          };
                        });
                      }}
                    >
                      {FilterSettingsPanel ? (
                        <div>Settings panel</div>
                      ) : (
                        <Sections.Body>
                          {value && Object.keys(value).length > 0 ? (
                            <ObjectInspector data={value} />
                          ) : (
                            <EmptyText text=" No Settings available" />
                          )}
                        </Sections.Body>
                      )}
                    </Sections.Item>
                  );
                })}
              </Sections>
            </FiltersContainer>
            <PipelineOptionsContainer>
              <Label title="Label" style={{ wrapper: { flex: 1 } }}>
                <Input2Controller control={control} name="label" fill />
              </Label>
              <GroupPane text="Selectors criteria">
                {selectors.map((selector) => {
                  const value = dlv(spectrum, selector.jpath) || '';
                  return (
                    <Checkbox
                      key={selector.jpath.join('.')}
                      label={`${selector.label} [${value}]`}
                    />
                  );
                })}
              </GroupPane>
            </PipelineOptionsContainer>
          </Container>
        </StyledDialogBody>
        <DialogFooter className="footer-container">
          <Button.Done onClick={handleSubmit(submitHandler)}>Save</Button.Done>
        </DialogFooter>
      </Dialog>
    </>
  );
}
