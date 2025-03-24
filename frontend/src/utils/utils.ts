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
    avatar_url?: string; // Make sure this matches your backend field name
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
        console.log("Unauthorized access, clearing token");
        localStorage.removeItem('token');
        return null;
      }
      throw new Error(`Error retrieving profile: ${response.status} ${response.statusText}`);
    }
    
    const userData = await response.json();
    console.log("User data retrieved from /api/users/me:", userData); // Log the data
    return userData;
  } catch (error) {
    console.error('Complete error:', error);
    return null;
  }
}
