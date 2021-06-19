import { css } from 'lit-element';

export const tableStyles = css`
  .table {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .table-row {
    display: flex;
    align-items: center;
    border-radius: 3px;
  }

  .table-row-item:hover {
    background-color: var(--gray-hover);
  }

  .table-row.header {
    text-transform: uppercase;
    padding-bottom: 1rem;
    font-size: 12px;
    color: var(--gray-light);
    font-weight: 500;
  }

  .table-cell {
    overflow: hidden;
    height: 100%;
    display: flex;
    align-items: center;
    padding: 0 6px;
  }

  .table-cell.title {
    flex: 2 0 auto;
    border-radius: 3px;
  }

  .table-row.title:hover {
    cursor: pointer;
  }

  .table-cell.date {
    width: 100px;
    color: var(--gray-light);
    text-align: center;
  }

  .table-cell.location {
    width: 200px;
    color: var(--gray-light);
    text-align: center;
  }

  .table-cell.actions {
    width: 60px;
    overflow: visible;
    text-align: center;
  }
`;
