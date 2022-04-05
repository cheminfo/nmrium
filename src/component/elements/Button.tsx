/** @jsxImportSource @emotion/react */
import { css, SerializedStyles } from '@emotion/react';
import { ReactNode, ButtonHTMLAttributes, CSSProperties } from 'react';

type Size = 'small' | 'medium' | 'large';

type Color = CSSProperties['color'];

interface BaseColor {
  base: Color;
  hover: Color;
  active?: Color;
}

type Fill = 'clear' | 'outline' | 'solid';

type ColorTheme = 'success' | 'danger' | 'warning' | 'medium' | 'light';

type ColorPalettes = Record<
  ColorTheme,
  {
    base: Color;
    shade: Color;
    tint: Color;
  }
>;

const colorPalettes: ColorPalettes = {
  success: {
    base: '#2dd36f',
    shade: '#28ba62',
    tint: '#42d77d',
  },
  danger: {
    base: '#eb445a',
    shade: '#cf3c4f',
    tint: '#ed576b',
  },
  warning: {
    base: '#ffc409',
    shade: '#e0ac08',
    tint: '#ffca22',
  },
  medium: {
    base: '#92949c',
    shade: '#808289',
    tint: '#9d9fa6',
  },
  light: {
    base: '#f4f5f8',
    shade: '#d7d8da',
    tint: '#f5f6f9',
  },
};

const sizeConfig: Record<
  Size,
  Pick<CSSProperties, 'fontSize' | 'padding' | 'borderWidth'>
> = {
  small: {
    fontSize: 'small',
    padding: '0.5rem 1rem',
    borderWidth: '1px',
  },
  medium: {
    fontSize: 'medium',
    padding: '0.6rem 1.2rem',
    borderWidth: '2px',
  },
  large: {
    fontSize: 'large',
    padding: '0.7rem 1.4rem',
    borderWidth: '3px',
  },
};

interface ButtonStyle {
  color: BaseColor;
  size: Size;
  borderColor: Color;
  backgroundColor: BaseColor;
  borderRadius?: CSSProperties['borderRadius'];
  fill?: Fill;
}

interface Style {
  button: (props: ButtonStyle) => SerializedStyles;
}

function getFillStyle(props: ButtonStyle) {
  const { borderColor, fill, size, backgroundColor, color } = props;

  switch (fill) {
    case 'solid': {
      return css`
        border-color: transparent;
        border-width: ${sizeConfig[size].borderWidth};
        background-color: ${backgroundColor.base};
        color: ${color.base};
      `;
    }
    case 'outline': {
      return css`
        border-style: solid;
        border-color: ${backgroundColor.base};
        border-width: ${sizeConfig[size].borderWidth}px;
        background-color: transparent;
        color: ${backgroundColor.base};
      `;
    }

    case 'clear': {
      return css`
        border: none;
        background-color: transparent;
        color: ${backgroundColor.base};
      `;
    }
    default:
      return css`
        background-color: ${backgroundColor.base};
        color: ${color.base};
        border-color: ${borderColor};
      `;
  }
}

const styles: Style = {
  button: (props) => {
    const { size, backgroundColor, color, borderRadius } = props;

    const basic = css`
      display: flex;
      flex-direction: row;
      border-radius: ${borderRadius};
    `;

    const fillStyle = getFillStyle(props);

    const colorStyle = css`
      &:hover {
        background-color: ${backgroundColor.hover};
        color: ${color.hover};
      }
      &:active {
        background-color: ${backgroundColor?.active || backgroundColor.hover};
        color: ${color?.active || color.hover};
      }
    `;
    const { fontSize, padding } = sizeConfig[size];
    return css([{ fontSize, padding }, fillStyle, colorStyle, basic]);
  },
};

interface ButtonProps
  extends Partial<ButtonStyle>,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  onClick?: () => void;
  children: ReactNode;
}

const Button = (props: ButtonProps) => {
  const {
    onClick,
    size = 'small',
    color = { base: 'black', hover: 'white' },
    backgroundColor = { base: 'white', hover: 'black', active: 'black' },
    borderColor = 'transparent',
    fill,
    borderRadius = 0,
  } = props;

  return (
    <button
      type="button"
      onClick={onClick}
      css={styles.button({
        size,
        backgroundColor,
        color,
        borderColor,
        fill,
        borderRadius,
      })}
    >
      {props.children}
    </button>
  );
};

function ThemeButton(props: { colorTheme: ColorTheme } & ButtonProps) {
  const { base, shade, tint } = colorPalettes[props.colorTheme];

  const {
    color = { base: 'white', hover: 'white' },
    backgroundColor = {
      base: base,
      hover: shade,
      active: tint,
    },
    ...restProps
  } = props;
  return <Button {...{ ...restProps, backgroundColor, color }} />;
}

Button.Done = (props: ButtonProps) => {
  return <ThemeButton {...props} colorTheme="success" />;
};
Button.Danger = (props: ButtonProps) => {
  return <ThemeButton {...props} colorTheme="danger" />;
};
Button.Action = (props: ButtonProps) => {
  return <ThemeButton {...props} colorTheme="medium" />;
};

export default Button;
