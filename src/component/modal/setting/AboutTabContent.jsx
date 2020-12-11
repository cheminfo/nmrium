/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { memo, useEffect, useState } from 'react';

async function getData(url) {
  try {
    const response = await fetch(url);
    return response.json();
  } catch (e) {
    return null;
  }
}

const baseUrl = 'https://api.github.com/repos/cheminfo/nmr-displayer';

const styles = css`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;

  span {
    font-weight: bold;
    color: #636363;
  }

  img {
    width: 100px;
  }

  a {
    // padding: 4px 0;
    color: #969696;
  }

  a:hover,
  a:focus {
    color: #00bcd4;
  }

  .separator {
    border-bottom: 1px solid gray;
    width: 15px;
    height: 1px;
    margin: 10px 0px;
  }
`;

const AboutTabContent = memo(() => {
  const [info, setInfo] = useState();
  useEffect(() => {
    Promise.all([
      getData(`${baseUrl}/commits`),
      getData(`${baseUrl}/tags`),
    ]).then((data) => {
      setInfo(data);
    });
  }, []);

  return info ? (
    <div css={styles}>
      <img src="./img/logo.svg" alt="" />
      <span>NMR Displayer </span>
      <span> {info[1][0].name}</span>

      <span className="separator" />

      <a href={info[1][0].zipball_url} target="_blank" rel="noreferrer">
        Download Last Version {info[1][0].name}
      </a>
      <span className="separator" />

      <a href={info[0][0].html_url} target="_blank" rel="noreferrer">
        Last Commit {new Date(info[0][0].commit.author.date).toUTCString()} [
        {info[0][0].sha.substr(0, 12)} ]
      </a>
    </div>
  ) : null;
});

export default AboutTabContent;
