import { renderHome } from "./views/home.js";
import { renderLocalGame } from "./views/local.js";

const fadeOutDuration = 200;
const fadeInDuration = 600;

let audioContext = new AudioContext() || new webkitAudioContext();
let oscillator = audioContext.createOscillator();
let gainNode = audioContext.createGain();

const routes = {
    "/": { endpoint: "/home_data" },
    "/local": { title: "Local", endpoint: "/local_game" },
    "/login": { title: "Login", endpoint: "/login" },
    "/online": { title: "home", endpoint: "/online" },
    "/logout": { title: "Logout", endpoint: "/logout" },
    "/register": { title: "Register", endpoint: "/register" },
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

function renderOnlineGame(data) {
    return `<div>${data}</div>`;
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

function renderRegister(data) {
    return `<div>${data.content}</div>`;
}

const viewFunctions = {
    "/": renderHome,
    "/local": renderLocalGame,
    "/login": renderLogin,
    "/online": renderOnlineGame,
    "/logout": renderLogout,
    "/register": renderRegister,
};

function router() {
    let view = routes[location.pathname];
    if (view) {
        document.title = view.title;

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

            setTimeout(() => {
                appElement.innerHTML = newContent;

                appElement.classList.remove('fade-exit');
                appElement.classList.add('fade-enter');

                setTimeout(() => appElement.classList.remove('fade-enter'), fadeInDuration);

                if (location.pathname === "/login") {
                    handleLoginForm();
                } else if (location.pathname === "/logout") {
                    handleLogoutForm();
                } else if (location.pathname === "/register") {
                    handleRegisterForm();
                }
            }, fadeOutDuration);
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            document.getElementById('app').innerHTML = "<p>Error loading page content.</p>";
        });
    } else {
        history.replaceState("", "", "/");
        router();
    }
}

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
                history.pushState("", "", "/online");
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
                    window.location.href = data.redirect_url;
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

document.getElementById("app").addEventListener("click", () => {

    if (event.target.id === "StartLocalGameButton") {
        if (audioContext.state !== "running") {
            audioContext.resume();
            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 1);
        }

        oscillator.frequency.value = 440.0;
        gainNode.gain.exponentialRampToValueAtTime(0.2, audioContext.currentTime + 0.08);

        setTimeout(() => {
            oscillator.frequency.value = 880.0;
            gainNode.gain.value = 0.2;
        }, 200);

        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 1);
    }
});

window.addEventListener("click", e => {

    if (e.target.matches("[data-link]")) {
        e.preventDefault();
        history.pushState("", "", e.target.href);
        router();
    }

});

window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
    // Views router
    router();

    // Audio setup init for Synth effects generated in real time 

    audioContext = new AudioContext() || new webkitAudioContext();
    oscillator = audioContext.createOscillator();
    oscillator.type = "triangle";
    oscillator.frequency.value = 220.0;
    gainNode = audioContext.createGain();
    gainNode.gain.value = 0.2;

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

});
