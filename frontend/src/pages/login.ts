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
    
    // Ajouter le bouton de connexion Google
    if (loginContainer && !document.getElementById('google-button')) {
        const googleButton = document.createElement('button');
        googleButton.type = 'button';
        googleButton.id = 'google-button';
        googleButton.className = 'oauth-button google-button';
        googleButton.innerHTML = 'Se connecter avec <img src="assets/images/Google_Logo.png" alt="Google Logo"> Google';
        
        googleButton.addEventListener('click', () => {
            window.location.href = '/api/auth/google';
        });
        
        const orSeparator = document.createElement('div');
        orSeparator.className = 'separator';
        orSeparator.innerHTML = '<span>ou</span>';
        
        // Insérer avant le formulaire
        form.parentNode?.insertBefore(orSeparator, form);
        form.parentNode?.insertBefore(googleButton, orSeparator);
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
        messageDiv.textContent = "L'authentification avec Google a échoué. Veuillez réessayer.";
        messageDiv.classList.remove('success');
        messageDiv.classList.add('error');
    }
}