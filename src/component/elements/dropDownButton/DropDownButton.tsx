import { Popover, Button } from '@blueprintjs/core';
import styled from '@emotion/styled';
import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { FaEllipsisH } from 'react-icons/fa';

import DropDownList from './DropDownList.js';

const PopoverButton = styled(Button)`
  border: 0.55px solid lightgray;
  border-radius: 5px;
`;
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
      <PopoverButton
        style={{ boxShadow: 'none', ...style }}
        rightIcon="chevron-down"
        onClick={() => setOpen((flag) => !flag)}
      >
        {!item ? <FaEllipsisH /> : formatSelectedValue(item)}
      </PopoverButton>
    </Popover>
  );
}

export default DropDownButton;
