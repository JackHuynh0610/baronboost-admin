const mode = 0;

const host_local = "http://localhost:8080";
const host_remote = "";

function getHost() {
  return mode == 0 ? host_local : host_remote;
}

function getTheToken() {
  return localStorage.getItem("token");
}

function saveTheToken(token) {
  localStorage.setItem("token", token);
}

function saveUsername(username){
    localStorage.setItem("username", username);
}

function getTheUsername(){
    return localStorage.getItem("username");
}

function removeTheToken() {
    localStorage.removeItem("token");
}

function removeTheUsername() {
    localStorage.removeItem("username");
}

let configuration = {
  host: () => getHost(),
  token: () => getTheToken(),
  username: () => getTheUsername()
};

async function login() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let customer = { username: username, password: password };
    
    let request = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(customer),
    };

    try {
      let response = await fetch(getHost() + "/authenticate/signin", request);
      if (response.ok) {
        const token = await response.text();
        saveTheToken(token);
        
        // Now check if the user has the role of ADMIN
        let userResponse = await fetch(getHost() + `/api/users/username/${username}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // Use the token for authorization
          }
        });

        if (userResponse.ok) {
          let user = await userResponse.json();
          if (user.role === "ADMIN") {
            alert("The login was successful!");
            saveUsername(username);
            location.href = "/menu/menu.html";
          } else {
            removeTheToken();
            alert("Access denied: Only admins can access this page.");
          }
        } else {
          console.log(`User response status: ${userResponse.status}`);
          removeTheToken();
          alert("Failed to verify user role.");
        }
      } else {
        console.log(`Response status: ${response.status}`);
        removeTheToken();
        alert("Login failed: Invalid username or password.");
      }
    } catch (error) {
      console.log(error);
      removeTheToken();
      alert("Something went wrong!");
    }
}

async function logout() {
    removeTheUsername();
    removeTheToken();
    location.href = "../index.html";
}