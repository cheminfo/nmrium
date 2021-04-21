/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Filters } from '../../../data/Filters';
import { REFERENCES } from '../../../data/constants/References';
import { useDispatch } from '../../context/DispatchContext';
import CloseButton from '../../elements/CloseButton';
import Select from '../../elements/Select';
import { APPLY_FROM_TO_FILTER } from '../../reducer/types/Types';
import Events from '../../utility/Events';
import { ModalStyles } from '../ModalStyle';

import FromToFilter from './FromToFilter';

const baseList = [
  { key: 0, value: 0, label: 'Select Filter' },
  {
    key: Filters.fromTo.id,
    value: Filters.fromTo.id,
    label: Filters.fromTo.name,
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
  const handleSave = useCallback(() => {
    if (refForm.current) {
      refForm.current.submitForm();
    }
  }, []);

  const submitHandler = useCallback(
    (options) => {
      switch (filter) {
        case Filters.fromTo.id:
          dispatch({ type: APPLY_FROM_TO_FILTER, payload: options });
          break;

        default:
          break;
      }
      onClose();
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
      default:
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
        <button type="button" onClick={handleSave} className="save-button">
          Done
        </button>
      </div>
    </div>
  );
}

export default MultipleSpectraFiltersModal;
