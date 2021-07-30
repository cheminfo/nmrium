interface DeleteButtonProps {
  onDelete?: () => void;
  fill?: string;
  x: string | number;
  y: string | number;
}

function DeleteButton(props: DeleteButtonProps) {
  const {
    x = 'initial',
    y = 'initial',
    onDelete = () => null,
    fill = '#c81121',
  } = props;

  return (
    <svg
      className="delete-button"
      x={x}
      y={y}
      onClick={onDelete}
      data-no-export="true"
    >
      <rect rx="5" width="16" height="16" fill={fill} />
      <line x1="5" x2="10" y1="8" y2="8" stroke="white" strokeWidth="2" />
    </svg>
  );
}

export default DeleteButton;
