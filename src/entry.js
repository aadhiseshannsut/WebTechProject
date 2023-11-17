// global variables
const entryBtn = document.getElementById('entryBtn');
const message = document.getElementById('processMessage');

entryBtn.addEventListener('click', event => process(event));

function goToMain() {
  window.location.href = 'main.html';
}

function handleResponse(responseText) {
  message.innerText = responseText;
  message.classList.add('active');

  if (responseText === 'Account created successfully' || responseText === 'Logged in Successfully') {
    goToMain();
  }
}

function process(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (entryBtn.value === 'REGISTER') {
    const cpassword = document.getElementById('cpassword').value;

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'process/entry.php', true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    let params = `action=REGISTER&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&cpassword=${encodeURIComponent(cpassword)}`;

    xhr.onload = function () {
      if (this.status === 200 || this.status === 500) {
        handleResponse(this.responseText);
      }
    };

    xhr.send(params);
  } else {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'process/entry.php', true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    let params = `action=LOGIN&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

    xhr.onload = function () {
      if (this.status === 200) {
        handleResponse(this.responseText);
      }
    };

    xhr.send(params);
  }
}