function addGlowEffect(button) {
  button.classList.add('glow-effect');
  setTimeout(() => {
    button.classList.remove('glow-effect');
  }, 1000);
}

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
const togglePasswordBtn = document.getElementById('toggle-password');
const passwordStrength = document.getElementById('password-strength');
const passwordRequirements = document.getElementById('password-requirements');

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
    
    if (currentUserId) {
        showAppSection();
        appendLog(`Welcome back!😊😊`);
    } else {
        authSection.classList.remove('hidden');
        loginInterface.classList.add('hidden');
    }
}

function getClientId() {
  let clientId = localStorage.getItem('clientId');
  if (!clientId) {
    clientId = 'client_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('clientId', clientId);
  }
  return clientId;
}

function togglePasswordVisibility() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePasswordBtn.innerHTML = type === 'password' ? 
        '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" /></svg>' : 
        '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" /><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" /></svg>';
}

function checkPasswordStrength() {
    const password = passwordInput.value;
    passwordRequirements.classList.remove('hidden');
    
    if (password.length >= 7) {
        passwordStrength.textContent = 'Password strength: Strong';
        passwordStrength.className = 'mb-2 text-sm text-green-500';
        return true;
    } else {
        passwordStrength.textContent = 'Password strength: Weak';
        passwordStrength.className = 'mb-2 text-sm text-red-500';
        return false;
    }
}

registerBtn.addEventListener('click', () => {
    addGlowEffect(registerBtn);
    const username = usernameInput.value;
    const password = passwordInput.value;
    if (username && password) {
        if (currentUserId) {
            appendLog('You are already logged in. Please log out to create a new account.', loginInterface);
        } else if (!checkPasswordStrength()) {
            appendLog('Password must be at least 7 characters long.', loginInterface);
        } else {
            loginInterface.classList.remove('hidden');
            loginInterface.innerHTML = '';
            appendLog('Registering...', loginInterface);
            socket.emit('register', { username, password, clientId: getClientId() });
        }
    } else {
        loginInterface.classList.remove('hidden');
        loginInterface.innerHTML = '';
        appendLog('Please enter both username and password', loginInterface);
    }
});

loginBtn.addEventListener('click', () => {
    addGlowEffect(loginBtn);
    const username = usernameInput.value;
    const password = passwordInput.value;
    if (username && password) {
        loginInterface.classList.remove('hidden');
        loginInterface.innerHTML = '';
        appendLog('Logging in...', loginInterface);
        socket.emit('login', { username, password, clientId: getClientId() });
    } else {
        loginInterface.classList.remove('hidden');
        loginInterface.innerHTML = '';
        appendLog('Please enter both username and password', loginInterface);
    }
});

sendButton.addEventListener('click', () => {
    addGlowEffect(sendButton);
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
    addGlowEffect(listBtn);
    if (currentUserId) {
        socket.emit('command', { userId: currentUserId, message: 'list' });
    } else {
        appendLog('Please log in first');
    }
});

clearBtn.addEventListener('click', () => {
    addGlowEffect(clearBtn);
    if (currentUserId) {
        socket.emit('command', { userId: currentUserId, message: 'clear' });
    } else {
        appendLog('Please log in first');
    }
});

restartBtn.addEventListener('click', () => {
    addGlowEffect(restartBtn);
    if (currentUserId) {
        socket.emit('start', currentUserId);
    } else {
        appendLog('Please log in first');
    }
});

getUsersBtn.addEventListener('click', () => {
    addGlowEffect(getUsersBtn);
    if (isAdmin) {
        socket.emit('adminGetUsers');
    }
});

banUserBtn.addEventListener('click', () => {
    addGlowEffect(banUserBtn);
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
    addGlowEffect(unbanUserBtn);
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
    addGlowEffect(deleteUserBtn);
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
        users[usernameInput.value] = { id: response.userId };
        localStorage.setItem('users', JSON.stringify(users));
        
        localStorage.setItem('currentUserId', currentUserId);
        localStorage.setItem('isAdmin', response.isAdmin);
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

socket.on('adminUserList', ({ users, totalUserCount }) => {
    userList.innerHTML = `<div class="p-2 border-b border-gray-700 font-bold">Total Users: ${totalUserCount} / 25</div>`;
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

togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
passwordInput.addEventListener('input', checkPasswordStrength);

    
