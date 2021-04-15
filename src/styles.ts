import { css } from 'lit-element';

export const sharedStyles = css`
  :host {
    --primary: #4260f6;
    --secondary: #333333;
    --white: #ffffff;
    --black: #000000;
    --black-transparent: rgba(3, 3, 3, 0.25);
    --gray-dark: #333333;
    --gray-light: #828282;
    --gray-text: #9797aa;
    --border-radius-complete: 0.5rem;
    --background-color: #fffffb;
  }
  a,
  a:visited {
    text-decoration: none;
    color: inherit;
  }
  .row {
    display: flex;
    flex-direction: row;
  }

  .column {
    display: flex;
    flex-direction: column;
  }

  .center-items {
    justify-content: center;
    align-items: center;
  }

  .cursor-pointer {
    cursor: pointer;
  }
  .clickable {
    cursor: pointer;
    user-select: none;
  }
  .selected-item {
    background-color: #0002;
  }
  .selected-item:hover {
    background-color: #0003;
  }
  .list-overlay {
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0px;
    left: 0px;
    pointer-events: none;
    background-image: linear-gradient(
      0deg,
      rgba(255, 255, 255, 1),
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 0)
    );
  }
`;

export const tableStyles = css`
  .table {
    display: table;
    width: 100%;
    border-collapse: separate;
    font-family: 'Roboto', sans-serif;
    font-weight: 400;
  }

  .table_row {
    display: table-row;
  }

  .theader {
    display: table-row;
  }
  .theader:hover {
    background: #ccc5;
  }

  .table_header {
    display: table-cell;
    text-transform: uppercase;
    padding-top: 10px;
    padding-bottom: 10px;
    font-size: 1.3rem;
  }

  .table_header:first-child {
    border-top-left-radius: 5px;
  }

  .table_header:last-child {
    border-top-right-radius: 5px;
  }

  .table_small {
    display: table-cell;
    font-size: 1.2rem;
    padding-bottom: 0.5rem;
  }

  .table_row > .table_small > .table_cell:nth-child(odd) {
    display: none;
    background: #bdbdbd;
    color: #e5e5e5;
    padding-top: 10px;
    padding-bottom: 10px;
  }

  .table_row > .table_small > .table_cell {
    padding-top: 3px;
    padding-bottom: 3px;
    color: #5b5b5b;
    border-bottom: #ccc 1px solid;
  }

  .table_row > .table_small:first-child > .table_cell {
    border-left: #ccc 1px solid;
  }

  .table_row > .table_small:last-child > .table_cell {
    border-right: #ccc 1px solid;
  }

  .table_row:last-child > .table_small:last-child > .table_cell:last-child {
    border-bottom-right-radius: 5px;
  }

  .table_row:last-child > .table_small:first-child > .table_cell:last-child {
    border-bottom-left-radius: 5px;
  }

  .table_row:nth-child(2n + 3) {
    background: #e9e9e9;
  }

  @media screen and (max-width: 900px) {
    .table {
      width: 90%;
    }
  }

  @media screen and (max-width: 650px) {
    .table {
      display: block;
    }
    .table_row:nth-child(2n + 3) {
      background: none;
    }
    .theader {
      display: none;
    }
    .table_row > .table_small > .table_cell:nth-child(odd) {
      display: table-cell;
      width: 50%;
    }
    .table_cell {
      display: table-cell;
      /* width: 50%; */
    }
    .table_row {
      display: table;
      width: 100%;
      border-collapse: separate;
      padding-bottom: 20px;
      margin: 5% auto 0;
      text-align: center;
    }
    .table_small {
      display: table-row;
    }
    .table_row > .table_small:first-child > .table_cell:last-child {
      border-left: none;
    }
    .table_row > .table_small > .table_cell:first-child {
      border-left: #ccc 1px solid;
    }
    .table_row > .table_small:first-child > .table_cell:first-child {
      border-top-left-radius: 5px;
      border-top: #ccc 1px solid;
    }
    .table_row > .table_small:first-child > .table_cell:last-child {
      border-top-right-radius: 5px;
      border-top: #ccc 1px solid;
    }
    .table_row > .table_small:last-child > .table_cell:first-child {
      border-right: none;
    }
    .table_row > .table_small > .table_cell:last-child {
      border-right: #ccc 1px solid;
    }
    .table_row > .table_small:last-child > .table_cell:first-child {
      border-bottom-left-radius: 5px;
    }
    .table_row > .table_small:last-child > .table_cell:last-child {
      border-bottom-right-radius: 5px;
    }
  }
`;
