/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import * as Filters from '../../../data/Filters';
import { REFERENCES } from '../../../data/constants/References';
import { useDispatch } from '../../context/DispatchContext';
import ActionButtons from '../../elements/ActionButtons';
import CloseButton from '../../elements/CloseButton';
import Select from '../../elements/Select';
import FormikForm from '../../elements/formik/FormikForm';
import { APPLY_MULTIPLE_SPECTRA_FILTER } from '../../reducer/types/Types';
import Events from '../../utility/Events';
import { ModalStyles } from '../ModalStyle';

import EquallySpacedFilter from './EquallySpacedFilter';
import FromToFilter from './FromToFilter';

const baseList: Array<{
  key: string | number;
  value: number | string;
  label: string;
}> = [
  { key: 0, value: 0, label: 'Select Filter' },
  {
    key: Filters.fromTo.id,
    value: Filters.fromTo.id,
    label: Filters.fromTo.name,
  },
  {
    key: Filters.equallySpaced.id,
    value: Filters.equallySpaced.id,
    label: Filters.equallySpaced.name,
  },
  {
    key: Filters.standardDeviation.id,
    value: Filters.standardDeviation.id,
    label: Filters.standardDeviation.name,
  },
  {
    key: Filters.centerMean.id,
    value: Filters.centerMean.id,
    label: Filters.centerMean.name,
  },
  {
    key: Filters.pareto.id,
    value: Filters.pareto.id,
    label: Filters.pareto.name,
  },
];

const styles = css`
  .row {
    align-items: center;
  }

  .container {
    flex: 1;
  }

  .infoText {
    padding: 10px;
    font-size: 12px;
    text-align: left;
    color: white;
    background-color: #5f5f5f;
    border-radius: 5px;
  }
`;

interface MultipleSpectraFiltersModalProps {
  onClose?: () => void;
  nucleus?: string;
}

function MultipleSpectraFiltersModal({
  onClose = () => null,
  nucleus = '',
}: MultipleSpectraFiltersModalProps) {
  const refForm = useRef<any>();

  const dispatch = useDispatch();
  const [filter, setFilter] = useState('');

  const List = useMemo(() => {
    const list = REFERENCES[nucleus]
      ? Object.entries(REFERENCES[nucleus]).map(
          (item) => ({
            value: item[0],
            label: item[0],
          }),
          [],
        )
      : [];

    return baseList.concat(list as any);
  }, [nucleus]);

  const handleSave = useCallback((e) => {
    e.preventDefault();
    if (refForm.current) {
      refForm.current.submitForm();
    }
  }, []);

  const submitHandler = useCallback(
    (options) => {
      if (options) {
        dispatch({
          type: APPLY_MULTIPLE_SPECTRA_FILTER,
          payload: [{ name: filter, options }],
        });

        onClose();
      }
    },
    [dispatch, filter, onClose],
  );

  useEffect(() => {
    function handle(event: any) {
      const [from, to] = event.range;
      if (refForm.current) {
        refForm.current.setValues({ ...refForm.current.values, from, to });
      }
    }

    Events.on('brushEnd', handle);

    return () => {
      Events.off('brushEnd', handle);
    };
  }, []);

  const filterChangeHandler = useCallback((id) => {
    setFilter(id);
  }, []);

  const filterOptions = useMemo(() => {
    switch (filter) {
      case Filters.fromTo.id:
        return <FromToFilter onSubmit={submitHandler} ref={refForm} />;
      case Filters.equallySpaced.id:
        return <EquallySpacedFilter onSubmit={submitHandler} ref={refForm} />;
      default:
        <FormikForm
          ref={refForm}
          initialValues={null}
          onSubmit={submitHandler}
        />;
        break;
    }
  }, [filter, submitHandler]);

  return (
    <div css={[ModalStyles, styles]}>
      <div className="header handle">
        <span>Apply filters</span>
        <CloseButton onClick={onClose} className="close-bt" />
      </div>
      <div className="inner-content container">
        <p className="infoText">
          This filter will use the exclusions zones defined in the first
          spectrum.
        </p>
        <div className="row margin-10">
          <span className="custom-label">Filter :</span>

          <Select
            items={List}
            style={{ width: 275, height: 30, margin: 0 }}
            onChange={filterChangeHandler}
          />
        </div>
        {filterOptions}
      </div>
      <div className="footer-container">
        <ActionButtons
          style={{ flexDirection: 'row-reverse', margin: 0 }}
          onDone={handleSave}
          doneLabel="Save"
          onCancel={onClose}
          cancelLabel="Close"
        />
      </div>
    </div>
  );
}

export default MultipleSpectraFiltersModal;
