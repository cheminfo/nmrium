import { FaCheck } from 'react-icons/fa';
import { Button, ButtonProps } from 'react-science/ui';

export function SaveButton(props: ButtonProps) {
  const { title = 'Save', onClick, ...otherProps } = props;

  return (
    <Button
      {...otherProps}
      minimal
      intent="success"
      onClick={onClick}
      icon={<FaCheck />}
      tooltipProps={{
        content: title,
        placement: 'bottom-start',
        intent: 'success',
        compact: true,
      }}
      style={{
        fontSize: '1.25em',
      }}
    />
  );
}
