/*DOM elements*/
const div = document.querySelector('.navhelper-flex');
const image = document.querySelector('.image-container');
const displayText = document.querySelector('h2');

// buttons
const nextBtn = document.querySelector('#nextBtn');
const loginBtn = document.querySelector('#loginBtn');
const signupBtn = document.querySelector('#signupBtn');


/*Main gimmick*/
let dialogues = [
  "This is a simple website that lets you implement a To-Do List",
  "You can ADD a new task...",
  "...DELETE an existing task",
  "you can also EDIT your tasks",
  "If this is your first time here, click the Sign Up button",
  "If you already have an account, click the Login button",
  "Have fun!  :)"
];
const N = dialogues.length;
let counter = 0;

function nextPage() {
  if (counter<N) {
    image.classList.add('hiding');
    displayText.classList.add('hiding');
    setTimeout(()=> {
      displayText.innerText = dialogues[counter];
      displayText.classList.remove('hiding');
      counter += 1;
      // specific pages have their own background image
      if (counter === 1) {
        image.style.backgroundImage =  "url('assets/bg.png')";
        image.classList.remove('hiding');
      }
      else if (counter === 2) {
        image.style.backgroundImage =  "url('assets/addtask.png')";
        image.classList.remove('hiding');
      }
      else if (counter === 3) {
        image.style.backgroundImage =  "url('assets/deletetask.png')";
        image.classList.remove('hiding');
      }
      else if (counter === 4) {
        image.style.backgroundImage =  "url('assets/edittaskdemo.png')";
        image.classList.remove('hiding');
      }
      // console.log(counter);
    }, 500);
  }
  if (counter == N-1){
    nextBtn.style.opacity = "0%";
    image.style.width = "5%";
  }
}

/*event listeners*/
// go to login
loginBtn.addEventListener("click", ()=>{window.location.href = "signin.html";});

// go to signup
signupBtn.addEventListener("click", ()=>{window.location.href = "signup.html";});

// navigate through main page
nextBtn.addEventListener("click", nextPage);