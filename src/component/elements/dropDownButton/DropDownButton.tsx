/** @jsxImportSource @emotion/react */
import { Popover, Button } from '@blueprintjs/core';
import { css } from '@emotion/react';
import { CSSProperties, ReactNode, useEffect, useState } from 'react';
import { FaEllipsisH } from 'react-icons/fa';

import DropDownList from './DropDownList';

export interface DropDownListItem {
  key: string;
  label: string;
}

export interface ItemProps {
  itemKey?: string;
  labelKey?: string;
  visibleKey?: string;
}

export interface DropDownListProps<T> {
  data: T[];
  renderItem?: ((item: DropDownListItem) => ReactNode) | null;
}

interface DropDownButtonProps<T> extends DropDownListProps<T>, ItemProps {
  selectedKey?: string;
  onSelect?: (item: DropDownListItem) => void;
  formatSelectedValue?: (Item: DropDownListItem) => string;
  style?: CSSProperties;
  className?: string;
}

function DropDownButton<T extends DropDownListItem>(
  props: DropDownButtonProps<T>,
) {
  const {
    data,
    selectedKey,
    onSelect,
    formatSelectedValue = (item) => item.label,
    renderItem = null,
    style = {},
    itemKey = 'key',
    labelKey = 'label',
    visibleKey = 'visible',
    className = '',
  } = props;
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState<DropDownListItem | null>();

  useEffect(() => {
    if (selectedKey) {
      const item = data.find((i) => i[itemKey] === selectedKey) || null;
      setItem(item);
    }
  }, [selectedKey, data, itemKey]);

  function selectHandler(index) {
    setOpen(false);
    setItem(data[index]);
    onSelect?.(data[index]);
  }

  return (
    <Popover
      isOpen={open}
      onClose={() => setOpen(false)}
      className={className}
      minimal
      position="bottom"
      content={
        <DropDownList
          data={data}
          onSelect={selectHandler}
          renderItem={renderItem}
          itemKey={itemKey}
          labelKey={labelKey}
          visibleKey={visibleKey}
        />
      }
    >
      <Button
        style={{ boxShadow: 'none', ...style }}
        css={css`
          border: 0.55px solid lightgray;
          border-radius: 5px;
        `}
        rightIcon="chevron-down"
        onClick={() => setOpen((flag) => !flag)}
      >
        {!item ? <FaEllipsisH /> : formatSelectedValue(item)}
      </Button>
    </Popover>
  );
}

export default DropDownButton;
