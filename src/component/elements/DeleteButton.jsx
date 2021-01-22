function DeleteButton({ x, y, onDelete, fill }) {
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

DeleteButton.defaultProps = {
  onDelete: () => null,
  fill: '#c81121',
  x: 'initial',
  y: 'initial',
};

export default DeleteButton;
