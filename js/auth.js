document.addEventListener('DOMContentLoaded', function() {
    // Элементы
    const loginBtn = document.getElementById('loginBtn');
    const authModal = document.getElementById('authModal');
    const closeModal = document.getElementById('closeModal');
    const authForm = document.querySelector('.auth-body');
    const userInfo = document.getElementById('userInfo');
    const usernameDisplay = document.getElementById('usernameDisplay');
    const logoutBtn = document.getElementById('logoutBtn');

    // Проверка авторизации при загрузке
    checkAuth();

    // Открытие модального окна
    loginBtn.addEventListener('click', function() {
        authModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });

    // Закрытие модального окна
    closeModal.addEventListener('click', function() {
        authModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    // Закрытие по клику вне формы
    window.addEventListener('click', function(e) {
        if (e.target === authModal) {
            authModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Обработка формы
    authForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('employeeId').value.trim();
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            alert('Пожалуйста, заполните все поля');
            return;
        }
        
        // В реальном приложении здесь будет запрос к серверу
        console.log('Авторизация:', { username, password });
        
        // Сохраняем данные
        localStorage.setItem('aviation_user', JSON.stringify({
            username,
            authTime: new Date().toISOString()
        }));
        
        showUserInfo(username);
        authModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.reset();
    });

    // Выход
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('aviation_user');
        userInfo.style.display = 'none';
        loginBtn.style.display = 'block';
    });

    // Функции
    function checkAuth() {
        const user = localStorage.getItem('aviation_user');
        if (user) {
            const userData = JSON.parse(user);
            showUserInfo(userData.username);
        }
    }

    function showUserInfo(username) {
        usernameDisplay.textContent = username;
        userInfo.style.display = 'flex';
        loginBtn.style.display = 'none';
    }
});