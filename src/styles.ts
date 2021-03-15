import { css } from 'lit-element';

export const sharedStyles = css`
  :host {
    --primary: #2f80ed;
    --secondary: #333333;
    --white: #ffffff;
    --black: #000000;
    --black-transparent: rgba(3, 3, 3, 0.25);
    --gray: #333333;
    --border-radius-complete: 100vh;
    --background-color: #fffffb;
  }
  a {
    text-decoration: none;
  }
  .row {
    display: flex;
    flex-direction: row;
  }

  .column {
    display: flex;
    flex-direction: column;
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
