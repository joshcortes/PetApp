if(localStorage.getItem('token')){
    loginForm = document.getElementById('loginForm');
    loginForm.style.display = "none";
    loggedIn = document.getElementById('loggedIn');
    loggedIn.style.display = "block";
}
else{
    loginForm = document.getElementById('loginForm');
    loginForm.style.display = "block";
    loggedIn = document.getElementById('loggedIn');
    loggedIn.style.display = "none";
}