import { Switch } from '@blueprintjs/core';
import { Filter } from 'nmr-processing';
import * as Yup from 'yup';

import Label from '../../../elements/Label';
import { NumberInput2Controller } from '../../../elements/NumberInput2Controller';
import { Sections } from '../../../elements/Sections';

import { FilterActionButtons } from './FilterActionButtons';
import { HeaderContainer, StickyHeader } from './InnerFilterHeader';
import { useSharedApodization } from './useSharedApodization';

import { formLabelStyle } from '.';

interface ApodizationOptionsProps {
  filter: Filter;
}

const advanceValidationSchema = Yup.object().shape({
  lineBroadening: Yup.number().required(),
  gaussBroadening: Yup.number().required(),
  lineBroadeningCenter: Yup.number().required().min(0).max(1),
  livePreview: Yup.boolean().required(),
});

export default function ApodizationOptionsPanel(
  props: ApodizationOptionsProps,
) {
  const { filter } = props;
  const {
    handleSubmit,
    control,
    submitHandler,
    handleApplyFilter,
    handleCancelFilter,
    register,
  } = useSharedApodization(filter, {
    validationSchema: advanceValidationSchema,
  });

  const { onChange: onLivePreviewFieldChange, ...livePreviewFieldOptions } =
    register('livePreview');
  return (
    <>
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
            onConfirm={() =>
              handleSubmit((values) => handleApplyFilter(values))()
            }
            onCancel={handleCancelFilter}
          />
        </HeaderContainer>
      </StickyHeader>
      <Sections.Body>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Label
            title="Line broadening:"
            shortTitle="LB:"
            style={formLabelStyle}
          >
            <NumberInput2Controller
              control={control}
              name="lineBroadening"
              debounceTime={250}
              stepSize={0.1}
              onValueChange={() => {
                submitHandler();
              }}
            />
          </Label>

          <Label
            title="Gauss broadening:"
            shortTitle="GB:"
            style={formLabelStyle}
          >
            <NumberInput2Controller
              control={control}
              name="gaussBroadening"
              debounceTime={250}
              stepSize={0.1}
              onValueChange={() => {
                submitHandler();
              }}
            />
          </Label>
          <Label
            title="Line broadening center [0 - 1]:"
            shortTitle="LB center:"
            style={formLabelStyle}
          >
            <NumberInput2Controller
              control={control}
              name="lineBroadeningCenter"
              debounceTime={250}
              min={0}
              max={1}
              stepSize={0.1}
              onValueChange={() => {
                submitHandler();
              }}
            />
          </Label>
        </div>
      </Sections.Body>
    </>
  );
}
