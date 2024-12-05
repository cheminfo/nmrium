import { Checkbox } from '@blueprintjs/core';

import ActionButtons from '../../elements/ActionButtons.js';
import Label from '../../elements/Label.js';
import { Select2Controller } from '../../elements/Select2Controller.js';
import {
  getZeroFillingNbPoints,
  useZeroFilling,
} from '../../panels/filtersPanel/Filters/hooks/useZeroFilling.js';
import type { ZeroFillingEntry } from '../../panels/filtersPanel/Filters/hooks/useZeroFilling.js';
import { headerLabelStyle } from '../Header.js';
import { HeaderWrapper } from '../HeaderWrapper.js';

interface BaseSimpleZeroFillingOptionsPanelProps {
  filter: ZeroFillingEntry;
}
export function BaseSimpleZeroFillingOptionsPanel(
  props: BaseSimpleZeroFillingOptionsPanelProps,
) {
  const { filter } = props;

  const { control, submitHandler, register, handleCancelFilter } =
    useZeroFilling(filter, {
      applyFilterOnload: true,
    });

  const { onChange: onLivePreviewChange, ...otherLivePreviewRegisterOptions } =
    register('livePreview');

  const nbPointsList = getZeroFillingNbPoints(filter);

  return (
    <HeaderWrapper>
      <Label title="Size:" style={headerLabelStyle}>
        <Select2Controller
          control={control}
          name="nbPoints"
          items={nbPointsList}
          onItemSelect={() => {
            submitHandler('onChange');
          }}
        />
      </Label>
      <Label title="Live preview" style={{ label: { padding: '0 5px' } }}>
        <Checkbox
          style={{ margin: 0 }}
          {...otherLivePreviewRegisterOptions}
          onChange={(event) => {
            void onLivePreviewChange(event);
            submitHandler('onChange');
          }}
        />
      </Label>

      <ActionButtons
        onDone={() => submitHandler()}
        onCancel={handleCancelFilter}
      />
    </HeaderWrapper>
  );
}
