import { FaTimes } from 'react-icons/fa';
import { Button, ButtonProps } from 'react-science/ui';

export function CloseButton(props: ButtonProps) {
  const { onClick, title = 'Close', ...otherProps } = props;
  return (
    <Button
      {...otherProps}
      minimal
      intent="danger"
      onClick={onClick}
      icon={<FaTimes />}
      tooltipProps={{
        content: title,
        placement: 'bottom-start',
        intent: 'danger',
        compact: true,
      }}
      style={{
        fontSize: '1.25em',
      }}
    />
  );
}
