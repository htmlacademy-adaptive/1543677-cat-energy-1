function removeCheckedState() {
  const checkbox = document.querySelector(".main-nav__input");
  if (window.innerWidth > 768) {
    checkbox.checked = false;
  }
}
removeCheckedState();
window.addEventListener("resize", removeCheckedState);
