import { Button, Popover } from '@blueprintjs/core';
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
  visible?: boolean;
}

export interface DropDownListProps<T> {
  data: T[];
  renderItem?: ((item: DropDownListItem) => ReactNode) | null;
}

interface DropDownButtonProps<T> extends DropDownListProps<T> {
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
    className = '',
  } = props;
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState<DropDownListItem | null>();

  useEffect(() => {
    if (selectedKey) {
      const item = data.find((i) => i.key === selectedKey) || null;
      setItem(item);
    }
  }, [selectedKey, data]);

  function selectHandler(index: any) {
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
        />
      }
    >
      <PopoverButton
        style={{ boxShadow: 'none', ...style }}
        endIcon="chevron-down"
        onClick={() => setOpen((flag) => !flag)}
      >
        {!item ? <FaEllipsisH /> : formatSelectedValue(item)}
      </PopoverButton>
    </Popover>
  );
}

export default DropDownButton;
