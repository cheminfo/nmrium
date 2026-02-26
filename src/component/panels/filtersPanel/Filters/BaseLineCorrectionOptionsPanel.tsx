import { Button, Switch } from '@blueprintjs/core';
import { Select } from '@blueprintjs/select';
import type { BaselineCorrectionOptions } from '@zakodium/nmr-types';

import type { ExtractFilterEntry } from '../../../../data/types/common/ExtractFilterEntry.js';
import Label from '../../../elements/Label.js';
import { NumberInputField } from '../../../elements/NumberInputField.js';
import { ReadOnly } from '../../../elements/ReadOnly.js';
import { Sections } from '../../../elements/Sections.js';

import { FilterActionButtons } from './FilterActionButtons.js';
import { HeaderContainer, StickyHeader } from './InnerFilterHeader.js';
import {
  baselineCorrectionsAlgorithms,
  getBaselineData,
  useBaselineCorrection,
} from './hooks/useBaselineCorrection.js';

import type { BaseFilterOptionsPanelProps } from './index.js';
import { formLabelStyle } from './index.js';

const BaselineAlgorithmFields: Partial<
  Record<
    BaselineCorrectionOptions['algorithm'],
    React.ComponentType<AlgorithmFieldProps>
  >
> = {
  airpls: AirplsFields,
  polynomial: PolynomialFields,
  whittaker: WhittakerFields,
  bernstein: BernsteinFields,
};

export default function BaseLineCorrectionOptionsPanel(
  props: BaseFilterOptionsPanelProps<ExtractFilterEntry<'baselineCorrection'>>,
) {
  const { filter, enableEdit = true, onCancel, onConfirm, onEditStart } = props;

  const {
    register,
    reset,
    onAlgorithmChange,
    submitHandler,
    handleSubmit,
    handleApplyFilter,
    handleCancelFilter,
    control,
    algorithm,
    defaultAlgorithmSelectProps,
    formState: { isDirty },
    getValues,
  } = useBaselineCorrection(filter);

  function handleConfirm(event: any) {
    void handleSubmit((values) => handleApplyFilter(values))();
    onConfirm?.(event);
  }

  function handleCancel(event: any) {
    handleCancelFilter();
    onCancel?.(event);
  }

  const { onChange: onLivePreviewFieldChange, ...livePreviewFieldOptions } =
    register('livePreview');

  const disabledAction =
    !!filter.value &&
    !isDirty &&
    filter.value.algorithm === getValues().algorithm;

  const AlgorithmFields = algorithm?.value
    ? BaselineAlgorithmFields[algorithm.value]
    : null;

  function handleAlgorithmSelect(item: {
    value: BaselineCorrectionOptions['algorithm'];
    label: string;
  }) {
    onAlgorithmChange(item);
    const { values } = getBaselineData(item.value, props.filter?.value || {});
    reset(values);
    setTimeout(submitHandler, 0);
  }

  return (
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
            <FilterActionButtons
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              disabledConfirm={disabledAction}
            />
          </HeaderContainer>
        </StickyHeader>
      )}
      <Sections.Body>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Label title="Algorithm: " style={formLabelStyle}>
            <Select
              items={baselineCorrectionsAlgorithms}
              filterable={false}
              itemsEqual="value"
              onItemSelect={handleAlgorithmSelect}
              fill
              {...defaultAlgorithmSelectProps}
            >
              <Button
                text={algorithm?.label}
                endIcon="double-caret-vertical"
                variant="outlined"
              />
            </Select>
          </Label>
          {AlgorithmFields && (
            <AlgorithmFields control={control} onValueChange={submitHandler} />
          )}
        </div>
      </Sections.Body>
    </ReadOnly>
  );
}

interface AlgorithmFieldProps {
  control: any;
  onValueChange: () => void;
}

function AirplsFields({ control, onValueChange }: AlgorithmFieldProps) {
  return (
    <>
      <NumberInputField
        labelProps={{ title: 'Max iterations:', style: formLabelStyle }}
        name="maxIterations"
        control={control}
        min={1}
        onValueChange={onValueChange}
        fill
        debounceTime={250}
      />
      <NumberInputField
        labelProps={{ title: 'Tolerance:', style: formLabelStyle }}
        name="tolerance"
        control={control}
        min={0}
        stepSize={0.001}
        majorStepSize={0.001}
        minorStepSize={0.001}
        onValueChange={onValueChange}
        fill
        debounceTime={250}
      />
    </>
  );
}

function PolynomialFields({ control, onValueChange }: AlgorithmFieldProps) {
  return (
    <NumberInputField
      labelProps={{
        title: 'Degree [1 - 6]:',
        shortTitle: 'Degree:',
        style: formLabelStyle,
      }}
      name="degree"
      control={control}
      min={1}
      max={6}
      onValueChange={onValueChange}
      fill
      debounceTime={250}
    />
  );
}

function WhittakerFields({ control, onValueChange }: AlgorithmFieldProps) {
  return (
    <>
      <NumberInputField
        labelProps={{ title: 'Max iterations:', style: formLabelStyle }}
        name="maxIterations"
        control={control}
        min={1}
        onValueChange={onValueChange}
        fill
        debounceTime={250}
      />
      <NumberInputField
        labelProps={{ title: 'Lambda:', style: formLabelStyle }}
        name="lambda"
        control={control}
        min={1}
        onValueChange={onValueChange}
        fill
        debounceTime={250}
      />
      <NumberInputField
        labelProps={{ title: 'Scale:', style: formLabelStyle }}
        name="scale"
        control={control}
        min={1}
        onValueChange={onValueChange}
        fill
        debounceTime={250}
      />
    </>
  );
}

function BernsteinFields({ control, onValueChange }: AlgorithmFieldProps) {
  return (
    <>
      <NumberInputField
        labelProps={{ title: 'Max iterations:', style: formLabelStyle }}
        name="maxIterations"
        control={control}
        min={1}
        onValueChange={onValueChange}
        fill
        debounceTime={250}
      />
      <NumberInputField
        labelProps={{ title: 'Tolerance:', style: formLabelStyle }}
        name="tolerance"
        control={control}
        min={0}
        onValueChange={onValueChange}
        fill
        debounceTime={250}
      />
      <NumberInputField
        labelProps={{ title: 'Factor Std:', style: formLabelStyle }}
        name="factorStd"
        control={control}
        min={0}
        onValueChange={onValueChange}
        fill
        debounceTime={250}
      />
      <NumberInputField
        labelProps={{ title: 'Learning Rate:', style: formLabelStyle }}
        name="learningRate"
        control={control}
        min={0}
        onValueChange={onValueChange}
        fill
        debounceTime={250}
      />
      <NumberInputField
        labelProps={{ title: 'Min Weight:', style: formLabelStyle }}
        name="minWeight"
        control={control}
        min={0}
        onValueChange={onValueChange}
        fill
        debounceTime={250}
      />
    </>
  );
}
