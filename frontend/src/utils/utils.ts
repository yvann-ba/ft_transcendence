export function getCookie(name: string) : string | null {

	console.log('cookielo:', document.cookie);

    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    avatar?: string;
    player_games: number;
    player_wins: number;
    created_at: string;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch('/api/users/me', {
      credentials: 'include'
    });
    
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        return null;
      }
      throw new Error('Erreur lors de la récupération du profil');
    }
    
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error('Erreur complète:', error);
    return null;
  }
}
