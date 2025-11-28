import styled from '@emotion/styled';
import type { DatabaseNMREntry } from 'nmr-processing';

import { filterDatabaseInfoEntry } from '../../utility/filterDatabaseInfoEntry.ts';

const Container = styled.div`
  display: flex;
`;

const Column = styled.div`
  padding: 5px;
  color: white;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  margin: 2px 0;
`;

const Key = styled(Column)`
  background-color: rgb(0 0 0 / 10%);
  flex: 1;
  margin-right: 5px;
`;

export function DatabaseInfo(props: { data: DatabaseNMREntry }) {
  const { data } = props;
  const meta = filterDatabaseInfoEntry(data);

  return (
    <Container>
      <Column>
        {Object.keys(meta).map((key, index) => {
          return <Key key={index}>{key}</Key>;
        })}
      </Column>
      <Column>
        {Object.keys(meta).map((key, index) => {
          return <Column key={index}>{meta[key]}</Column>;
        })}
      </Column>
    </Container>
  );
}
