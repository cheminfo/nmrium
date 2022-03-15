/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FaEllipsisH } from 'react-icons/fa';

import { useGlobal } from '../../context/GlobalContext';

import DropDownList from './DropDownList';

const styles = css`
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

function defaultFormatSelectedValue(val) {
  return val;
}

function DropDownButton(props) {
  const {
    data = null,
    selectedKey,
    onSelect,
    formatSelectedValue = defaultFormatSelectedValue,
    renderItem = null,
  } = props;
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(selectedKey);
  const { rootRef } = useGlobal();

  const drop = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(
    (e) => {
      if (
        drop.current &&
        !e.target.closest(`.${drop.current.className}`) &&
        open
      ) {
        setTimeout(() => {
          setOpen(false);
        }, 0);
      }
    },
    [open],
  );
  useEffect(() => {
    if (rootRef) {
      rootRef.addEventListener('click', handleClick);
    }
    return () => rootRef.removeEventListener('click', handleClick);
  }, [handleClick, open, rootRef]);

  const selectHandler = useCallback(
    (index) => {
      setValue(data[index].label);
      onSelect(data[index].key);
    },
    [data, onSelect],
  );

  return (
    <div className="dropdown" ref={drop} css={styles}>
      <button
        type="button"
        onClick={(event) => {
          setOpen((open) => !open);
          event.stopPropagation();
        }}
      >
        {!value ? <FaEllipsisH /> : formatSelectedValue(value)}
      </button>
      {open && (
        <DropDownList
          data={data}
          onSelect={selectHandler}
          renderItem={renderItem}
        />
      )}
    </div>
  );
}

export default DropDownButton;
