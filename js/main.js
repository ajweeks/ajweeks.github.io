// Copyright AJ Weeks 2015

window.onload = function () {
    if (typeof(Storage) !== "undefined") {
        var sheet = document.createElement('style');
        sheet.id = "theme_id";

        if (!localStorage.theme) {
            localStorage.theme = "dark_theme";
        }

        if (localStorage.theme === "dark_theme") {
            sheet.innerHTML = ".light_theme {display: none;}";
        } else {
            sheet.innerHTML = ".dark_theme {display: none;}";
        }

        document.body.appendChild(sheet);
    } else {
        var sheet = document.createElement('style');
        sheet.id = "theme_id";
        sheet.innerHTML = ".light_theme {display: none;}";
        document.body.appendChild(sheet);
    }
}

function toggleTheme() {
    if (typeof(Storage) !== "undefined") {
        if (!localStorage.theme) {
            localStorage.theme = "dark_theme";
        }

        var sheet = document.getElementById('theme_id');
        if (sheet) {
            if (localStorage.theme === "dark_theme") {
                localStorage.theme = "light_theme";
                sheet.innerHTML = ".dark_theme {display: none;}";
            } else {
                localStorage.theme = "dark_theme";
                sheet.innerHTML = ".light_theme {display: none;}";
            }
        } else {
            var sheet = document.createElement('style');
            sheet.id = "theme_id";
            if (localStorage.theme === "dark_theme") {
                localStorage.theme = "light_theme";
                sheet.innerHTML = ".dark_theme {display: none;}";
            } else {
                localStorage.theme = "dark_theme";
                sheet.innerHTML = ".light_theme {display: none;}";
            }
            document.body.appendChild(sheet);
        }
    } else {
        console.error("Please use a newer/better browser if you want to switch themes. Thanks :)");
    }
}
