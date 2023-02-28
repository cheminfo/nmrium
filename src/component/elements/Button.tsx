/** @jsxImportSource @emotion/react */
import { css, CSSObject, SerializedStyles } from '@emotion/react';
import {
  ReactNode,
  ButtonHTMLAttributes,
  CSSProperties,
  MouseEvent,
} from 'react';
import { FaInfoCircle } from 'react-icons/fa';

type Size = 'xSmall' | 'small' | 'medium' | 'large';

type Color = CSSProperties['color'];

interface BaseColor {
  base: Color;
  hover: Color;
  active?: Color;
}

type Fill = 'clear' | 'outline' | 'solid';

type ColorTheme =
  | 'success'
  | 'danger'
  | 'warning'
  | 'medium'
  | 'light'
  | 'secondary';

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
  secondary: {
    base: '#3880ff',
    shade: '#3171e0',
    tint: '#4c8dff',
  },
};

const sizeConfig: Record<
  Size,
  Pick<CSSProperties, 'fontSize' | 'padding' | 'borderRadius'>
> = {
  xSmall: {
    fontSize: '0.75rem',
    padding: '0.15rem 0.3rem',
    borderRadius: '0.15rem',
  },
  small: {
    fontSize: '0.8rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.2rem',
  },
  medium: {
    fontSize: '1rem',
    padding: '0.375rem 0.75rem',
    borderRadius: '0.25rem',
  },
  large: {
    fontSize: '1.25rem',
    padding: '0.5rem 1rem',
    borderRadius: '0.3rem',
  },
};

interface ButtonStyle {
  color: BaseColor;
  size: Size;
  borderColor: Color;
  backgroundColor: BaseColor;
  borderRadius?: CSSProperties['borderRadius'];
  fill?: Fill;
  style?: CSSObject;
}

interface Style {
  button: (props: ButtonStyle) => SerializedStyles;
}

function getFillStyle(props: ButtonStyle) {
  const { borderColor, fill, backgroundColor, color } = props;

  switch (fill) {
    case 'solid': {
      return css`
        border-color: transparent;
        background-color: ${backgroundColor.base};
        color: ${color.hover};
      `;
    }
    case 'outline': {
      return css`
        border-style: solid;
        border-color: ${backgroundColor.base};
        background-color: transparent;
        color: ${color.base};
      `;
    }

    case 'clear': {
      return css`
        border-color: transparent;
        background-color: transparent;
        color: ${color.base};
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
    const {
      size,
      backgroundColor: { hover, active },
      color,
      borderRadius,
    } = props;

    const basic = css`
      display: flex;
      flex-direction: row;
      border-width: 1px;
      align-items: center;

      &:hover + .content {
        display: flex;
      }
    `;

    const fillStyle = getFillStyle(props);

    const colorStyle = css`
      &:disabled {
        opacity: 0.25;
      }

      &:not([disabled]):hover {
        background-color: ${hover};
        color: ${color.hover};
      }

      &:not([disabled]):active {
        background-color: ${active || hover};
        color: ${color?.active || color.hover};
      }
    `;

    return css([
      basic,
      sizeConfig[size],
      fillStyle,
      colorStyle,
      { borderRadius },
    ]);
  },
};

type TooltipOrientation = 'vertical' | 'horizontal';

//based on the tooltip from react-science
const toolTipStyle = (orientation: TooltipOrientation) => {
  const common: CSSObject = {
    display: 'none',
    position: 'absolute',
    backgroundColor: 'gray',
    borderRadius: '2px',
    color: 'white',
    bottom: '0px',
    right: '0px',
    width: 'fit-content',
    height: '100%',
    fontSize: '0.875em',
    whiteSpace: 'nowrap',
    paddingLeft: '3px',
    paddingRight: '3px',
    pointerEvents: 'none',
    zIndex: 99,
  };

  return css([
    common,
    orientation === 'horizontal' && { margin: 'auto', marginLeft: '5px' },
    orientation === 'vertical'
      ? { top: 'calc(100% + 5px)' }
      : { top: '0px', left: 'calc(100%)' },
  ]);
};

interface ButtonProps
  extends Partial<ButtonStyle>,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color' | 'style'> {
  onClick?: (event?: MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
  toolTip?: string;
  tooltipOrientation?: TooltipOrientation;
}

function Button(props: ButtonProps) {
  const {
    onClick,
    size = 'small',
    color = { base: 'black', hover: 'white' },
    backgroundColor = { base: 'white', hover: 'black', active: 'black' },
    borderColor = 'transparent',
    fill,
    borderRadius,
    style = {},
    toolTip,
    tooltipOrientation = 'vertical',
    ...restProps
  } = props;

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={onClick}
        css={[
          styles.button({
            size,
            backgroundColor,
            color,
            borderColor,
            fill,
            borderRadius,
          }),
          style,
        ]}
        {...restProps}
      >
        <span style={{ flex: 1, pointerEvents: 'none' }}>
          {' '}
          {props.children}
        </span>
      </button>
      {toolTip && (
        <div className="content" css={toolTipStyle(tooltipOrientation)}>
          <span
            style={{
              display: 'flex',
              margin: 'auto',
              justifyContent: 'center',
            }}
          >
            {toolTip}
          </span>
        </div>
      )}
    </div>
  );
}

function ThemeButton(props: { colorTheme: ColorTheme } & ButtonProps) {
  const { colorTheme, ...buttonProps } = props;
  const { base, shade, tint } = colorPalettes[colorTheme];

  const {
    color = { base: shade, hover: 'white' },
    backgroundColor = {
      base,
      hover: shade,
      active: tint,
    },
    fill = 'solid',
    ...restProps
  } = buttonProps;
  return <Button {...{ fill, ...restProps, backgroundColor, color }} />;
}

Button.Done = function ButtonDone(props: ButtonProps) {
  return <ThemeButton {...props} colorTheme="success" />;
};
Button.Danger = function ButtonDanger(props: ButtonProps) {
  return <ThemeButton {...props} colorTheme="danger" />;
};
Button.Action = function ButtonAction(props: ButtonProps) {
  return <ThemeButton {...props} colorTheme="medium" />;
};
Button.Secondary = function ButtonAction(props: ButtonProps) {
  return <ThemeButton {...props} colorTheme="secondary" />;
};
Button.Info = function ButtonInfo(props: Omit<ButtonProps, 'children'>) {
  return (
    <Button {...props}>
      <FaInfoCircle />
    </Button>
  );
};

Button.BarButton = function BarButton(props: ButtonProps) {
  const { ...otherProps } = props;
  return (
    <Button
      {...{
        backgroundColor: { base: 'white', hover: '#f7f7f7', active: '#e7e7e7' },
        color: {
          base: 'black',
          hover: 'black',
        },
        style: { padding: '0.25rem' },
        ...otherProps,
      }}
    />
  );
};

export default Button;
