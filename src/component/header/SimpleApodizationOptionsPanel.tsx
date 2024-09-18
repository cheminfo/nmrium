import { Checkbox } from '@blueprintjs/core';
import { Filters, Filter } from 'nmr-processing';
import { memo } from 'react';

import ActionButtons from '../elements/ActionButtons';
import Label from '../elements/Label';
import { NumberInput2Controller } from '../elements/NumberInput2Controller';
import { useFilter } from '../hooks/useFilter';
import { useSharedApodization } from '../panels/filtersPanel/Filters/useSharedApodization';

import { headerLabelStyle } from './Header';
import { HeaderContainer } from './HeaderContainer';

interface ApodizationOptionsInnerPanelProps {
  filter: Filter | null;
}

function ApodizationOptionsInnerPanel(
  props: ApodizationOptionsInnerPanelProps,
) {
  const {
    register,
    handleSubmit,
    control,
    isValid,
    submitHandler,
    handleApplyFilter,
    handleCancelFilter,
  } = useSharedApodization(props.filter, { applyFilterOnload: true });

  const { onChange: onLivePreviewFieldChange, ...livePreviewFieldOptions } =
    register('livePreview');

  return (
    <HeaderContainer>
      <Label title="Line broadening:" shortTitle="LB:" style={headerLabelStyle}>
        <NumberInput2Controller
          control={control}
          name="lineBroadening"
          debounceTime={250}
          stepSize={0.1}
          style={{ width: '60px' }}
          onValueChange={() => {
            submitHandler();
          }}
        />
      </Label>

      <Label title="Live preview" style={{ label: { padding: '0 5px' } }}>
        <Checkbox
          {...livePreviewFieldOptions}
          onChange={(event) => {
            void onLivePreviewFieldChange(event);
            submitHandler();
          }}
          style={{ margin: 0 }}
        />
      </Label>

      <ActionButtons
        disabledDone={!isValid}
        onDone={() => handleSubmit((values) => handleApplyFilter(values))()}
        onCancel={handleCancelFilter}
      />
    </HeaderContainer>
  );
}

const MemoizedApodizationPanel = memo(ApodizationOptionsInnerPanel);

export function SimpleApodizationOptionsPanel() {
  const filter = useFilter(Filters.apodization.id);
  return <MemoizedApodizationPanel filter={filter} />;
}
