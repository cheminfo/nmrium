import { Checkbox } from '@blueprintjs/core';
import { Filters1D } from 'nmr-processing';
import type { Filter1DOptions } from 'nmr-processing';

import ActionButtons from '../elements/ActionButtons.js';
import Label from '../elements/Label.js';
import { Select2Controller } from '../elements/Select2Controller.js';
import { useFilter } from '../hooks/useFilter.js';
import {
  useZeroFilling,
  zeroFillingSizes,
} from '../panels/filtersPanel/Filters/hooks/useZeroFilling.js';

import { headerLabelStyle } from './Header.js';
import { HeaderWrapper } from './HeaderWrapper.js';

export function SimpleZeroFillingOptionsPanel() {
  const filter = useFilter(Filters1D.zeroFilling.id);
  const { control, submitHandler, register, handleCancelFilter } =
    useZeroFilling(
      filter as Extract<Filter1DOptions, { name: 'zeroFilling' }>,
      { applyFilterOnload: true },
    );

  const { onChange: onLivePreviewChange, ...otherLivePreviewRegisterOptions } =
    register('livePreview');
  return (
    <HeaderWrapper>
      <Label title="Size:" style={headerLabelStyle}>
        <Select2Controller
          control={control}
          name="nbPoints"
          items={zeroFillingSizes}
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
