import { useRef } from 'react';
import { Transition as ContainerTransition } from 'react-transition-group';

import { transitions } from './options';

const duration = 250;

const defaultStyle = {
  [transitions.FADE]: {
    transition: `opacity ${duration}ms ease`,
    opacity: 0,
  },
  [transitions.SCALE]: {
    transform: 'scale(1)',
    transition: `all ${duration}ms ease-in-out`,
  },
};

const defaultTransitionStyles = {
  [transitions.FADE]: {
    entering: { opacity: 0 },
    entered: { opacity: 1 },
  },
  [transitions.SCALE]: {
    entering: { transform: 'scale(0)' },
    entered: { transform: 'scale(1)' },
    exiting: { transform: 'scale(0)' },
    exited: { transform: 'scale(1)' },
  },
};

export default function Transtion({
  children,
  type,
  transitionStyles = defaultTransitionStyles,
  ...props
}) {
  const ref = useRef(null);
  return (
    <ContainerTransition nodeRef={ref} {...props} timeout={duration}>
      {(state) => (
        <div
          ref={ref}
          style={{
            ...defaultStyle[type],
            ...transitionStyles[type][state],
            ...transitionStyles.default,
          }}
        >
          {children}
        </div>
      )}
    </ContainerTransition>
  );
}
