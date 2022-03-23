/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
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

  // button {
  //   text-transform: Capitalize;
  // }
`;

export interface DropDownListItem {
  key: string;
  label: string;
  index?: number;
}

export interface DropDownListProps {
  data: Array<DropDownListItem>;
  onSelect: (index: number) => void;
  renderItem?: ((item: DropDownListItem) => ReactNode) | null;
}

interface DropDownButtonProps extends Omit<DropDownListProps, 'onSelect'> {
  selectedKey?: string;
  onSelect?: (item: DropDownListItem) => void;
  formatSelectedValue?: (Item: DropDownListItem) => string;
}

function DropDownButton(props: DropDownButtonProps) {
  const {
    data,
    selectedKey,
    onSelect,
    formatSelectedValue = (item) => item.label,
    renderItem = null,
  } = props;
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState<DropDownListItem | null>();
  const { rootRef } = useGlobal();

  const drop = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedKey) {
      const item = data.find((i) => i.key === selectedKey) || null;
      setItem(item);
    }
  }, [selectedKey, data]);

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
      setItem(data[index]);
      onSelect?.(data[index]);
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
        {!item ? <FaEllipsisH /> : formatSelectedValue(item)}
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
