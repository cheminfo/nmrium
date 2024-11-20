import { Checkbox } from '@blueprintjs/core';
import { memo } from 'react';

import type { ExtractFilterEntry } from '../../data/types/common/ExtractFilterEntry.js';
import { useToaster } from '../context/ToasterContext.js';
import ActionButtons from '../elements/ActionButtons.js';
import Label from '../elements/Label.js';
import { NumberInput2Controller } from '../elements/NumberInput2Controller.js';
import { useFilter } from '../hooks/useFilter.js';
import { useSharedApodization } from '../panels/filtersPanel/Filters/hooks/useSharedApodization.js';

import { headerLabelStyle } from './Header.js';
import { HeaderWrapper } from './HeaderWrapper.js';

interface ApodizationOptionsInnerPanelProps {
  filter: ExtractFilterEntry<'apodization'> | null;
}

function ApodizationOptionsInnerPanel(
  props: ApodizationOptionsInnerPanelProps,
) {
  const toaster = useToaster();
  const { formMethods, submitHandler, handleApplyFilter, handleCancelFilter } =
    useSharedApodization(props.filter, { applyFilterOnload: true });

  const {
    register,
    handleSubmit,
    control,
    formState: { isValid },
    watch,
  } = formMethods;

  const isExponentialActive = watch('options.exponential.apply') || false;

  const { onChange: onLivePreviewFieldChange, ...livePreviewFieldOptions } =
    register('livePreview');

  function handleClick() {
    if (!isExponentialActive) {
      toaster.show({
        intent: 'danger',
        message:
          'Activate "Exponential" filter from the Processing panel first',
      });
    }
  }

  return (
    <HeaderWrapper>
      <Label title="Line broadening:" shortTitle="LB:" style={headerLabelStyle}>
        <NumberInput2Controller
          control={control}
          name="options.exponential.options.lineBroadening"
          debounceTime={250}
          stepSize={0.1}
          style={{ width: '60px' }}
          onValueChange={() => {
            submitHandler();
          }}
          readOnly={!isExponentialActive}
          onClick={handleClick}
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
    </HeaderWrapper>
  );
}

const MemoizedApodizationPanel = memo(ApodizationOptionsInnerPanel);

export function SimpleApodizationOptionsPanel() {
  const filter = useFilter('apodization');
  return <MemoizedApodizationPanel filter={filter} />;
}
