import { css } from 'lit-element';

export const sharedStyles = css`
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

  .margin-left {
    margin-left: 1rem;
  }

  .secondary-live {
    --primary: var(--secondary-live);
    --primary-color: var(--secondary-live-color);
  }
`;
