/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FaEllipsisH } from 'react-icons/fa';

import DropDownList from './DropDownList';

const styles = css`
  // position: absolute;
  padding: 2px;
  border-radius: 10px;
  width: auto;
  display: inline-block;
  border: 0.55px solid lightgray;
  font-size: 10px;

  button {
    text-transform: Capitalize;
  }
`;

const DropDownButton = ({
  data,
  selectedKey,
  onSelect,
  formatSelectedValue,
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(selectedKey);

  const drop = useRef(null);
  function handleClick(e) {
    if (!e.target.closest(`.${drop.current.className}`) && open) {
      setOpen(false);
    }
  }
  useEffect(() => {
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  });

  const selectHandler = useCallback(
    (index) => {
      setValue(data[index].label);
      onSelect(data[index].key);
    },
    [data, onSelect],
  );

  return (
    <div className="dropdown" ref={drop} css={styles}>
      <button type="button" onClick={() => setOpen((open) => !open)}>
        {!value ? <FaEllipsisH /> : formatSelectedValue(value)}
      </button>
      {open && <DropDownList data={data} onSelect={selectHandler} />}
    </div>
  );
};

DropDownButton.defaultProps = {
  data: null,
  formatSelectedValue: (val) => val,
  value: null,
};

export default DropDownButton;
