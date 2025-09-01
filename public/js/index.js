import "@babel/polyfill";
import { login } from "./login";
import { displayMap } from "./mapbox";
import { showAlert } from "./alert";
import { logout } from "./login";
import { updateData } from "./updateSettings";
import { bookTour } from "./stripe";

const leaflet = document.getElementById("map");
const loginForm = document.querySelector(".form--login");
const logoutBtn = document.querySelector(".nav__el--logout");
const updateDataForm = document.querySelector(".form-user-data");
const updatePasswordForm = document.querySelector(".form-user-password");
const bookBtn = document.getElementById("book-tour");

if (bookBtn) {
    bookBtn.addEventListener("click", (e) => {
        const { tourId } = e.target.dataset;
        bookTour(tourId);
    });
}

if (leaflet) {
    const startLocation = JSON.parse(
        document.getElementById("map").dataset.startlocation,
    );
    const locations = JSON.parse(
        document.getElementById("map").dataset.locations,
    );
    displayMap(startLocation, locations);
}

if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const pwd = document.getElementById("password").value;
        login(email, pwd);
    });
}

if (updateDataForm) {
    updateDataForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const form = new FormData();
        form.append("name", document.getElementById("name").value);
        form.append("email", document.getElementById("email").value);
        form.append("photo", document.getElementById("photo").files[0]);

        updateData(form, "data");
    });
}

if (updatePasswordForm) {
    updatePasswordForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const passwordCurrent =
            document.getElementById("password-current").value;
        const password = document.getElementById("password").value;
        const passwordConfirm =
            document.getElementById("password-confirm").value;
        await updateData(
            { passwordCurrent, password, passwordConfirm },
            "password",
        );

        document.getElementById("password-current").value = "";
        document.getElementById("password").value = "";
        document.getElementById("password-confirm").value = "";
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
}
