import { Checkbox } from '@blueprintjs/core';
import { Select } from '@blueprintjs/select';
import type { BaselineCorrectionOptions } from '@zakodium/nmr-types';
import { memo, useCallback } from 'react';
import { Button } from 'react-science/ui';

import type { ExtractFilterEntry } from '../../data/types/common/ExtractFilterEntry.js';
import ActionButtons from '../elements/ActionButtons.js';
import Label from '../elements/Label.js';
import { NumberInputField } from '../elements/NumberInputField.js';
import { useFilter } from '../hooks/useFilter.js';
import {
  baselineCorrectionsAlgorithms,
  getBaselineData,
  useBaselineCorrection,
} from '../panels/filtersPanel/Filters/hooks/useBaselineCorrection.js';

import { headerLabelStyle } from './Header.js';
import { HeaderWrapper } from './HeaderWrapper.js';

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

interface BaseLineCorrectionInnerPanelProps {
  filter: ExtractFilterEntry<'baselineCorrection'> | null;
}

function BaseLineCorrectionInnerPanel({
  filter,
}: BaseLineCorrectionInnerPanelProps) {
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
  } = useBaselineCorrection(filter);

  const { onChange: onLivePreviewChange, ...otherLivePreviewRegisterOptions } =
    register('livePreview');

  const handleAlgorithmSelect = useCallback(
    (item: (typeof baselineCorrectionsAlgorithms)[number]) => {
      onAlgorithmChange(item);
      const { values } = getBaselineData(item.value, filter?.value);
      reset(values);
      setTimeout(submitHandler, 0);
    },
    [onAlgorithmChange, filter?.value, reset, submitHandler],
  );

  const handleLivePreviewChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      void onLivePreviewChange(event);
      submitHandler();
    },
    [onLivePreviewChange, submitHandler],
  );

  const handleDone = useCallback(
    () => handleSubmit((values) => handleApplyFilter(values))(),
    [handleSubmit, handleApplyFilter],
  );

  const AlgorithmFields = algorithm?.value
    ? BaselineAlgorithmFields[algorithm.value]
    : null;

  return (
    <HeaderWrapper>
      <Label title="Algorithm: " style={headerLabelStyle}>
        <Select
          items={baselineCorrectionsAlgorithms}
          filterable={false}
          itemsEqual="value"
          onItemSelect={handleAlgorithmSelect}
          {...defaultAlgorithmSelectProps}
        >
          <Button text={algorithm?.label} endIcon="double-caret-vertical" />
        </Select>
      </Label>

      {AlgorithmFields && (
        <AlgorithmFields control={control} onValueChange={submitHandler} />
      )}

      <Label title="Live preview" style={headerLabelStyle}>
        <Checkbox
          style={{ margin: 0 }}
          {...otherLivePreviewRegisterOptions}
          onChange={handleLivePreviewChange}
        />
      </Label>

      <ActionButtons onDone={handleDone} onCancel={handleCancelFilter} />
    </HeaderWrapper>
  );
}

interface AlgorithmFieldProps {
  control: any;
  onValueChange: () => void;
}

function AirplsFields({ control, onValueChange }: AlgorithmFieldProps) {
  return (
    <div style={{ display: 'flex' }}>
      <NumberInputField
        labelProps={{ title: 'Max iterations:', style: headerLabelStyle }}
        name="maxIterations"
        control={control}
        min={0}
        stepSize={1}
        onValueChange={onValueChange}
        style={{ width: '60px' }}
        debounceTime={250}
      />
      <NumberInputField
        labelProps={{ title: 'Tolerance:', style: headerLabelStyle }}
        name="tolerance"
        control={control}
        min={0}
        stepSize={0.001}
        majorStepSize={0.001}
        minorStepSize={0.001}
        onValueChange={onValueChange}
        style={{ width: '60px' }}
        debounceTime={250}
      />
    </div>
  );
}

function PolynomialFields({ control, onValueChange }: AlgorithmFieldProps) {
  return (
    <NumberInputField
      labelProps={{ title: 'Degree [1 - 6]:', style: headerLabelStyle }}
      name="degree"
      control={control}
      min={1}
      max={6}
      onValueChange={onValueChange}
      style={{ width: '60px' }}
      debounceTime={250}
    />
  );
}

function WhittakerFields({ control, onValueChange }: AlgorithmFieldProps) {
  return (
    <>
      <NumberInputField
        labelProps={{ title: 'Max iterations:', style: headerLabelStyle }}
        name="maxIterations"
        control={control}
        min={1}
        onValueChange={onValueChange}
        style={{ width: '60px' }}
        debounceTime={250}
      />
      <NumberInputField
        labelProps={{ title: 'Lambda:', style: headerLabelStyle }}
        name="lambda"
        control={control}
        min={1}
        onValueChange={onValueChange}
        style={{ width: '60px' }}
        debounceTime={250}
      />
      <NumberInputField
        labelProps={{ title: 'Scale:', style: headerLabelStyle }}
        name="scale"
        control={control}
        min={1}
        onValueChange={onValueChange}
        style={{ width: '60px' }}
        debounceTime={250}
      />
    </>
  );
}

function BernsteinFields({ control, onValueChange }: AlgorithmFieldProps) {
  return (
    <>
      <NumberInputField
        labelProps={{ title: 'Max iterations:', style: headerLabelStyle }}
        name="maxIterations"
        control={control}
        min={1}
        onValueChange={onValueChange}
        style={{ width: '60px' }}
        debounceTime={250}
      />
      <NumberInputField
        labelProps={{ title: 'Tolerance:', style: headerLabelStyle }}
        name="tolerance"
        control={control}
        min={0}
        onValueChange={onValueChange}
        style={{ width: '60px' }}
        debounceTime={250}
      />
      <NumberInputField
        labelProps={{ title: 'Factor Std:', style: headerLabelStyle }}
        name="factorStd"
        control={control}
        min={0}
        onValueChange={onValueChange}
        style={{ width: '60px' }}
        debounceTime={250}
      />
      <NumberInputField
        labelProps={{ title: 'Learning Rate:', style: headerLabelStyle }}
        name="learningRate"
        control={control}
        min={0}
        onValueChange={onValueChange}
        style={{ width: '60px' }}
        debounceTime={250}
      />
      <NumberInputField
        labelProps={{ title: 'Min Weight:', style: headerLabelStyle }}
        name="minWeight"
        control={control}
        min={0}
        onValueChange={onValueChange}
        style={{ width: '60px' }}
        debounceTime={250}
      />
    </>
  );
}

const MemoizedBaseLineCorrectionPanel = memo(BaseLineCorrectionInnerPanel);

export function SimpleBaseLineCorrectionOptionsPanel() {
  const filter = useFilter('baselineCorrection');
  return <MemoizedBaseLineCorrectionPanel filter={filter} />;
}
