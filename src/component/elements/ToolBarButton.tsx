import { Toolbar, ToolbarItemProps } from 'react-science/ui';

export function ToolBarButton(props: ToolbarItemProps) {
  return (
    <Toolbar>
      <Toolbar.Item {...props} />
    </Toolbar>
  );
}
