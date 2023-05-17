import { FaMinusCircle } from 'react-icons/fa';

export function RemoveAssignmentsButton({ onClick }) {
  return (
    <sup className="remove-assignment">
      <button
        type="button"
        style={{
          padding: 0,
          margin: 0,
        }}
        onClick={onClick}
      >
        <FaMinusCircle color="red" />
      </button>
    </sup>
  );
}
