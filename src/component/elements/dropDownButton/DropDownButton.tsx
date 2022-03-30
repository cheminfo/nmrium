/** @jsxImportSource @emotion/react */
import { css, CSSObject } from '@emotion/react';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { FaEllipsisH } from 'react-icons/fa';

import DropDownList from './DropDownList';

const styles = {
  container: css`
    position: relative;
    padding: 2px;
    border-radius: 10px;
    width: max-content;
    display: inline-block;
    border: 0.55px solid lightgray;
    font-size: 10px;
  `,
  button: css`
    width: 100%;
  `,
};

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
  style?: CSSObject;
}

function DropDownButton(props: DropDownButtonProps) {
  const {
    data,
    selectedKey,
    onSelect,
    formatSelectedValue = (item) => item.label,
    renderItem = null,
    style,
  } = props;
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState<DropDownListItem | null>();

  const drop = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedKey) {
      const item = data.find((i) => i.key === selectedKey) || null;
      setItem(item);
    }
  }, [selectedKey, data]);

  useEffect(() => {
    function handleClick() {
      setOpen(false);
    }
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const selectHandler = useCallback(
    (index) => {
      setItem(data[index]);
      onSelect?.(data[index]);
    },
    [data, onSelect],
  );

  return (
    <div className="dropdown" ref={drop} css={[styles.container, style]}>
      <button
        css={styles.button}
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
