import '../styles/login.css';
import { navigate } from '../router';

interface LoginResponse {
    message: string;
    token: string;
}

export default function login() {
    const form = document.getElementById('login-form') as HTMLFormElement;
    const usernameField = document.getElementById('username') as HTMLInputElement;
    const passwordField = document.getElementById('password') as HTMLInputElement;
    const messageDiv = document.getElementById('message') as HTMLElement;
    const loginContainer = document.querySelector('.login-container') as HTMLElement;
    
    // In login.ts, modify the button creation logic:
if (loginContainer && !document.getElementById('oauth42-button')) {
    const oauth42Button = document.createElement('button');
    oauth42Button.type = 'button';
    oauth42Button.id = 'oauth42-button'; // This ID will help us check for duplicates
    oauth42Button.className = 'oauth-button';
    oauth42Button.innerHTML = 'Log with <img src="assets/images/42-logo.png" alt="42 Logo">';
    
    oauth42Button.addEventListener('click', () => {
        window.location.href = '/api/auth/42';
    });
    
    const orSeparator = document.createElement('div');
    orSeparator.className = 'separator';
    orSeparator.innerHTML = '<span>ou</span>';
    
    // Insérer avant le formulaire
    form.parentNode?.insertBefore(orSeparator, form);
    form.parentNode?.insertBefore(oauth42Button, orSeparator);
}
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const username = usernameField.value;
        const password = passwordField.value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors de la connexion');
            }

            const data: LoginResponse = await response.json();

            let path = window.location.href;
            if (path === '/login')
                path = '/home'

            window.history.pushState({}, "", path);
            setTimeout(() => {
                navigate();
            }, 100);

            messageDiv.textContent = 'Connexion réussie !';
            messageDiv.classList.remove('error');
            messageDiv.classList.add('success');

            localStorage.setItem('token', data.token);

        } catch (error: any) {
            messageDiv.textContent = error.message;
            messageDiv.classList.remove('success');
            messageDiv.classList.add('error');
        }
    });
    
    // Vérifier s'il y a une erreur dans l'URL (pour redirection après échec OAuth)
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    if (errorParam === 'auth_failed') {
        messageDiv.textContent = "L'authentification avec 42 a échoué. Veuillez réessayer.";
        messageDiv.classList.remove('success');
        messageDiv.classList.add('error');
    }
}