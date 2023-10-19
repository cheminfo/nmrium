import { CSSProperties, ReactNode } from 'react';

type MessageType = 'success' | 'error' | 'warning' | 'info';

type Color = CSSProperties['color'];

type ColorPalettes = Record<
  MessageType,
  {
    base: Color;
    shade: Color;
    tint: Color;
  }
>;

export const messagesColorPalettes: Readonly<ColorPalettes> = {
  success: {
    base: '#2dd36f',
    shade: '#28ba62',
    tint: '#d6ffe6',
  },
  error: {
    base: '#eb445a',
    shade: '#cf3c4f',
    tint: '#ffd6db',
  },
  warning: {
    base: '#ffc409',
    shade: '#e0ac08',
    tint: '#fff5d6',
  },
  info: {
    base: '#5f5f5f',
    shade: '#545454',
    tint: '#ebebeb',
  },
};

interface MessageProps {
  type: MessageType;
  children: ReactNode;
  style?: CSSProperties;
}

function Message(props: MessageProps) {
  const { style = {}, type, children } = props;

  return (
    <div
      style={{
        padding: '0.375rem 0.75rem',
        borderRadius: '0.25rem',
        backgroundColor: messagesColorPalettes[type].tint,
        color: messagesColorPalettes[type].shade,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default Message;
