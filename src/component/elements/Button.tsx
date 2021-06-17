import { Fragment, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onClick: () => void;
}

export default function Button({ onClick, ...props }: ButtonProps) {
  return (
    <Fragment>
      <button type="button" onClick={onClick} {...props} />
    </Fragment>
  );
}
