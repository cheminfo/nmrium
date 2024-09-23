import { Checkbox } from '@blueprintjs/core';
import { Select } from '@blueprintjs/select';
import { Filter, Filters } from 'nmr-processing';
import { memo } from 'react';
import { Button } from 'react-science/ui';

import ActionButtons from '../elements/ActionButtons';
import Label from '../elements/Label';
import { NumberInput2Controller } from '../elements/NumberInput2Controller';
import { useFilter } from '../hooks/useFilter';
import {
  baselineCorrectionsAlgorithms,
  getBaselineData,
  useBaselineCorrection,
} from '../panels/filtersPanel/Filters/useBaselineCorrection';

import { headerLabelStyle } from './Header';
import { HeaderContainer } from './HeaderContainer';

interface BaseLineCorrectionInnerPanelProps {
  filter: Filter | null;
}
function BaseLineCorrectionInnerPanel(
  props: BaseLineCorrectionInnerPanelProps,
) {
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
  } = useBaselineCorrection(props.filter);
  const { onChange: onLivePreviewChange, ...otherLivePreviewRegisterOptions } =
    register(`livePreview`);

  return (
    <HeaderContainer>
      <Label title="Algorithm: " style={headerLabelStyle}>
        <Select
          items={baselineCorrectionsAlgorithms}
          filterable={false}
          itemsEqual="value"
          onItemSelect={(item) => {
            onAlgorithmChange(item);
            const { values } = getBaselineData(
              item.value,
              props?.filter?.value || {},
            );
            reset(values);
            setTimeout(() => {
              submitHandler();
            }, 0);
          }}
          {...defaultAlgorithmSelectProps}
        >
          <Button text={algorithm?.label} rightIcon="double-caret-vertical" />
        </Select>
      </Label>

      {algorithm && algorithm?.value === 'airpls' && (
        <div style={{ display: 'flex' }}>
          <Label title="Max iterations:" style={headerLabelStyle}>
            <NumberInput2Controller
              control={control}
              name="maxIterations"
              min={0}
              stepSize={1}
              style={{ width: '60px' }}
              debounceTime={250}
              onValueChange={() => {
                submitHandler();
              }}
            />
          </Label>
          <Label title="Tolerance:" style={headerLabelStyle}>
            <NumberInput2Controller
              control={control}
              name="tolerance"
              min={0}
              stepSize={0.001}
              majorStepSize={0.001}
              minorStepSize={0.001}
              style={{ width: '60px' }}
              debounceTime={250}
              onValueChange={() => {
                submitHandler();
              }}
            />
          </Label>
        </div>
      )}

      {algorithm &&
        ['autoPolynomial', 'polynomial'].includes(algorithm?.value) && (
          <Label
            title="Degree [1 - 6]:"
            shortTitle="Degree:"
            style={headerLabelStyle}
          >
            <NumberInput2Controller
              control={control}
              name="degree"
              min={1}
              max={6}
              style={{ width: '60px' }}
              debounceTime={250}
              onValueChange={() => {
                submitHandler();
              }}
            />
          </Label>
        )}

      <Label title="Live preview" style={headerLabelStyle}>
        <Checkbox
          style={{ margin: 0 }}
          {...otherLivePreviewRegisterOptions}
          onChange={(event) => {
            void onLivePreviewChange(event);
            submitHandler();
          }}
        />
      </Label>
      <ActionButtons
        onDone={() => handleSubmit((values) => handleApplyFilter(values))()}
        onCancel={handleCancelFilter}
      />
    </HeaderContainer>
  );
}

const MemoizedBaseLineCorrectionPanel = memo(BaseLineCorrectionInnerPanel);

export function SimpleBaseLineCorrectionOptionsPanel() {
  const filter = useFilter(Filters.baselineCorrection.id);
  return <MemoizedBaseLineCorrectionPanel filter={filter} />;
}
