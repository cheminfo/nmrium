import styled from '@emotion/styled';

import type {
  DropDownListItem,
  DropDownListProps,
  ItemProps,
} from './DropDownButton.js';

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

  &:last-of-type {
    border-bottom: none;
  }

  &:hover {
    background-color: #f6f6f6;
  }
`;

const Text = styled.span`
  display: block;
  padding: 5px 20px;
`;

interface InnerDropDownListProps<T>
  extends DropDownListProps<T>,
    Required<ItemProps> {
  onSelect: (index: number) => void;
}

function DropDownList({
  data = [],
  onSelect,
  renderItem = null,
  itemKey,
  labelKey,
  visibleKey,
}: InnerDropDownListProps<DropDownListItem>) {
  return (
    <div>
      <Menu>
        {data.map((item, index) => (
          <MenuItem
            key={item[itemKey]}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(index);
            }}
            style={{
              display:
                !(visibleKey in item) || item[visibleKey] ? 'block' : 'none',
              cursor: 'pointer',
            }}
          >
            {renderItem?.(item) || <Text>{item[labelKey]}</Text>}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}

export default DropDownList;
