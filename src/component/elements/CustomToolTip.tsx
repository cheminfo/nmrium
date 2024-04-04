/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { CSSProperties } from 'react';

const styles: Record<
  | 'titleContainer'
  | 'title'
  | 'description'
  | 'shortcutContainer'
  | 'shortcutItem',
  CSSProperties
> = {
  titleContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  title: {
    fontSize: '0.9rem',
    minWidth: '50%',
    padding: '5px 0',
    textAlign: 'left',
    color: 'white',
  },
  description: {
    paddingTop: '1rem',
    fontSize: '0.7rem',
    textAlign: 'left',
    color: 'white',
  },
  shortcutContainer: {
    display: 'flex',
    textWrap: 'nowrap',
    color: 'white',
  },
  shortcutItem: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0.2rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    height: 'calc(0.2rem + 20px)',
    minWidth: 'calc(0.2rem + 20px)' /* Adjust padding and border width */,
    marginLeft: '5px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
  },
};

interface ToolTipItem {
  title: string;
  shortcuts?: string[];
  subTitles?: ToolTipItem[];
  description?: string;
  link?: string;
}

export function CustomToolTip(props: ToolTipItem) {
  const {
    title,
    shortcuts = [],
    subTitles = [],
    description = '',
    link,
  } = props;

  return (
    <div
      style={{
        width: 250,
        padding: '0.5rem',
      }}
    >
      <div style={styles.titleContainer}>
        <span style={styles.title}>{title}</span>
        <ShortCuts shortcuts={shortcuts} />
      </div>
      <SubTitles items={subTitles} />

      {(description || link) && (
        <p style={styles.description}>
          {description}
          {link && (
            <a
              style={description ? { paddingLeft: '5px' } : {}}
              target="_blank"
              href={link}
              rel="noreferrer"
            >
              Learn more
            </a>
          )}
        </p>
      )}
    </div>
  );
}

function ShortCuts({
  shortcuts,
  style = {},
}: {
  shortcuts: string[];
  style?: CSSProperties;
}) {
  return (
    <div style={styles.shortcutContainer}>
      {shortcuts.map((key, index) => {
        return (
          <div
            key={key}
            style={{
              ...styles.shortcutItem,
              ...(index === 0 && { margin: 0 }),
              ...style,
            }}
          >
            <span>{key}</span>
          </div>
        );
      })}
    </div>
  );
}

const subTitleStyle = css`
  padding-left: 5px;
  list-style: none;

  li {
    position: relative;
    padding-left: 15px;
    box-sizing: border-box;

    &::before {
      position: absolute;
      top: 15px;
      left: 0;
      width: 10px;
      height: 1px;
      margin: auto;
      content: '';
      background-color: white;
    }

    &::after {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      width: 1px;
      height: 100%;
      content: '';
      background-color: white;
    }

    &:last-child::after {
      height: 15px;
    }
  }

  li:first-child {
    padding-top: 5px;

    &::before {
      top: 20px;
    }
  }
`;

function SubTitles({ items }: { items: ToolTipItem[] }) {
  if (!items || items.length === 0) return null;

  return (
    <ul css={subTitleStyle}>
      {items.map(({ shortcuts = [], title }) => (
        <li key={title}>
          <div style={styles.titleContainer}>
            <span style={{ ...styles.title, fontSize: '0.7rem' }}>{title}</span>
            <ShortCuts
              style={{ padding: '0.1rem', fontSize: '0.6rem' }}
              shortcuts={shortcuts}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
