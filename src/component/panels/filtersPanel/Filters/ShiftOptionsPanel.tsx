import { Filter, Filters } from 'nmr-processing';
import { useForm } from 'react-hook-form';

import { useDispatch } from '../../../context/DispatchContext';
import Label from '../../../elements/Label';
import { NumberInput2Controller } from '../../../elements/NumberInput2Controller';
import { Sections } from '../../../elements/Sections';

import { FilterActionButtons } from './FilterActionButtons';
import { HeaderContainer, StickyHeader } from './InnerFilterHeader';

import { formLabelStyle } from '.';

const { shiftX, shift2DX, shift2DY } = Filters;

interface ShiftOptionsPanelProps {
  filter: Filter;
}

export default function ShiftOptionsPanel(props: ShiftOptionsPanelProps) {
  const { filter } = props;
  const dispatch = useDispatch();
  const {
    handleSubmit,
    control,
    formState: { isDirty },
  } = useForm({ defaultValues: filter.value });

  function handleCancelFilter() {
    dispatch({
      type: 'RESET_SELECTED_TOOL',
    });
  }

  function handleApplyFilter(values) {
    const { shift } = values;
    switch (filter.name) {
      case shiftX.id: {
        dispatch({
          type: 'SHIFT_SPECTRUM',
          payload: { shift },
        });
        break;
      }

      case shift2DX.id: {
        dispatch({
          type: 'SHIFT_SPECTRUM',
          payload: { shiftX: shift },
        });
        break;
      }

      case shift2DY.id: {
        dispatch({
          type: 'SHIFT_SPECTRUM',
          payload: { shiftY: shift },
        });
        break;
      }

      default:
        break;
    }
  }

  return (
    <>
      <StickyHeader>
        <HeaderContainer>
          <div />
          <FilterActionButtons
            onConfirm={() => handleSubmit(handleApplyFilter)()}
            onCancel={handleCancelFilter}
            disabledConfirm={!isDirty}
            disabledCancel={!isDirty}
          />
        </HeaderContainer>
      </StickyHeader>
      <Sections.Body>
        <Label title="Shift:" style={formLabelStyle}>
          <NumberInput2Controller
            control={control}
            name="shift"
            min={0}
            stepSize={1}
            debounceTime={250}
          />
        </Label>
      </Sections.Body>
    </>
  );
}
