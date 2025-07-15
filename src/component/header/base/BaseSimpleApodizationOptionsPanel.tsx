import { Checkbox } from '@blueprintjs/core';

import { useToaster } from '../../context/ToasterContext.js';
import ActionButtons from '../../elements/ActionButtons.js';
import Label from '../../elements/Label.js';
import { NumberInput2Controller } from '../../elements/NumberInput2Controller.js';
import type { ApodizationFilterEntry } from '../../panels/filtersPanel/Filters/hooks/useApodization.js';
import { useApodization } from '../../panels/filtersPanel/Filters/hooks/useApodization.js';
import { headerLabelStyle } from '../Header.js';
import { HeaderWrapper } from '../HeaderWrapper.js';

interface BaseSimpleApodizationOptionsPanelProps {
  filter: ApodizationFilterEntry | null;
}

export function BaseSimpleApodizationOptionsPanel(
  props: BaseSimpleApodizationOptionsPanelProps,
) {
  const toaster = useToaster();

  const { filter } = props;

  const { formMethods, submitHandler, handleApplyFilter, handleCancelFilter } =
    useApodization(filter, {
      applyFilterOnload: true,
    });

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

  function handleConfirm() {
    void handleSubmit((values) => handleApplyFilter(values))();
  }

  function handleCancel() {
    handleCancelFilter();
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
        onDone={handleConfirm}
        onCancel={handleCancel}
      />
    </HeaderWrapper>
  );
}
