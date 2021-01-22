/** @jsxImportSource @emotion/react */
import { Fragment } from 'react';

function Button({ onClick, ...props }) {
  return (
    <Fragment>
      <button type="button" onClick={onClick} {...props} />
    </Fragment>
  );
}

export default Button;
