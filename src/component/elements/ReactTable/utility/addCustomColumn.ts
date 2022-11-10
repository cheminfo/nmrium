import { Column } from '../ReactTable';

export type CustomColumn<T extends object> = Column<T> & { index: number };

export default function addCustomColumn<T extends object>(
  array,
  options: CustomColumn<T>,
) {
  const {
    index,
    Header = () => null,
    accessor = null,
    Cell = null,
    sortType = 'basic',
    enableRowSpan = false,
    style = {},
    id,
  } = options || {};

  array.push({
    index,
    ...(id && { id }),
    ...(accessor && { accessor }),
    ...(Cell && { Cell }),
    Header,
    sortType,
    enableRowSpan,
    style,
  });
}
