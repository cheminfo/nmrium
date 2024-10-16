import type { ToolbarItemProps } from 'react-science/ui';
import { Toolbar } from 'react-science/ui';

export function ToolBarButton(props: ToolbarItemProps) {
  return (
    <Toolbar minimal>
      <Toolbar.Item {...props} />
    </Toolbar>
  );
}
