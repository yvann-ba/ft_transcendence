import '../styles/register.css';
import { redirectAfterAuth } from '../router';
import { languageService } from '../utils/languageContext';

interface RegisterResponse {
    message: string;
    token: string;
}

function updatePageTranslations(): void {
    // Update all elements with data-i18n attribute
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (key) {
            element.textContent = languageService.translate(key);
        }
    });
    
    // Update input placeholders
    const inputs = document.querySelectorAll('[data-i18n-placeholder]');
    inputs.forEach(input => {
        const key = input.getAttribute('data-i18n-placeholder');
        if (key) {
            (input as HTMLInputElement).placeholder = languageService.translate(key);
        }
    });
    
    // Update Google button if it exists
    const googleButton = document.getElementById('google-button');
    if (googleButton) {
        const registerWithText = languageService.translate('auth.register_with', 'S\'inscrire avec');
        googleButton.innerHTML = `${registerWithText} <img src="/assets/images/Google_Logo.png" alt="Google Logo">`;
    }
    
    // Update separator if it exists
    const separator = document.querySelector('.separator span');
    if (separator) {
        separator.textContent = languageService.translate('auth.or', 'ou');
    }
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
        const registerWithText = languageService.translate('auth.register_with', 'S\'inscrire avec');
        googleButton.innerHTML = `${registerWithText} <img src="/assets/images/Google_Logo.png" alt="Google Logo">`;
        
        googleButton.addEventListener('click', () => {
            window.location.href = '/api/auth/google';
        });
        
        const orSeparator = document.createElement('div');
        orSeparator.className = 'separator';
        orSeparator.innerHTML = `<span>${languageService.translate('auth.or', 'ou')}</span>`;
        
        // Insert before the form
        form.parentNode?.insertBefore(orSeparator, form);
        form.parentNode?.insertBefore(googleButton, orSeparator);
    }

    // Update translations now and when language changes
    updatePageTranslations();
    window.addEventListener('languageChanged', updatePageTranslations);

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
            redirectAfterAuth();

        } catch (error: any) {
            messageDiv.textContent = error.message;
            messageDiv.classList.remove('success');
            messageDiv.classList.add('error');
        }
    });
    
    // Make sure the login link is visible
    const loginLinkContainer = document.querySelector('.signup-link') as HTMLElement;
    if (loginLinkContainer) {
        // Check if the link exists
        const existingLink = loginLinkContainer.querySelector('a[href="/login"]');
        
        // If the link doesn't exist, create it properly
        if (!existingLink) {
            const loginText = languageService.translate('auth.login', 'Se connecter');
            loginLinkContainer.innerHTML = `${languageService.translate('auth.has_account', 'Vous avez déjà un compte ?')} <a href="/login" style="color: #BB70AD; font-weight: bold;">${loginText}</a>`;
        }
        
        // Make sure link is visible
        loginLinkContainer.style.display = 'block';
        loginLinkContainer.style.visibility = 'visible';
        loginLinkContainer.style.marginTop = '15px';
        loginLinkContainer.style.textAlign = 'center';
    }
}