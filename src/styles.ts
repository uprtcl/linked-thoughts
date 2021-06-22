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

  .margin-left {
    margin-left: 1rem;
  }

  .secondary-live {
    --primary: var(--secondary-live);
    --primary-color: var(--secondary-live-color);
  }
`;
