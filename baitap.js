document.addEventListener("DOMContentLoaded", function () {
    const authModal = document.getElementById("authModal");
    const authMessage = document.getElementById("authMessage");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const authTabs = document.querySelectorAll("[data-auth-tab]");
    const openButtons = document.querySelectorAll("[data-open-auth]");
    const closeButtons = document.querySelectorAll("[data-close-auth]");

    function showMessage(text, type) {
        authMessage.textContent = text;
        authMessage.classList.remove("error", "success");
        if (type) {
            authMessage.classList.add(type);
        }
    }

    function setAuthView(mode) {
        const forms = document.querySelectorAll(".auth-form");
        const tabs = document.querySelectorAll(".auth-tab");

        forms.forEach(function (form) {
            form.classList.toggle("active", form.dataset.form === mode);
        });

        tabs.forEach(function (tab) {
            tab.classList.toggle("active", tab.dataset.authTab === mode);
        });

        if (authModal) {
            authModal.setAttribute("aria-hidden", String(mode === ""));
        }
    }

    function openAuthModal(mode) {
        if (!authModal) return;
        authModal.classList.add("active");
        setAuthView(mode);
        authModal.setAttribute("aria-hidden", "false");
    }

    function closeAuthModal() {
        if (!authModal) return;
        authModal.classList.remove("active");
        authModal.setAttribute("aria-hidden", "true");
    }

    openButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            openAuthModal(button.dataset.openAuth);
        });
    });

    closeButtons.forEach(function (button) {
        button.addEventListener("click", closeAuthModal);
    });

    authTabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
            setAuthView(tab.dataset.authTab);
            showMessage("", "");
        });
    });

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const username = document.getElementById("loginUsername").value.trim();
            const password = document.getElementById("loginPassword").value.trim();

            if (!username || !password) {
                showMessage("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!", "error");
                return;
            }

            let users = [];
            try {
                users = JSON.parse(localStorage.getItem("crocsUsers") || "[]");
            } catch (error) {
                users = [];
            }

            const foundUser = users.find(function (user) {
                return user.username === username && user.password === password;
            });

            if (foundUser) {
                showMessage("Đăng nhập thành công! Chào mừng bạn trở lại.", "success");
                setTimeout(closeAuthModal, 1000);
            } else {
                showMessage("Tên đăng nhập hoặc mật khẩu không đúng!", "error");
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const username = document.getElementById("registerUsername").value.trim();
            const email = document.getElementById("registerEmail").value.trim();
            const password = document.getElementById("registerPassword").value.trim();

            if (!username || !email || !password) {
                showMessage("Vui lòng điền đầy đủ thông tin đăng ký!", "error");
                return;
            }

            if (username.length < 3) {
                showMessage("Tên đăng nhập phải có ít nhất 3 ký tự!", "error");
                return;
            }

            if (password.length < 6) {
                showMessage("Mật khẩu phải có ít nhất 6 ký tự!", "error");
                return;
            }

            let users = [];
            try {
                users = JSON.parse(localStorage.getItem("crocsUsers") || "[]");
            } catch (error) {
                users = [];
            }

            const isDuplicate = users.some(function (user) {
                return user.username === username;
            });

            if (isDuplicate) {
                showMessage("Tên đăng nhập này đã tồn tại!", "error");
                return;
            }

            users.push({ username: username, email: email, password: password });
            localStorage.setItem("crocsUsers", JSON.stringify(users));
            showMessage("Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.", "success");
            registerForm.reset();
            setTimeout(function () {
                setAuthView("login");
                showMessage("", "");
            }, 1200);
        });
    }

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && authModal && authModal.classList.contains("active")) {
            closeAuthModal();
        }
    });
});