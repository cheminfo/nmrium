import { ButtonProps } from '@blueprintjs/core';
import { FaFilter } from 'react-icons/fa';

import { ToolBarButton } from './ToolBarButton';

interface FilterButtonProps
  extends Pick<ButtonProps, 'onClick' | 'title' | 'disabled' | 'active'> {
  title: string;
}

export function FilterButton(props: FilterButtonProps) {
  return <ToolBarButton id="filter-button" {...props} icon={<FaFilter />} />;
}
