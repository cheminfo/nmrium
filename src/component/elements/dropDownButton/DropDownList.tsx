import styled from '@emotion/styled';

import type { DropDownListItem, DropDownListProps } from './DropDownButton.js';

const Menu = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;
`;
const MenuItem = styled.li`
  border-bottom: 0.55px solid #f9f9f9;
  color: black;
  text-align: center;
  white-space: nowrap;

  :last-of-type {
    border-bottom: none;
  }

  :hover {
    background-color: #f6f6f6;
  }
`;

const ItemButton = styled.button`
  display: block;
  width: 100%;
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  text-align: inherit;
  cursor: pointer;
`;

const Text = styled.span`
  display: block;
  padding: 5px 20px;
`;

interface InnerDropDownListProps<T> extends DropDownListProps<T> {
  onSelect: (index: number) => void;
}

function DropDownList({
  data = [],
  onSelect,
  renderItem = null,
}: InnerDropDownListProps<DropDownListItem>) {
  return (
    <div>
      <Menu>
        {data.map((item, index) => (
          <MenuItem
            key={item.key}
            style={{
              display: !('visible' in item) || item.visible ? 'block' : 'none',
            }}
          >
            <ItemButton
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(index);
              }}
            >
              {renderItem?.(item) || <Text>{item.label}</Text>}
            </ItemButton>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}

export default DropDownList;
