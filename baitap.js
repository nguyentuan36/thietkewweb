document.addEventListener("DOMContentLoaded", function () {
    const authModal = document.getElementById("authModal");
    const authMessage = document.getElementById("authMessage");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const authTabs = document.querySelectorAll("[data-auth-tab]");
    const openButtons = document.querySelectorAll("[data-open-auth]");
    const closeButtons = document.querySelectorAll("[data-close-auth]");
    const productModal = document.getElementById("productModal");
    const productModalImage = document.getElementById("productModalImage");
    const productModalTitle = document.getElementById("productModalTitle");
    const productModalPrice = document.getElementById("productModalPrice");
    const productModalDescription = document.getElementById("productModalDescription");
    const imageLightbox = document.getElementById("imageLightbox");
    const lightboxImage = document.getElementById("lightboxImage");
    const lightboxCaption = document.getElementById("lightboxCaption");
    const cartItemsElement = document.getElementById("cartItems");
    const cartEmpty = document.getElementById("cartEmpty");
    const cartTotal = document.getElementById("cartTotal");
    const cartStatus = document.getElementById("cartStatus");
    const cartCheckout = document.getElementById("cartCheckout");
    const cartView = document.getElementById("cartView");
    const cartCatalog = {
        "1": { name: "Dép Crocs x BAPE", price: 799000, image: "./anh/anh1.jpg" },
        "2": { name: "Crocs Classic Lừa Xanh", price: 890000, image: "./anh/anh2.jpg" },
        "3": { name: "Crocs Lightning McQueen", price: 650000, image: "./anh/anh3.jpg" },
        "4": { name: "Crocs Loang Xanh", price: 850000, image: "./anh/anh4.jpg" },
        "5": { name: "Crocs Classic", price: 999000, image: "./anh/anh5.jpg" },
        "6": { name: "Crocs x The Simpsons", price: 599000, image: "./anh/anh6.jpg" },
        "7": { name: "Crocs x Squishmallows", price: 650000, image: "./anh/anh7.jpg" },
        "8": { name: "Crocs x Lovefancy", price: 549000, image: "./anh/anh8.jpg" }
    };
    let cart = [];
    let lastProductTrigger = null;
    let lastLightboxTrigger = null;

    function formatCurrency(amount) {
        return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
    }

    function updateCartStatus(message) {
        if (cartStatus) cartStatus.textContent = message;
    }

    function loadCart() {
        try {
            const storedCart = JSON.parse(localStorage.getItem("crocsCart") || "[]");
            if (!Array.isArray(storedCart)) {
                throw new Error("Dữ liệu giỏ hàng không đúng định dạng.");
            }
            cart = storedCart.filter(function (item) {
                return item &&
                    Object.prototype.hasOwnProperty.call(cartCatalog, String(item.id)) &&
                    Number.isInteger(item.quantity) &&
                    item.quantity > 0;
            }).map(function (item) {
                return { id: String(item.id), quantity: item.quantity };
            });
            return true;
        } catch (error) {
            console.error("Không thể đọc dữ liệu giỏ hàng:", error);
            cart = [];
            updateCartStatus("Không thể đọc giỏ hàng đã lưu. Giỏ mới chưa được lưu.");
            return false;
        }
    }

    function saveCart() {
        try {
            localStorage.setItem("crocsCart", JSON.stringify(cart));
            updateCartStatus("");
            return true;
        } catch (error) {
            console.error("Không thể lưu dữ liệu giỏ hàng:", error);
            updateCartStatus("Không thể lưu giỏ hàng trên trình duyệt này.");
            return false;
        }
    }

    function renderCart() {
        let totalQuantity = 0;
        let totalPrice = 0;

        cart.forEach(function (item) {
            const product = cartCatalog[item.id];
            if (!product) return;

            totalQuantity += item.quantity;
            totalPrice += product.price * item.quantity;
        });

        document.querySelectorAll("[data-cart-count]").forEach(function (badge) {
            badge.textContent = String(totalQuantity);
        });

        if (!cartItemsElement || !cartTotal || !cartEmpty || !cartCheckout) return;

        cartItemsElement.replaceChildren();
        cart.forEach(function (item) {
            const product = cartCatalog[item.id];
            if (!product) return;
            const row = document.createElement("article");
            row.className = "dong-san-pham-gio";

            const image = document.createElement("img");
            image.className = "anh-san-pham-trong-gio";
            image.src = product.image;
            image.alt = product.name;

            const details = document.createElement("div");
            const name = document.createElement("h3");
            name.className = "ten-san-pham-trong-gio";
            name.textContent = product.name;

            const price = document.createElement("div");
            price.className = "gia-san-pham-trong-gio";
            price.textContent = formatCurrency(product.price);

            const controls = document.createElement("div");
            controls.className = "nut-dieu-chinh-gio-hang";

            const decrease = document.createElement("button");
            decrease.className = "nut-thay-doi-so-luong";
            decrease.type = "button";
            decrease.dataset.cartAction = "decrease";
            decrease.dataset.productId = item.id;
            decrease.setAttribute("aria-label", "Giảm số lượng " + product.name);
            decrease.textContent = "−";

            const quantity = document.createElement("span");
            quantity.className = "so-luong-san-pham-gio";
            quantity.textContent = String(item.quantity);

            const increase = document.createElement("button");
            increase.className = "nut-thay-doi-so-luong";
            increase.type = "button";
            increase.dataset.cartAction = "increase";
            increase.dataset.productId = item.id;
            increase.setAttribute("aria-label", "Tăng số lượng " + product.name);
            increase.textContent = "+";

            const remove = document.createElement("button");
            remove.className = "nut-xoa-khoi-gio";
            remove.type = "button";
            remove.dataset.cartAction = "remove";
            remove.dataset.productId = item.id;
            remove.textContent = "Xóa";

            controls.append(decrease, quantity, increase, remove);
            details.append(name, price, controls);

            const subtotal = document.createElement("div");
            subtotal.className = "tam-tinh-san-pham-gio";
            subtotal.textContent = formatCurrency(product.price * item.quantity);

            row.append(image, details, subtotal);
            cartItemsElement.append(row);
        });

        cartTotal.textContent = formatCurrency(totalPrice);
        cartEmpty.hidden = cart.length > 0;
        cartCheckout.disabled = cart.length === 0;
    }

    function syncCartView() {
        if (!cartView) return;

        const isCartOpen = window.location.hash === "#gio-hang";
        cartView.hidden = !isCartOpen;
        document.querySelectorAll("#trang-chu > section:not(#cartView)").forEach(function (section) {
            section.hidden = isCartOpen;
        });

        if (isCartOpen) cartView.scrollIntoView();
    }

    function addToCart(id) {
        const productId = String(id);
        if (!Object.prototype.hasOwnProperty.call(cartCatalog, productId)) {
            updateCartStatus("Không tìm thấy sản phẩm để thêm vào giỏ.");
            return;
        }

        const existingItem = cart.find(function (item) {
            return item.id === productId;
        });
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ id: productId, quantity: 1 });
        }
        saveCart();
        renderCart();
    }

    loadCart();
    renderCart();
    syncCartView();
    window.addEventListener("hashchange", syncCartView);

    document.addEventListener("click", function (event) {
        const addButton = event.target.closest("[data-add-to-cart], .them-gio");
        if (addButton) {
            const product = addButton.closest(".the-san-pham, .the-san-pham-gioi-thieu");
            const productId = addButton.dataset.addToCart || (product && product.dataset.id) ||
                (product && product.dataset.productId);
            if (productId) addToCart(productId);
            return;
        }

        const cartAction = event.target.closest("[data-cart-action]");
        if (!cartAction) return;

        const id = cartAction.dataset.productId;
        const item = cart.find(function (cartItem) {
            return cartItem.id === id;
        });
        if (!item) return;

        if (cartAction.dataset.cartAction === "remove" ||
            (cartAction.dataset.cartAction === "decrease" && item.quantity === 1)) {
            cart = cart.filter(function (cartItem) {
                return cartItem.id !== id;
            });
        } else if (cartAction.dataset.cartAction === "decrease") {
            item.quantity -= 1;
        } else if (cartAction.dataset.cartAction === "increase") {
            item.quantity += 1;
        }
        saveCart();
        renderCart();
    });

    if (cartCheckout) {
        cartCheckout.addEventListener("click", function () {
            updateCartStatus("Thanh toán chưa được tích hợp. Giỏ hàng của bạn vẫn được lưu.");
        });
    }

    window.addEventListener("storage", function (event) {
        if (event.key !== "crocsCart") return;
        loadCart();
        renderCart();
    });

    function showMessage(text, type) {
        authMessage.textContent = text;
        authMessage.classList.remove("co-loi", "thanh-cong");
        if (type) {
            authMessage.classList.add(type);
        }
    }

    function setAuthView(mode) {
        const forms = document.querySelectorAll(".bieu-mau-xac-thuc");
        const tabs = document.querySelectorAll(".tab-xac-thuc");

        forms.forEach(function (form) {
            form.classList.toggle("dang-hoat-dong", form.dataset.form === mode);
        });

        tabs.forEach(function (tab) {
            tab.classList.toggle("dang-hoat-dong", tab.dataset.authTab === mode);
        });

        if (authModal) {
            authModal.setAttribute("aria-hidden", String(mode === ""));
        }
    }

    function openAuthModal(mode) {
        if (!authModal) return;
        authModal.classList.add("dang-hoat-dong");
        setAuthView(mode);
        authModal.setAttribute("aria-hidden", "false");
    }

    function closeAuthModal() {
        if (!authModal) return;
        authModal.classList.remove("dang-hoat-dong");
        authModal.setAttribute("aria-hidden", "true");
    }

    function closeProductModal() {
        if (!productModal) return;
        productModal.classList.remove("dang-hoat-dong");
        productModal.setAttribute("aria-hidden", "true");
        if (lastProductTrigger) {
            lastProductTrigger.focus();
            lastProductTrigger = null;
        }
    }

    function closeImageLightbox() {
        if (!imageLightbox) return;
        imageLightbox.classList.remove("dang-hoat-dong");
        imageLightbox.setAttribute("aria-hidden", "true");
        if (lastLightboxTrigger) {
            lastLightboxTrigger.focus();
            lastLightboxTrigger = null;
        }
    }

    document.querySelectorAll(".anh-san-pham-gioi-thieu").forEach(function (trigger) {
        trigger.addEventListener("click", function (event) {
            const image = trigger.querySelector("img");
            const title = trigger.closest(".the-san-pham-gioi-thieu")?.querySelector("h3");
            if (!image || !title || !imageLightbox || !lightboxImage || !lightboxCaption) return;

            event.preventDefault();
            lightboxImage.src = image.src;
            lightboxImage.alt = image.alt;
            lightboxCaption.textContent = title.textContent.trim();
            lastLightboxTrigger = trigger;
            imageLightbox.classList.add("dang-hoat-dong");
            imageLightbox.setAttribute("aria-hidden", "false");
            imageLightbox.querySelector(".nut-dong-anh-phong-to").focus();
        });
    });

    document.querySelectorAll("[data-close-lightbox]").forEach(function (button) {
        button.addEventListener("click", closeImageLightbox);
    });

    document.querySelectorAll(".anh-san-pham").forEach(function (trigger) {
        trigger.addEventListener("click", function () {
            const product = trigger.closest(".the-san-pham");
            const image = trigger.querySelector("img");
            if (!product || !image || !productModal) return;

            const title = product.querySelector(".thong-tin-san-pham h3");
            const price = product.querySelector(".gia-moi");
            if (!title || !price) return;

            productModalImage.src = image.src;
            productModalImage.alt = image.alt;
            productModalTitle.textContent = title.textContent.trim();
            productModalPrice.textContent = price.textContent.trim();
            productModalDescription.textContent = product.dataset.description;
            lastProductTrigger = trigger;
            productModal.classList.add("dang-hoat-dong");
            productModal.setAttribute("aria-hidden", "false");
            productModal.querySelector(".nut-dong-hop-thoai-san-pham").focus();
        });
    });

    document.querySelectorAll("[data-close-product]").forEach(function (button) {
        button.addEventListener("click", closeProductModal);
    });

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
                showMessage("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!", "co-loi");
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
                showMessage("Đăng nhập thành công! Chào mừng bạn trở lại.", "thanh-cong");
                setTimeout(closeAuthModal, 1000);
            } else {
                showMessage("Tên đăng nhập hoặc mật khẩu không đúng!", "co-loi");
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
                showMessage("Vui lòng điền đầy đủ thông tin đăng ký!", "co-loi");
                return;
            }

            if (username.length < 3) {
                showMessage("Tên đăng nhập phải có ít nhất 3 ký tự!", "co-loi");
                return;
            }

            if (password.length < 6) {
                showMessage("Mật khẩu phải có ít nhất 6 ký tự!", "co-loi");
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
                showMessage("Tên đăng nhập này đã tồn tại!", "co-loi");
                return;
            }

            users.push({ username: username, email: email, password: password });
            localStorage.setItem("crocsUsers", JSON.stringify(users));
            showMessage("Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.", "thanh-cong");
            registerForm.reset();
            setTimeout(function () {
                setAuthView("login");
                showMessage("", "");
            }, 1200);
        });
    }

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && productModal && productModal.classList.contains("dang-hoat-dong")) {
            closeProductModal();
            return;
        }
        if (event.key === "Escape" && imageLightbox && imageLightbox.classList.contains("dang-hoat-dong")) {
            closeImageLightbox();
            return;
        }
        if (event.key === "Escape" && authModal && authModal.classList.contains("dang-hoat-dong")) {
            closeAuthModal();
        }
    });
});