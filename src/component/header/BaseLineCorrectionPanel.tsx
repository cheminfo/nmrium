import { Checkbox } from '@blueprintjs/core';
import { Select } from '@blueprintjs/select';
import { yupResolver } from '@hookform/resolvers/yup';
import has from 'lodash/has';
import { Filter, Filters, BaselineCorrectionOptions } from 'nmr-processing';
import { memo, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, useSelect } from 'react-science/ui';
import * as Yup from 'yup';

import { useDispatch } from '../context/DispatchContext';
import ActionButtons from '../elements/ActionButtons';
import Label from '../elements/Label';
import { NumberInput2 } from '../elements/NumberInput2';
import { SelectDefaultItem } from '../elements/Select2';
import { useFilter } from '../hooks/useFilter';

import { headerLabelStyle } from './Header';
import { HeaderContainer } from './HeaderContainer';

interface BaseLineCorrectionInnerPanelProps {
  filter: Filter | null;
}

const algorithmsList = ['airPLS', 'Polynomial'].map((val) => ({
  label: val,
  value: val.toLowerCase(),
}));

interface BaseOptions {
  algorithm: string;
  livePreview: boolean;
}
interface AirplsOptions extends BaseOptions {
  maxIterations: number;
  tolerance: number;
}
interface PolynomialOptions extends BaseOptions {
  degree: number;
}

const getData = (algorithm, filterValues: BaselineCorrectionOptions) => {
  const { zones, algorithm: baseAlgorithm, ...other } = filterValues;
  switch (algorithm) {
    case 'airpls': {
      const validation = Yup.object().shape({
        algorithm: Yup.string().required(),
        livePreview: Yup.boolean().required(),
        maxIterations: Yup.number().integer().min(1).required(),
        tolerance: Yup.number().moreThan(0).required(),
      });
      return {
        resolver: yupResolver(validation),
        values: {
          algorithm,
          livePreview: true,
          maxIterations: 100,
          tolerance: 0.001,
          ...(baseAlgorithm === 'airpls' ? other : {}),
        },
      };
    }
    case 'autoPolynomial':
    case 'polynomial': {
      const validation = Yup.object().shape({
        algorithm: Yup.string().required(),
        livePreview: Yup.boolean().required(),
        degree: Yup.number().integer().min(1).max(6).required(),
      });

      return {
        resolver: yupResolver(validation),
        values: {
          algorithm,
          livePreview: true,
          degree: 3,
          ...(baseAlgorithm === 'polynomial' ? other : {}),
        },
      };
    }
    default:
      return {
        resolver: yupResolver(
          Yup.object({
            livePreview: Yup.boolean().required(),
          }),
        ),
        values: { livePreview: true },
      };
  }
};

function BaseLineCorrectionInnerPanel(
  props: BaseLineCorrectionInnerPanelProps,
) {
  const dispatch = useDispatch();
  const previousPreviewRef = useRef<boolean>(true);
  const { algorithm: baseAlgorithm = 'polynomial' } =
    props?.filter?.value || {};
  const {
    value: algorithm,
    onItemSelect,
    ...defaultSelectProps
  } = useSelect<SelectDefaultItem>({
    defaultSelectedItem: algorithmsList.find(
      (item) => item.value === baseAlgorithm,
    ),
    itemTextKey: 'label',
  });

  const handleApplyFilter = (
    values,
    triggerSource: 'apply' | 'onChange' = 'apply',
  ) => {
    const { livePreview, ...options } = values;

    switch (triggerSource) {
      case 'onChange': {
        if (livePreview || previousPreviewRef !== livePreview) {
          dispatch({
            type: 'CALCULATE_BASE_LINE_CORRECTION_FILTER',
            payload: {
              options,
              livePreview,
            },
          });
        }
        break;
      }

      case 'apply': {
        dispatch({
          type: 'APPLY_BASE_LINE_CORRECTION_FILTER',
          payload: {
            options,
          },
        });
        break;
      }
      default:
        break;
    }
    previousPreviewRef.current = livePreview;
  };

  const handleCancelFilter = () => {
    dispatch({
      type: 'RESET_SELECTED_TOOL',
    });
  };

  const { resolver, values } = getData(
    algorithm?.value,
    props?.filter?.value || {},
  );

  const {
    handleSubmit,
    control,
    formState: { errors },
    register,
    reset,
  } = useForm<AirplsOptions | PolynomialOptions>({
    defaultValues: values,
    resolver: resolver as any,
  });

  function submitHandler() {
    void handleSubmit((values) => handleApplyFilter(values, 'onChange'))();
  }

  const { onChange: onLivePreviewChange, ...otherLivePreviewRegisterOptions } =
    register(`livePreview`);

  return (
    <HeaderContainer>
      <Label title="Algorithm: " style={headerLabelStyle}>
        <Select
          items={algorithmsList}
          filterable={false}
          itemsEqual="value"
          onItemSelect={(item) => {
            onItemSelect(item);
            const { values } = getData(item.value, props?.filter?.value || {});
            reset(values);
          }}
          {...defaultSelectProps}
        >
          <Button text={algorithm?.label} rightIcon="double-caret-vertical" />
        </Select>
      </Label>

      {algorithm && algorithm?.value === 'airpls' && (
        <div style={{ display: 'flex' }}>
          <Label title="Max iterations:" style={headerLabelStyle}>
            <Controller
              control={control}
              name="maxIterations"
              render={({ field }) => {
                const { name, value } = field;

                return (
                  <NumberInput2
                    name={name}
                    value={value}
                    min={0}
                    stepSize={1}
                    intent={has(errors, 'maxIterations') ? 'danger' : 'none'}
                    style={{ width: '60px' }}
                    debounceTime={250}
                    onValueChange={(valueAsNumber, valueAsString) => {
                      field.onChange(valueAsString);
                      submitHandler();
                    }}
                  />
                );
              }}
            />
          </Label>
          <Label title="Tolerance:" style={headerLabelStyle}>
            <Controller
              control={control}
              name="tolerance"
              render={({ field }) => {
                const { name, value } = field;

                return (
                  <NumberInput2
                    name={name}
                    value={value}
                    min={0}
                    stepSize={0.001}
                    majorStepSize={0.001}
                    minorStepSize={0.001}
                    intent={has(errors, 'tolerance') ? 'danger' : 'none'}
                    style={{ width: '60px' }}
                    debounceTime={250}
                    onValueChange={(valueAsNumber, valueAsString) => {
                      field.onChange(valueAsString);
                      submitHandler();
                    }}
                  />
                );
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
            <Controller
              control={control}
              name="degree"
              render={({ field }) => {
                const { name, value } = field;
                return (
                  <NumberInput2
                    name={name}
                    value={value}
                    min={1}
                    max={6}
                    intent={has(errors, 'degree') ? 'danger' : 'none'}
                    style={{ width: '60px' }}
                    debounceTime={250}
                    onValueChange={(valueAsNumber, valueAsString) => {
                      field.onChange(valueAsString);
                      submitHandler();
                    }}
                  />
                );
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

export default function BaseLineCorrectionPanel() {
  const filter = useFilter(Filters.baselineCorrection.id);
  return <MemoizedBaseLineCorrectionPanel filter={filter} />;
}
