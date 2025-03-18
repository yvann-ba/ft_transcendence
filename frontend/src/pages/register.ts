import '../styles/register.css';
import { navigate } from '../router';

interface RegisterResponse {
    message: string;
    token: string;
}

export default function register() {
    const form = document.getElementById('register-form') as HTMLFormElement;
    const usernameField = document.getElementById('username') as HTMLInputElement;
    const passwordField = document.getElementById('password') as HTMLInputElement;
    const confirmPasswordField = document.getElementById('confirm-password') as HTMLInputElement;
    const firstNameField = document.getElementById('first-name') as HTMLInputElement;
    const lastNameField = document.getElementById('last-name') as HTMLInputElement;
    const messageDiv = document.getElementById('message') as HTMLElement;
    const registerContainer = document.querySelector('.register-container') as HTMLElement;
    
    // Add Google authentication button
    if (registerContainer && !document.getElementById('google-button')) {
        const googleButton = document.createElement('button');
        googleButton.type = 'button';
        googleButton.id = 'google-button';
        googleButton.className = 'oauth-button google-button';
        googleButton.innerHTML = 'S\'inscrire avec <img src="/assets/images/Google_Logo.png" alt="Google Logo">';
        
        googleButton.addEventListener('click', () => {
            window.location.href = '/api/auth/google';
        });
        
        const orSeparator = document.createElement('div');
        orSeparator.className = 'separator';
        orSeparator.innerHTML = '<span>ou</span>';
        
        // Insert before the form
        form.parentNode?.insertBefore(orSeparator, form);
        form.parentNode?.insertBefore(googleButton, orSeparator);
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        // Get form values
        const username = usernameField.value;
        const password = passwordField.value;
        const confirmPassword = confirmPasswordField.value;
        const firstName = firstNameField.value;
        const lastName = lastNameField.value;
        
        // Basic form validation
        if (password !== confirmPassword) {
            messageDiv.textContent = 'Les mots de passe ne correspondent pas';
            messageDiv.classList.remove('success');
            messageDiv.classList.add('error');
            return;
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password,
                    firstName,
                    lastName
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors de l\'inscription');
            }

            const data: RegisterResponse = await response.json();

            messageDiv.textContent = 'Inscription réussie !';
            messageDiv.classList.remove('error');
            messageDiv.classList.add('success');

            // Store token and redirect
            localStorage.setItem('token', data.token);
            
            // Redirect to home page
            setTimeout(() => {
                window.history.pushState({}, "", '/home');
                navigate();
            }, 1000);

        } catch (error: any) {
            messageDiv.textContent = error.message;
            messageDiv.classList.remove('success');
            messageDiv.classList.add('error');
        }
    });
    
    // Check for error in URL (for OAuth redirect failures)
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    if (errorParam === 'auth_failed') {
        messageDiv.textContent = "L'authentification avec Google a échoué. Veuillez réessayer.";
        messageDiv.classList.remove('success');
        messageDiv.classList.add('error');
    }
}