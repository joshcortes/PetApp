logoutButton = document.getElementById('logout')
import axios from "axios"

logoutButton.addEventListener('submit', async () => {
    try {
        axios({
            method: 'POST',
            url: '/logout',
        }).then((response) => {
            localStorage.removeItem('token');
        }).catch((error) => {
            if (error.response) {
                console.log(error.response);
                console.log(error.response.status);
                console.log(error.response.headers)
            }
        });
    } catch (error) {
        document.getElementById(
            'errorMsg'
            ).innerHTML = `Download error: ${error.message}`;
        console.error(`Download error: ${error.message}`);
    } 
});