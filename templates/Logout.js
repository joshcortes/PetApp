document.getElementById("logout-btn").addEventListener("click", async () => {
    try {
        const response = await fetch((url = 'http://localhost:5000/logout'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
      },
    });
        localStorage.removeItem("token");
        localStorage.removeItem("user_id");
        window.location.href = "./index.html";
    }catch (error) {
        document.getElementById(
          'errorMsg'
        ).innerHTML = `Download error: ${error.message}`;
        console.error(`Download error: ${error.message}`);
    }
});
