/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Filters } from '../../../data/Filters';
import { REFERENCES } from '../../../data/constants/References';
import { useDispatch } from '../../context/DispatchContext';
import CloseButton from '../../elements/CloseButton';
import Select from '../../elements/Select';
import FormikForm from '../../elements/formik/FormikForm';
import { APPLY_MULTIPLE_SPECTRA_FILTER } from '../../reducer/types/Types';
import Events from '../../utility/Events';
import { ModalStyles } from '../ModalStyle';

import EquallySpacedFilter from './EquallySpacedFilter';
import FromToFilter from './FromToFilter';

const baseList = [
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
`;

function MultipleSpectraFiltersModal({ onClose, nucleus }) {
  const refForm = useRef();
  const dispatch = useDispatch();
  const [filter, setFilter] = useState(0);
  const List = useMemo(() => {
    const list = REFERENCES[nucleus]
      ? Object.entries(REFERENCES[nucleus]).map(
          (item) => ({
            key: item[0],
            value: item[0],
            label: item[0],
          }),
          [],
        )
      : [];

    return baseList.concat(list);
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
    Events.on('brushEnd', (event) => {
      const [from, to] = event.range;
      if (refForm.current) {
        refForm.current.setValues({ ...refForm.current.values, from, to });
      }
    });

    return () => {
      Events.off('brushEnd');
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
        <span>Spectra calibration</span>
        <CloseButton onClick={onClose} className="close-bt" />
      </div>
      <div className="inner-content">
        <div className="row margin-10">
          <span className="custom-label">Filter :</span>

          <Select
            data={List}
            style={{ width: 275, height: 30, margin: 0 }}
            onChange={filterChangeHandler}
          />
        </div>
        {filterOptions}
      </div>
      <div className="footer-container">
        <button type="button" onClick={handleSave} className="btn primary">
          Apply
        </button>
        <button type="button" onClick={onClose} className="btn">
          Close
        </button>
      </div>
    </div>
  );
}

export default MultipleSpectraFiltersModal;
