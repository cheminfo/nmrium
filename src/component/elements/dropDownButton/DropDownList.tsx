import styled from '@emotion/styled';

import type {
  DropDownListItem,
  DropDownListProps,
  ItemProps,
} from './DropDownButton.js';

const Menu = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;
const MenuItem = styled.li`
  text-align: center;
  white-space: nowrap;
  color: black;
  border-bottom: 0.55px solid #f9f9f9;

  &:last-of-type {
    border-bottom: none;
  }

  &:hover {
    background-color: #f6f6f6;
  }
`;

const Text = styled.span`
  padding: 5px 20px;
  display: block;
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
