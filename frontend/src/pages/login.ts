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

			event.preventDefault();
			let path = window.location.href;
			if (path === '/login')
				path = '/home'

			event.preventDefault();
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
}