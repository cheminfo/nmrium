import { Switch } from '@blueprintjs/core';
import type { Apodization1DOptions } from '@zakodium/nmr-types';
import type { ReactNode } from 'react';
import { FormProvider, useFormContext } from 'react-hook-form';
import * as Yup from 'yup';

import { useDispatch } from '../../../../context/DispatchContext.js';
import Label from '../../../../elements/Label.js';
import { NumberInput2Controller } from '../../../../elements/NumberInput2Controller.js';
import { ReadOnly } from '../../../../elements/ReadOnly.js';
import { Sections } from '../../../../elements/Sections.js';
import { FilterActionButtons } from '../FilterActionButtons.js';
import { HeaderContainer, StickyHeader } from '../InnerFilterHeader.js';
import type { ApodizationFilterEntry } from '../hooks/useApodization.js';
import { useApodization } from '../hooks/useApodization.js';
import type { BaseFilterOptionsPanelProps } from '../index.js';
import { formLabelStyle } from '../index.js';

const advanceValidationSchema = Yup.object().shape({
  options: Yup.object().shape({
    gaussian: Yup.object()
      .shape({
        options: Yup.object().shape({
          lineBroadening: Yup.number().required(),
          lineBroadeningCenter: Yup.number().required().min(0).max(1),
        }),
      })
      .notRequired(),
  }),
  livePreview: Yup.boolean().required(),
  tempRollback: Yup.boolean(),
});

export function BaseApodizationOptions(
  props: BaseFilterOptionsPanelProps<ApodizationFilterEntry>,
) {
  const { filter, enableEdit = true, onCancel, onConfirm, onEditStart } = props;

  const { submitHandler, handleApplyFilter, handleCancelFilter, formMethods } =
    useApodization(filter, {
      validationSchema: advanceValidationSchema,
    });
  const dispatch = useDispatch();
  const {
    handleSubmit,
    register,
    formState: { isDirty },
  } = formMethods;
  function handleConfirm(event) {
    void handleSubmit((values) => handleApplyFilter(values))();
    onConfirm?.(event);
  }

  function handleCancel(event) {
    handleCancelFilter();
    onCancel?.(event);
  }

  const { onChange: onLivePreviewFieldChange, ...livePreviewFieldOptions } =
    register('livePreview');
  const { onChange: onProcessedFieldChange, ...processedFieldOptions } =
    register('tempRollback');

  const disabledAction = filter.value && !isDirty;

  return (
    <FormProvider {...formMethods}>
      <ReadOnly enabled={!enableEdit} onClick={onEditStart}>
        {enableEdit && (
          <StickyHeader>
            <HeaderContainer>
              <Switch
                style={{ margin: 0, marginLeft: '5px' }}
                innerLabelChecked="On"
                innerLabel="Off"
                {...livePreviewFieldOptions}
                onChange={(event) => {
                  void onLivePreviewFieldChange(event);
                  submitHandler();
                }}
                label="Live preview"
              />

              {filter.name === 'apodization' && (
                <Switch
                  style={{ margin: 0, marginLeft: '5px' }}
                  innerLabelChecked="On"
                  innerLabel="Off"
                  {...(!filter.value
                    ? { disabled: true, checked: false }
                    : processedFieldOptions)}
                  onChange={(event) => {
                    void onProcessedFieldChange(event);

                    if (!filter.id) return null;

                    dispatch({
                      type: 'SET_FILTER_SNAPSHOT',
                      payload: {
                        filter: { id: filter.id, name: filter.name },
                        tempRollback: event.target.checked,
                        triggerSource: 'processedToggle',
                      },
                    });
                    submitHandler();
                  }}
                  label="Processed"
                />
              )}
              <FilterActionButtons
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                disabledConfirm={disabledAction}
              />
            </HeaderContainer>
          </StickyHeader>
        )}
        <Sections.Body>
          <Sections
            isOverflow
            renderActiveSectionContentOnly
            matchContentHeight
          >
            <ExponentialSectionOptionsSection
              onChange={() => submitHandler()}
            />
            <GaussianOptionSection onChange={() => submitHandler()} />
            <SineBellOptionSection onChange={() => submitHandler()} />
            <SineSquareOptionSection onChange={() => submitHandler()} />
            <TrafOptionSection onChange={() => submitHandler()} />
          </Sections>
        </Sections.Body>
      </ReadOnly>
    </FormProvider>
  );
}

interface SectionOptions {
  onChange: () => void;
  setFocus?: boolean;
}

function ExponentialSectionOptionsSection(options: SectionOptions) {
  const { control } = useFormContext();
  const { onChange } = options;
  const basedPath = getBaseKeyPath('exponential');

  return (
    <OptionsSection
      algorithm="exponential"
      algorithmTitle="Exponential"
      onChange={onChange}
      autoFocus
    >
      <Label
        title="Line broadening:"
        shortTitle="LB:"
        style={formLabelStyle}
        widthThreshold={210}
      >
        <NumberInput2Controller
          control={control}
          fill
          name={`${basedPath}.lineBroadening`}
          debounceTime={250}
          stepSize={0.1}
          onValueChange={() => {
            onChange();
          }}
        />
      </Label>
    </OptionsSection>
  );
}
function GaussianOptionSection(options: SectionOptions) {
  const { control } = useFormContext();
  const { onChange } = options;
  const basedPath = getBaseKeyPath('gaussian');

  return (
    <OptionsSection
      algorithm="gaussian"
      algorithmTitle="Gaussian"
      onChange={onChange}
    >
      <Label
        title="Line broadening:"
        shortTitle="LB:"
        style={formLabelStyle}
        widthThreshold={210}
      >
        <NumberInput2Controller
          control={control}
          fill
          name={`${basedPath}.lineBroadening`}
          debounceTime={250}
          stepSize={0.1}
          onValueChange={() => {
            onChange();
          }}
        />
      </Label>
      <Label
        title="Line broadening center [0 - 1]:"
        shortTitle="LB center:"
        style={formLabelStyle}
        widthThreshold={210}
      >
        <NumberInput2Controller
          control={control}
          fill
          name={`${basedPath}.lineBroadeningCenter`}
          debounceTime={250}
          min={0}
          max={1}
          stepSize={0.1}
          onValueChange={() => {
            onChange();
          }}
        />
      </Label>
    </OptionsSection>
  );
}
function SineBellOptionSection(options: SectionOptions) {
  const { control } = useFormContext();
  const { onChange } = options;
  const basedPath = getBaseKeyPath('sineBell');

  return (
    <OptionsSection
      algorithm="sineBell"
      algorithmTitle="Sine Bell"
      onChange={onChange}
    >
      <Label title="Offset:" style={formLabelStyle}>
        <NumberInput2Controller
          control={control}
          fill
          name={`${basedPath}.offset`}
          debounceTime={250}
          stepSize={0.1}
          onValueChange={() => {
            onChange();
          }}
        />
      </Label>
    </OptionsSection>
  );
}
function SineSquareOptionSection(options: SectionOptions) {
  const { control } = useFormContext();
  const { onChange } = options;
  const basedPath = getBaseKeyPath('sineSquare');

  return (
    <OptionsSection
      algorithm="sineSquare"
      algorithmTitle="Sine Square"
      onChange={onChange}
    >
      <Label title="Offset:" style={formLabelStyle}>
        <NumberInput2Controller
          control={control}
          fill
          name={`${basedPath}.offset`}
          debounceTime={250}
          stepSize={0.1}
          onValueChange={() => {
            onChange();
          }}
        />
      </Label>
    </OptionsSection>
  );
}
function TrafOptionSection(options: SectionOptions) {
  const { control } = useFormContext();
  const { onChange } = options;
  const basedPath = getBaseKeyPath('traf');

  return (
    <OptionsSection algorithm="traf" algorithmTitle="Traf" onChange={onChange}>
      <Label
        title="lineBroadening:"
        shortTitle="LB:"
        style={formLabelStyle}
        widthThreshold={210}
      >
        <NumberInput2Controller
          control={control}
          fill
          name={`${basedPath}.lineBroadening`}
          debounceTime={250}
          stepSize={0.1}
          onValueChange={() => {
            onChange();
          }}
        />
      </Label>
    </OptionsSection>
  );
}

interface OptionsSectionProps extends SectionOptions {
  algorithm: keyof Apodization1DOptions;
  algorithmTitle: string;
  children: ReactNode;
  autoFocus?: boolean;
}

function OptionsSection(options: OptionsSectionProps) {
  const {
    onChange,
    algorithm,
    algorithmTitle,
    children,
    autoFocus = false,
  } = options;

  const { setValue, watch } = useFormContext();
  const isApplyChecked = watch(`options.${algorithm}.apply`) || false;

  function handleToggleApply(event) {
    const checked = event.target.checked;
    setValue(`options.${algorithm}.apply`, checked, { shouldDirty: true });
    onChange();
  }

  return (
    <Sections.Item
      title={algorithmTitle}
      arrowProps={{ hide: true }}
      isOpen={isApplyChecked}
      rightElement={
        <Switch
          style={{ margin: 0, marginLeft: '5px' }}
          innerLabelChecked="Apply"
          innerLabel="Off"
          checked={isApplyChecked}
          onChange={handleToggleApply}
          autoFocus={autoFocus}
        />
      }
      headerStyle={{ backgroundColor: 'white' }}
    >
      <Sections.Body>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </Sections.Body>
    </Sections.Item>
  );
}

function getBaseKeyPath(
  algorithm: keyof Apodization1DOptions,
): `options.${keyof Apodization1DOptions}.options` {
  return `options.${algorithm}.options`;
}
