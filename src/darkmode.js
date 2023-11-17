/* Dark mode */
const img = document.querySelector('#togglemode');
img.addEventListener("click", function(){
  document.body.classList.toggle("dark-mode");
  setTimeout(() => {
    if (document.body.classList.contains("dark-mode")) {
      img.src = "assets/sun.png";
    }
    else {
      img.src = "assets/moon.png";
    }
  }, 100);
});