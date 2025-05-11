const logoutButton = document.querySelector('li .logout');


async function logout(event) {
    let response = null;

    if(logoutButton) {
      
        response = await fetch("/logout", {
            method: "POST",
            body: JSON.stringify({ csrfToken:  document.querySelector('li input').value }),
    
            headers: { "Content-Type": "application/json" },
          });
    };
    response = await response.json();
    window.location.href = '/home';
    console.log(response);
    
 
   

}

if(logoutButton) {

    logoutButton.addEventListener('click', logout);
    
}