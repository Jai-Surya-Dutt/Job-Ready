// Login Modal Functionality
function showLogin() {
    // Create modal if it doesn't exist
    let modal = document.getElementById('loginModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'loginModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Login</h2>
                <form id="loginForm">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" required>
                    </div>
                    <button type="submit" class="login-btn">Login</button>
                </form>
                <p class="register-link">Don't have an account? <a href="register.html">Register</a></p>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Show modal
    modal.style.display = 'block';

    // Close button functionality
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }

    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    // Handle form submission
    const loginForm = document.getElementById('loginForm');
    loginForm.onsubmit = function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Here you would typically make an API call to your backend
        // For now, we'll just simulate a successful login
        console.log('Login attempt:', { email, password });
        
        // Close modal after successful login
        modal.style.display = 'none';
        
        // Update UI to show logged in state
        updateLoginState(true);
    }
}

// Function to update UI based on login state
function updateLoginState(isLoggedIn) {
    const loginBtn = document.querySelector('.login-btn');
    if (isLoggedIn) {
        loginBtn.innerHTML = '<i class="fas fa-user"></i> Logout';
        loginBtn.onclick = function() {
            // Handle logout
            updateLoginState(false);
        };
    } else {
        loginBtn.innerHTML = '<i class="fas fa-user"></i> Login';
        loginBtn.onclick = showLogin;
    }
}

// Add styles for modal
const style = document.createElement('style');
style.textContent = `
    .modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
    }

    .modal-content {
        background-color: #fefefe;
        margin: 15% auto;
        padding: 20px;
        border: 1px solid #888;
        width: 80%;
        max-width: 500px;
        border-radius: 8px;
        position: relative;
    }

    .close {
        color: #aaa;
        float: right;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
    }

    .close:hover {
        color: #333;
    }

    .form-group {
        margin-bottom: 15px;
    }

    .form-group label {
        display: block;
        margin-bottom: 5px;
        color: #333;
    }

    .form-group input {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
    }

    .register-link {
        text-align: center;
        margin-top: 15px;
    }

    .register-link a {
        color: rgb(43, 140, 77);
        text-decoration: none;
    }

    .register-link a:hover {
        text-decoration: underline;
    }
`;
document.head.appendChild(style); 