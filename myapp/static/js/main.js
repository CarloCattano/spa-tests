const routes = {
    "/": { endpoint: "/home_data" },
    "/local": { title: "Local", endpoint: "/local_game" },
    "/login": { title: "Login", endpoint: "/login" },
    "/protected": {title : "home" , endpoint: "/protected_data" },
    "/logout": { title: "Logout", endpoint: "/logout" },
    "/register": { title: "Register", endpoint:"/register"},
};

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

console.log("changed yet again");

function renderProtected(data) {
    return `<div>${data}</div>`;
}

function renderHome(data) {
    return ` <div>${data.content}</div> `;
}

function renderLocalGame(data) {
    return ` ${data.content} `;
}

function renderLogin(data) {
    return `
        <h1>${data.title}</h1>
        ${data.content}
    `;
}

function renderLogout(data) {
    return `<h1>${data.title}</h1><p>${data.content}</p>`;
}

function registerNew(data) {
    return `<div> ${data.content} </div> `;
}

const viewFunctions = {
    "/": renderHome,
    "/local": renderLocalGame,
    "/login": renderLogin,
    "/protected": renderProtected,
    "/logout": renderLogout,  // Add this line for logout
    "/register": registerNew,
};

function router() {
  let view = routes[location.pathname];
  if (view) {
    document.title = view.title;

    // Add the fade-out class to initiate the fade-out animation
    const appElement = document.getElementById('app');
    appElement.classList.add('fade-exit');

    fetch(view.endpoint, {
      method: 'GET',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      document.title = data.title;
      const renderFunction = viewFunctions[location.pathname];
      const newContent = renderFunction ? renderFunction(data) : "<p>Page not found</p>";

      // Wait for the fade-out animation to complete
      setTimeout(() => {
        // Update the content
        appElement.innerHTML = newContent;

        // Remove the fade-out class and add the fade-in class
        appElement.classList.remove('fade-exit');
        appElement.classList.add('fade-enter');

        // Remove the fade-in class after the animation completes
        setTimeout(() => appElement.classList.remove('fade-enter'), 700);
      }, 300); // Match the duration of the fade-out animation

      // Handle special cases for certain routes
      if (location.pathname === "/login") {
        handleLoginForm();
      } else if (location.pathname === "/logout") {
        handleLogoutForm();
      } else if (location.pathname === "/register") {
        handleRegisterForm();
      }


    })
    .catch(error => {
      console.error("Error fetching data:", error);
      document.getElementById('app').innerHTML = "<p>Error loading page content.</p>";
    });
  } else {
    // Fallback for unmatched routes
    history.replaceState("", "", "/");
    router();
  }
}



// function router() {
//     let view = routes[location.pathname];
//
//     if (view) {
//         document.title = view.title;
//         fetch(view.endpoint, {
//             method: 'GET',
//             headers: {
//                 'X-Requested-With': 'XMLHttpRequest',
//             }
//         })
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }
//             return response.json();
//         })
//         .then(data => {
//             document.title = data.title;
//             const renderFunction = viewFunctions[location.pathname];
//             document.getElementById('app').innerHTML = renderFunction ? renderFunction(data) : "<p>Page not found</p>";
//             if (location.pathname === "/login") {
//                 handleLoginForm();
//             } else if (location.pathname === "/logout") {
//                 handleLogoutForm();
//             } else if (location.pathname === "/register") {
//                 handleRegisterForm();
//             }
//         })
//         .catch(error => {
//             console.error("Error fetching data:", error);
//             document.getElementById('app').innerHTML = "<p>Error loading page content.</p>";
//         });
//     } else {
//         history.replaceState("", "", "/");
//         router();
//     }
// }

function handleLoginForm() {
    document.getElementById("loginForm").addEventListener("submit", function (e) {
        e.preventDefault();
        const formData = new FormData(this);
        fetch("/login", {
            method: "POST",
            body: formData,
            headers: {
                'X-CSRFToken': csrftoken,
            }
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Forbidden: CSRF token missing or incorrect.');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            document.getElementById("app").innerHTML = `<p>${data.content}</p>`;
            if (data.content === "Login successful") {
                history.pushState("", "", "/protected");
                router();
            }
        })
        .catch(error => {
            console.error("Login error:", error);
            document.getElementById("app").innerHTML = `<p>${error.message}</p>`;
        });
    });
}

function handleLogoutForm() {
    document.getElementById("logoutForm").addEventListener("submit", function (e) {
        e.preventDefault();
        fetch("/logout", {
            method: "POST",
            headers: {
                'X-CSRFToken': csrftoken,
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Forbidden: CSRF token missing or incorrect.');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            document.getElementById("app").innerHTML = `<p>${data.content}</p>`;
            if (data.content === "Logout successful") {
                setTimeout(() => {
                    window.location.href = data.redirect_url;  // Redirect to the home page after logout
                }, 1000);
            }
        })
        .catch(error => {
            console.error("Logout error:", error);
            document.getElementById("app").innerHTML = `<p>${error.message}</p>`;
        });
    });
}

function handleRegisterForm() {
    document.getElementById("registerForm").addEventListener("submit", function (e) {
        e.preventDefault();
        const formData = new FormData(this);
        fetch("/register", {
            method: "POST",
            body: formData,
            headers: {
                'X-CSRFToken': csrftoken,
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            document.getElementById("app").innerHTML = `<p>${data.content}</p>`;
            if (data.content === "Registration successful") {
                history.pushState("", "", "/login");
                router();
            }
        })
        .catch(error => {
            console.error("Registration error:", error);
            document.getElementById("app").innerHTML = `<p>${error.message}</p>`;
        });
    });
}

window.addEventListener("click", e => {
    if (e.target.matches("[data-link]")) {
        e.preventDefault();
        history.pushState("", "", e.target.href);
        router();
    }
});

window.addEventListener("popstate", router);
window.addEventListener("DOMContentLoaded", router);

