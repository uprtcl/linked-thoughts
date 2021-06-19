import { css } from 'lit-element';

export const tableStyles = css`
  .table {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .table-row {
    display: flex;
    padding: 0.6rem 0;
  }

  .table-row.header {
    text-transform: uppercase;
    padding-bottom: 1rem;
    font-size: 12px;
    color: var(--gray-light);
    font-weight: 500;
  }

  .table-cell.title {
    flex: 2 0 auto;
  }

  .table-cell.date {
    width: 100px;
    color: var(--gray-light);
  }

  .table-cell.location {
    width: 200px;
    color: var(--gray-light);
  }
`;
