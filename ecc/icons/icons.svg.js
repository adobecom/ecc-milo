import { getLibs } from '../scripts/utils.js';

const { svg } = await import(`${getLibs()}/deps/lit-all.min.js`);
// FIXME : use global footer icons instead.
// eslint-disable-next-line import/prefer-default-export
export const icons = svg`<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">

<symbol id="footer-icon-globe" viewBox="0 0 50 50">
  <path d="M50 23.8c-.2-3.3-1-6.5-2.4-9.5A24.81 24.81 0 0 0 26.2 0h-2.4C14.6.4 6.3 5.9 2.4 14.3 1 17.3.2 20.5 0 23.8v2.4c.2 3.3 1 6.5 2.4 9.5 4 8.4 12.2 13.9 21.4 14.3h2.4c9.2-.4 17.5-5.9 21.4-14.3 1.4-3 2.2-6.2 2.4-9.5v-2.4zm-2.4 0h-9.5c0-3.2-.4-6.4-1.2-9.5H45c1.6 2.9 2.5 6.2 2.6 9.5zm-14-11.9h-7.4V2.6c3.1.7 5.7 4.5 7.4 9.3zm-9.8-9.3v9.3h-7.4c1.7-4.8 4.3-8.6 7.4-9.3zm0 11.7v9.5h-9.5c.1-3.2.6-6.4 1.4-9.5h8.1zm0 11.9v9.5h-8.1c-.8-3.1-1.3-6.3-1.4-9.5h9.5zm0 11.9v9.3c-3.1-.7-5.7-4.5-7.4-9.3h7.4zm2.4 9.3v-9.3h7.4c-1.7 4.8-4.3 8.6-7.4 9.3zm0-11.7v-9.5h9.5c-.1 3.2-.6 6.4-1.4 9.5h-8.1zm0-11.9v-9.5h8.1c.8 3.1 1.3 6.3 1.4 9.5h-9.5zm17.1-11.9h-7.1c-.9-3.1-2.4-6.1-4.5-8.6 4.7 1.5 8.8 4.5 11.6 8.6zM18.6 3.3c-2.2 2.5-3.8 5.4-4.8 8.6H6.7c2.9-4.1 7.1-7.1 11.9-8.6zM5 14.3h8.1c-.7 3.1-1.1 6.3-1.2 9.5H2.4c.1-3.3 1-6.6 2.6-9.5zM2.4 26.2h9.5c0 3.2.4 6.4 1.2 9.5H5c-1.6-2.9-2.5-6.2-2.6-9.5zm4 11.9h7.4c.9 3.1 2.4 6.1 4.5 8.6-4.7-1.5-8.8-4.5-11.7-8.6h-.2zm25 8.6c2.2-2.5 3.8-5.4 4.8-8.6h7.4c-3 4.1-7.3 7.2-12.2 8.6zm13.6-11h-8.1c.7-3.1 1.1-6.3 1.2-9.5h9.5c-.1 3.3-1 6.6-2.6 9.5z"></path>
</symbol>

<symbol id="footer-icon-adchoices" viewBox="0 0 9 9">
  <path d="M7.99 5.23c.78-.43.92-.97.01-1.51L1.61.23C.83-.21.2.15.2 1.03v6.88c0 1.13.59 1.24 1.37.82l.73-.41c.12-.08.4-.32.32-.64-.07-.3-.33-.39-.62-.31-.44.24-.71 0-.71-.49v-4.9c0-.49.35-.69.78-.45l4.41 2.52c.43.25.43.64-.01.88L3.75 6.34V4.67a.47.47 0 1 0-.94 0v2.37c0 .26.22.44.47.53.1.04.3.05.44-.03l4.27-2.31z"></path><path d="M3.79 3.42a.5.5 0 1 1-.98 0 .5.5 0 0 1 .98 0"></path>
</symbol>

<symbol id="footer-icon-facebook" viewBox="0 0 35 35">
  <path fill="currentColor" d="M28.44 0a6.32 6.32 0 0 1 4.63 1.93A6.32 6.32 0 0 1 35 6.55v21.88A6.57 6.57 0 0 1 28.44 35h-4.29V21.44h4.54l.68-5.28h-5.22v-3.38a2.92 2.92 0 0 1 .54-1.91 2.66 2.66 0 0 1 2.08-.64l2.78-.02V5.49a30.54 30.54 0 0 0-4.05-.2 6.77 6.77 0 0 0-4.96 1.82 6.9 6.9 0 0 0-1.85 5.15v3.9h-4.56v5.28h4.55V35H6.57a6.32 6.32 0 0 1-4.63-1.93A6.32 6.32 0 0 1 0 28.45V6.56a6.32 6.32 0 0 1 1.93-4.63A6.32 6.32 0 0 1 6.55 0Z"></path>
</symbol>

<symbol id="footer-icon-instagram" viewBox="0 0 20.503 20.503">
  <path fill="currentcolor" d="M10.251,1.847c2.737,0,3.061.01,4.142.06a5.674,5.674,0,0,1,1.9.353,3.177,3.177,0,0,1,1.179.767,3.176,3.176,0,0,1,.767,1.179,5.673,5.673,0,0,1,.353,1.9c.049,1.081.06,1.405.06,4.142s-.01,3.061-.06,4.142a5.673,5.673,0,0,1-.353,1.9A3.395,3.395,0,0,1,16.3,18.243a5.673,5.673,0,0,1-1.9.353c-1.081.049-1.4.06-4.142.06s-3.062-.01-4.142-.06a5.672,5.672,0,0,1-1.9-.353,3.176,3.176,0,0,1-1.179-.767A3.176,3.176,0,0,1,2.26,16.3a5.673,5.673,0,0,1-.353-1.9c-.049-1.081-.06-1.405-.06-4.142s.01-3.061.06-4.142a5.673,5.673,0,0,1,.353-1.9,3.176,3.176,0,0,1,.767-1.179A3.176,3.176,0,0,1,4.205,2.26a5.674,5.674,0,0,1,1.9-.353c1.081-.049,1.405-.06,4.142-.06m0-1.847C7.467,0,7.118.012,6.025.062A7.525,7.525,0,0,0,3.536.538,5.025,5.025,0,0,0,1.721,1.721,5.025,5.025,0,0,0,.538,3.536,7.525,7.525,0,0,0,.062,6.025C.012,7.118,0,7.467,0,10.251s.012,3.133.062,4.227a7.525,7.525,0,0,0,.477,2.488,5.025,5.025,0,0,0,1.182,1.816,5.025,5.025,0,0,0,1.816,1.182,7.525,7.525,0,0,0,2.488.477c1.093.05,1.442.062,4.227.062s3.133-.012,4.227-.062a7.525,7.525,0,0,0,2.488-.477,5.242,5.242,0,0,0,3-3,7.524,7.524,0,0,0,.477-2.488c.05-1.093.062-1.442.062-4.227s-.012-3.133-.062-4.227a7.525,7.525,0,0,0-.477-2.488,5.025,5.025,0,0,0-1.182-1.816A5.025,5.025,0,0,0,16.966.538,7.525,7.525,0,0,0,14.478.062C13.385.012,13.035,0,10.251,0Zm0,4.987a5.264,5.264,0,1,0,5.264,5.264A5.264,5.264,0,0,0,10.251,4.987Zm0,8.681a3.417,3.417,0,1,1,3.417-3.417A3.417,3.417,0,0,1,10.251,13.668Zm6.7-8.889a1.23,1.23,0,1,1-1.23-1.23A1.23,1.23,0,0,1,16.954,4.779Z"/>
</symbol>

<symbol id="footer-icon-twitter" viewBox="0 0 35 35">
  <path fill="currentColor" d="M28.5 0h-22C2.9 0 0 2.9 0 6.5v22C0 32.1 2.9 35 6.5 35h22c3.6 0 6.5-2.9 6.5-6.5v-22C35 2.9 32.1 0 28.5 0zM30 30.4h-5.9c-.3 0-.6-.1-.8-.4L16 21l-7.3 9.1c-.2.2-.5.4-.8.4-.2 0-.4-.1-.6-.2-.4-.3-.5-1-.2-1.4l7.6-9.5L4.2 6.2c-.4-.4-.3-1.1.1-1.4.2-.2.4-.2.7-.2h5.9c.3 0 .6.1.8.4l7.3 9 7.3-9.1c.3-.4 1-.5 1.4-.2.4.3.5 1 .2 1.4l-7.6 9.5 10.5 13.1c.2.2.3.4.3.7-.1.6-.5 1-1.1 1zm-2.1-2h-3.3L7.1 6.6h3.3l17.5 21.8z"></path>
</symbol>

<symbol id="footer-icon-linkedin" viewBox="0 0 35 35">
  <path fill="currentColor" d="M5.4 29.3h5.26V13.49H5.4ZM11 8.61a2.7 2.7 0 0 0-.81-1.96 2.9 2.9 0 0 0-2.12-.78 3.03 3.03 0 0 0-2.16.78 2.56 2.56 0 0 0-.83 1.96 2.6 2.6 0 0 0 .81 1.95 2.9 2.9 0 0 0 2.11.79h.02a3 3 0 0 0 2.17-.79A2.59 2.59 0 0 0 11 8.61ZM24.34 29.3h5.26v-9.07a7.56 7.56 0 0 0-1.66-5.3 5.7 5.7 0 0 0-4.4-1.8 5.3 5.3 0 0 0-4.76 2.66h.04v-2.3h-5.26q.07 1.5 0 15.81h5.26v-8.84a3.75 3.75 0 0 1 .16-1.27 3.52 3.52 0 0 1 1.03-1.36 2.58 2.58 0 0 1 1.68-.56q2.64 0 2.65 3.58ZM35 6.56v21.88A6.57 6.57 0 0 1 28.44 35H6.56a6.32 6.32 0 0 1-4.63-1.93A6.32 6.32 0 0 1 0 28.45V6.56a6.32 6.32 0 0 1 1.93-4.63A6.32 6.32 0 0 1 6.55 0h21.88a6.32 6.32 0 0 1 4.63 1.93A6.32 6.32 0 0 1 35 6.55Z"></path>
</symbol>

<symbol id="footer-icon-pinterest" viewBox="0 0 35 35">
  <path fill="currentColor" d="M27.7 0H7.3C3.3 0 0 3.3 0 7.3v20.4c0 4 3.3 7.3 7.3 7.3h20.4c4 0 7.3-3.3 7.3-7.3V7.3c0-4-3.3-7.3-7.3-7.3zm-10 29.3c-1.2 0-2.4-.2-3.4-.5.5-.8 1.2-2.1 1.5-3.2.1-.5.7-2.8.7-2.8.4.7 1.5 1.3 2.7 1.3 3.5 0 6-3.2 6-7.2S22 10.3 18 10.3c-5 0-7.7 3.4-7.7 7 0 1.7.9 3.8 2.4 4.5.2.1.3.1.4-.2 0-.2.2-1 .3-1.3 0-.1 0-.2-.1-.3-.5-.6-.9-1.7-.9-2.7 0-2.6 1.9-5 5.3-5 2.9 0 4.9 2 4.9 4.7 0 3.1-1.6 5.3-3.7 5.3-1.1 0-2-.9-1.7-2.1.3-1.4 1-2.9 1-3.9 0-.9-.5-1.6-1.5-1.6-1.2 0-2.1 1.2-2.1 2.8 0 1 .3 1.7.3 1.7s-1.2 4.9-1.4 5.8c-.2 1.1-.1 2.6 0 3.5C9.1 26.9 6 22.6 6 17.6 6 11.2 11.2 6 17.6 6s11.7 5.2 11.7 11.7-5.2 11.6-11.6 11.6z"></path>
</symbol>

<symbol id="footer-icon-discord" viewBox="0 0 35 35">
  <g fill="currentColor"><path d="M22.1 15.7c-1.4 0-2.5 1.3-2.5 2.8s1.1 2.8 2.5 2.8 2.5-1.3 2.5-2.8c0-1.5-1.1-2.8-2.5-2.8zM12.9 15.7c-1.4 0-2.5 1.3-2.5 2.8s1.1 2.8 2.5 2.8 2.5-1.3 2.5-2.8c0-1.5-1.1-2.8-2.5-2.8z"></path><path d="M27.7 0H7.3C3.3 0 0 3.3 0 7.3v20.4c0 4 3.3 7.3 7.3 7.3h20.4c4 0 7.3-3.3 7.3-7.3V7.3c0-4-3.3-7.3-7.3-7.3zm3.6 24.5c-.1 0-.1 0 0 0-2.4 1.8-4.7 2.9-7 3.6h-.1c-.5-.7-1-1.5-1.4-2.3v-.1c.8-.3 1.5-.6 2.2-1 .1 0 .1-.1 0-.1-.1-.1-.3-.2-.4-.3h-.1c-4.5 2.1-9.4 2.1-13.9 0h-.1c-.1.1-.3.2-.4.3-.1 0 0 .1 0 .1.7.4 1.4.7 2.2 1 0 0 .1.1 0 .1-.4.8-.9 1.6-1.4 2.3h-.1c-2.3-.7-4.6-1.8-6.9-3.5v-.1c-.6-5.2.3-10.4 3.9-15.8 1.8-.8 3.7-1.4 5.6-1.8h.1l.7 1.4c2.1-.3 4.2-.3 6.3 0l.7-1.4h.1c2 .3 3.9.9 5.6 1.8 3.4 4.6 4.9 9.8 4.4 15.8z"></path></g>
</symbol>

<symbol id="footer-icon-behance" viewBox="0 0 35 35">
  <path fill="currentColor" d="M12 21.9H8.8V19H12c2.8 0 3 2.9 0 2.9zm9.9-3.9h4.4c-.2-2.5-4-2.9-4.4 0zm-10-4.9H8.8V16h3.5c2.4 0 2.8-2.9-.4-2.9zM35 7.3v20.4c0 4-3.3 7.3-7.3 7.3H7.3c-4 0-7.3-3.3-7.3-7.3V7.3C0 3.3 3.3 0 7.3 0h20.4c4 0 7.3 3.3 7.3 7.3zm-14.6 4.4h7.3v-1.5h-7.3v1.5zm-5.2 5.2c2.8-1.4 2.7-6.6-2.6-6.7H5.8v14.6h6.3c6.6 0 6.5-6.6 3.1-7.9zm13.9.9c-.4-2.6-2.2-4.3-5.2-4.3-3.1 0-4.9 2-4.9 5.8s2 5.5 5 5.5 4.5-1.7 5-2.9h-3.1c-1.1 1.2-4.2.8-4-2h7.4c-.1-.9-.2-1.6-.2-2.1z"></path>
</symbol>

<symbol id="footer-icon-youtube" viewBox="0 0 35 35">
  <path fill="currentColor" d="M27.7 0H7.3C3.3 0 0 3.3 0 7.3v20.4c0 4 3.3 7.3 7.3 7.3h20.4c4 0 7.3-3.3 7.3-7.3V7.3c0-4-3.3-7.3-7.3-7.3zm2.6 23.9a3.3 3.3 0 0 1-2.3 2.4c-3.3.8-17.9.7-20.9 0-1.2-.3-2.1-1.2-2.4-2.4-.8-3.1-.7-9.8 0-12.8A3.3 3.3 0 0 1 7 8.7c4.4-.9 19.4-.6 20.9 0 1.2.3 2.1 1.2 2.4 2.4.8 3.3.8 9.5 0 12.8z"></path><path fill="currentColor" d="m14.9 21.5 7-4-7-4z"></path>
</symbol>

<symbol id="footer-icon-weibo" viewBox="0 0 18 18">
  <path fill="currentColor" d="M15.94 3.35a4.1 4.1 0 0 0-3.9-1.26.6.6 0 1 0 .25 1.16A2.92 2.92 0 0 1 15.67 7a.6.6 0 0 0 1.13.37 4.1 4.1 0 0 0-.86-4.02Z"></path><path fill="currentColor" d="M14.38 4.77a2 2 0 0 0-1.9-.62.51.51 0 1 0 .21 1 .98.98 0 0 1 1.14 1.26.51.51 0 1 0 .97.31 2 2 0 0 0-.42-1.95Zm-6.23 5.82a.37.37 0 0 1-.44.16.26.26 0 0 1-.11-.39.37.37 0 0 1 .43-.16.26.26 0 0 1 .12.39Zm-.82 1.04a.98.98 0 0 1-1.18.4A.68.68 0 0 1 5.9 11a.98.98 0 0 1 1.16-.39.68.68 0 0 1 .29 1.03Zm.94-2.8a2.8 2.8 0 0 0-3.13 1.37 1.9 1.9 0 0 0 1.21 2.71 2.77 2.77 0 0 0 3.31-1.4 1.91 1.91 0 0 0-1.4-2.68Z"></path><path fill="currentColor" d="M8.01 13.64c-2.56.25-4.78-.91-4.95-2.6s1.78-3.25 4.35-3.5 4.78.9 4.94 2.59-1.77 3.25-4.34 3.5Zm5.13-5.6c-.22-.06-.36-.1-.25-.4a1.61 1.61 0 0 0 0-1.54c-.5-.72-1.88-.68-3.46-.02 0 0-.5.22-.37-.17A1.79 1.79 0 0 0 8.9 4.1c-.86-.86-3.13.03-5.09 1.99a6.7 6.7 0 0 0-2.31 4.34c0 2.57 3.29 4.13 6.5 4.13 4.21 0 7.02-2.45 7.02-4.4a2.35 2.35 0 0 0-1.88-2.12Z"></path>
</symbol>

<symbol id="footer-icon-social-media" viewBox="0 0 24 24">
  <path fill="currentColor" d="M16.5 8.1c-1-2.6-3.9-4.5-7.4-4.5-4.3 0-7.7 2.8-7.7 6.4 0 1.9 1 3.7 2.7 4.8L3 17.2l2.9-1.5c1 .4 2.1.6 3.2.6h.8c-.4-.7-.6-1.5-.6-2.4 0-3.2 3.1-5.8 6.9-5.8h.3zM5.8 7.5c0-.4.3-.8.8-.8.4 0 .8.3.8.8 0 .4-.3.8-.8.8-.4-.1-.8-.4-.8-.8zm4.8 0c0-.4.3-.8.8-.8.4 0 .8.3.8.8 0 .4-.3.8-.8.8-.4-.1-.8-.4-.8-.8zm7.7 11.6c-.7.2-1.4.3-2.1.3-3.6 0-6.5-2.5-6.5-5.5s2.9-5.5 6.5-5.5 6.5 2.5 6.5 5.5c0 1.8-1.1 3.4-2.7 4.4l.8 2.1-2.5-1.3zm-4.6-6.6c.4 0 .7-.3.7-.7s-.3-.7-.7-.7c-.4 0-.7.3-.7.7s.3.7.7.7zm4.5 0c.4 0 .7-.3.7-.7s-.3-.7-.7-.7-.7.3-.7.7.3.7.7.7z"></path>
</symbol>

<symbol id="footer-icon-x" viewBox="0 0 35 35">
  <path fill="currentColor" d="M28.5 0h-22C2.9 0 0 2.9 0 6.5v22C0 32.1 2.9 35 6.5 35h22c3.6 0 6.5-2.9 6.5-6.5v-22C35 2.9 32.1 0 28.5 0zM30 30.4h-5.9c-.3 0-.6-.1-.8-.4L16 21l-7.3 9.1c-.2.2-.5.4-.8.4-.2 0-.4-.1-.6-.2-.4-.3-.5-1-.2-1.4l7.6-9.5L4.2 6.2c-.4-.4-.3-1.1.1-1.4.2-.2.4-.2.7-.2h5.9c.3 0 .6.1.8.4l7.3 9 7.3-9.1c.3-.4 1-.5 1.4-.2.4.3.5 1 .2 1.4l-7.6 9.5 10.5 13.1c.2.2.3.4.3.7-.1.6-.5 1-1.1 1zm-2.1-2h-3.3L7.1 6.6h3.3l17.5 21.8z"></path>
</symbol>

<symbol id="footer-icon-web" viewBox="0 0 20 20" fill="none">
  <path d="M5.31299 18.7475C4.27197 18.7475 3.23194 18.3511 2.43994 17.5591C0.855958 15.9751 0.855958 13.397 2.43994 11.812L6.34521 7.90673C7.93017 6.32275 10.5073 6.32372 12.0923 7.90673C12.3091 8.1245 12.4995 8.36376 12.6587 8.61669C12.8794 8.96728 12.7739 9.43017 12.4233 9.65087C12.0708 9.87255 11.6099 9.76513 11.3892 9.41552C11.2886 9.25536 11.1675 9.104 11.0298 8.9663C10.0308 7.96728 8.40478 7.96825 7.40576 8.96728L3.50049 12.8725C2.50147 13.8725 2.50147 15.4995 3.50049 16.4985C4.50147 17.4995 6.12744 17.4956 7.12647 16.4985L9.07862 14.5464C9.37159 14.2534 9.8462 14.2534 10.1392 14.5464C10.4321 14.8393 10.4321 15.314 10.1392 15.6069L8.18702 17.5591C7.39503 18.3511 6.354 18.7466 5.31299 18.7475ZM13.6538 12.0923L17.5591 8.18701C19.1431 6.60205 19.1431 4.02392 17.5591 2.43994C15.9751 0.855958 13.396 0.855958 11.812 2.43994L9.85986 4.39209C9.56689 4.68506 9.56689 5.15967 9.85986 5.45264C10.1528 5.74561 10.6274 5.74561 10.9204 5.45264L12.8726 3.50049C13.8716 2.50244 15.4976 2.50049 16.4985 3.50049C17.4976 4.49951 17.4976 6.12647 16.4985 7.12647L12.5933 11.0317C11.5942 12.0308 9.96827 12.0317 8.96925 11.0327C8.83155 10.895 8.71046 10.7437 8.60987 10.5835C8.38917 10.2339 7.92823 10.1265 7.57569 10.3481C7.2251 10.5688 7.11964 11.0317 7.34034 11.3823C7.49952 11.6353 7.68995 11.8745 7.90675 12.0923C8.69972 12.8843 9.73976 13.2808 10.7808 13.2808C11.8208 13.2808 12.8618 12.8843 13.6538 12.0923Z" fill="#292929"/>
</symbol>

</svg>`;
