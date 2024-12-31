const socket = io();

const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const adminSection = document.getElementById('admin-section');
const usernameInput = document.getElementById('username-input');
const passwordInput = document.getElementById('password-input');
const registerBtn = document.getElementById('register-btn');
const loginBtn = document.getElementById('login-btn');
const logDisplay = document.getElementById('log-display');
const commandInput = document.getElementById('command-input');
const sendButton = document.getElementById('send-command');
const getUsersBtn = document.getElementById('get-users-btn');
const userList = document.getElementById('user-list');
const userIdInput = document.getElementById('user-id-input');
const banUserBtn = document.getElementById('ban-user-btn');
const unbanUserBtn = document.getElementById('unban-user-btn');
const deleteUserBtn = document.getElementById('delete-user-btn');
const loginInterface = document.getElementById('login-interface');
const listBtn = document.getElementById('list-btn');
const clearBtn = document.getElementById('clear-btn');
const restartBtn = document.getElementById('restart-btn');
const serverRuntime = document.getElementById('server-runtime');

let currentUserId = null;
let isAdmin = false;

function appendLog(message, target = logDisplay) {
    const logEntry = document.createElement('div');
    logEntry.textContent = message;
    logEntry.classList.add('log-entry', 'fade-in');
    target.appendChild(logEntry);
    target.scrollTop = target.scrollHeight;
}

function showAppSection() {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const username = Object.keys(users).find(name => users[name].id === currentUserId) || 'User';
    
    authSection.classList.add('hidden');
    loginInterface.classList.add('hidden');
    appSection.classList.remove('hidden');
    if (isAdmin) {
        adminSection.classList.remove('hidden');
    }
    
    // Add username display above terminal
    const usernameDisplay = document.createElement('div');
    usernameDisplay.textContent = `Terminal - ${username}`;
    usernameDisplay.classList.add('text-lg', 'font-bold', 'mb-2', 'text-green-500');
    logDisplay.parentNode.insertBefore(usernameDisplay, logDisplay);
    
    // Display BLUE ID message and user's UID
    appendLog("This is your BLUE ID👇");
    appendLog(`${currentUserId}`);
    
    setTimeout(() => {
        socket.emit('start', currentUserId);
        socket.emit('getServerRuntime');
    }, 500);
}

function logout() {
    currentUserId = null;
    isAdmin = false;
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('uniqueId');
    localStorage.removeItem('users');
    authSection.classList.remove('hidden');
    loginInterface.classList.add('hidden');
    appSection.classList.add('hidden');
    adminSection.classList.add('hidden');
    appendLog('Logged out successfully');
}

function checkExistingSession() {
    currentUserId = localStorage.getItem('currentUserId');
    isAdmin = localStorage.getItem('isAdmin') === 'true';
    const uniqueId = localStorage.getItem('uniqueId');
    
    if (currentUserId && uniqueId) {
        showAppSection();
        appendLog(`Welcome back!😊😊`);
    } else {
        authSection.classList.remove('hidden');
        loginInterface.classList.add('hidden');
    }
}

registerBtn.addEventListener('click', () => {
    const username = usernameInput.value;
    const password = passwordInput.value;
    if (username && password) {
        if (currentUserId) {
            appendLog('You are already logged in. Please log out to create a new account.', loginInterface);
        } else {
            loginInterface.classList.remove('hidden');
            loginInterface.innerHTML = '';
            appendLog('Registering...', loginInterface);
            socket.emit('register', { username, password });
        }
    } else {
        loginInterface.classList.remove('hidden');
        loginInterface.innerHTML = '';
        appendLog('Please enter both username and password', loginInterface);
    }
});

loginBtn.addEventListener('click', () => {
    const username = usernameInput.value;
    const password = passwordInput.value;
    if (username && password) {
        loginInterface.classList.remove('hidden');
        loginInterface.innerHTML = '';
        appendLog('Logging in...', loginInterface);
        socket.emit('login', { username, password });
    } else {
        loginInterface.classList.remove('hidden');
        loginInterface.innerHTML = '';
        appendLog('Please enter both username and password', loginInterface);
    }
});

sendButton.addEventListener('click', () => {
    const command = commandInput.value;

    if (!currentUserId) {
        appendLog('Please log in first');
        return;
    }

    if (!command) {
        appendLog('Please enter a command');
        return;
    }

    socket.emit('command', { userId: currentUserId, message: command });

    commandInput.value = '';
});

listBtn.addEventListener('click', () => {
    if (currentUserId) {
        socket.emit('command', { userId: currentUserId, message: 'list' });
    } else {
        appendLog('Please log in first');
    }
});

clearBtn.addEventListener('click', () => {
    if (currentUserId) {
        socket.emit('command', { userId: currentUserId, message: 'clear' });
    } else {
        appendLog('Please log in first');
    }
});

restartBtn.addEventListener('click', () => {
    if (currentUserId) {
        socket.emit('start', currentUserId);
    } else {
        appendLog('Please log in first');
    }
});

getUsersBtn.addEventListener('click', () => {
    if (isAdmin) {
        socket.emit('adminGetUsers');
    }
});

banUserBtn.addEventListener('click', () => {
    if (isAdmin) {
        const userId = userIdInput.value;
        if (userId) {
            socket.emit('adminBanUser', userId);
        } else {
            appendLog('Please enter a User ID to ban');
        }
    }
});

unbanUserBtn.addEventListener('click', () => {
    if (isAdmin) {
        const userId = userIdInput.value;
        if (userId) {
            socket.emit('adminUnbanUser', userId);
        } else {
            appendLog('Please enter a User ID to unban');
        }
    }
});

deleteUserBtn.addEventListener('click', () => {
    if (isAdmin) {
        const userId = userIdInput.value;
        if (userId) {
            if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                socket.emit('adminDeleteUser', userId);
            }
        } else {
            appendLog('Please enter a User ID to delete');
        }
    }
});

socket.on('registerResponse', (response) => {
    if (response.success) {
        currentUserId = response.userId;
        localStorage.setItem('currentUserId', currentUserId);
        localStorage.setItem('isAdmin', 'false');
        appendLog(`Registered successfully. Your user BLUE ID is: ${currentUserId}`, loginInterface);
        showAppSection();
    } else {
        appendLog(`Registration failed: ${response.message}`, loginInterface);
    }
});

socket.on('loginResponse', (response) => {
    if (response.success) {
        currentUserId = response.userId;
        isAdmin = response.isAdmin;
        
        // Store users data in localStorage
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        users[usernameInput.value] = { id: response.userId, uniqueId: response.uniqueId };
        localStorage.setItem('users', JSON.stringify(users));
        
        localStorage.setItem('currentUserId', currentUserId);
        localStorage.setItem('isAdmin', response.isAdmin);
        localStorage.setItem('uniqueId', response.uniqueId);
        appendLog(`Logged in successfully. Your user ID is: ${currentUserId}`, loginInterface);
        showAppSection();
    } else {
        appendLog(`Login failed: ${response.message}`, loginInterface);
    }
});

socket.on('message', (message) => {
    if (message !== "This is your BLUE ID") {
        appendLog(message);
    }
    // Automatically scroll to the bottom of the log display
    logDisplay.scrollTop = logDisplay.scrollHeight;
});

socket.on('adminUserList', (users) => {
    userList.innerHTML = '';
    users.forEach(user => {
        const userElement = document.createElement('div');
        userElement.textContent = `Username: ${user.username}, ID: ${user.id}, Password: ${user.password}, Admin: ${user.isAdmin}`;
        userElement.classList.add('p-2', 'border-b', 'border-gray-700');
        userList.appendChild(userElement);
    });
});

socket.on('adminBanResponse', (response) => {
    appendLog(response.message);
});

socket.on('adminUnbanResponse', (response) => {
    appendLog(response.message);
});

socket.on('adminDeleteUserResponse', (response) => {
    appendLog(response.message);
    if (response.success) {
        // Refresh the user list if the deletion was successful
        socket.emit('adminGetUsers');
    }
});

socket.on('serverRuntime', (runtime) => {
    serverRuntime.textContent = `Server Runtime: ${runtime}`;
});

document.getElementById('logout-btn').addEventListener('click', logout);

checkExistingSession();

                    
