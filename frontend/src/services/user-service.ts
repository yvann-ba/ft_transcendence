export class UserService {
  private baseUrl = '/api/users';
  
  async getCurrentUser() {
    const response = await fetch(`/api/users/me`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    
    return await response.json();
  }
  
  async updateUserProfile(userData: any) {
    const response = await fetch(`/api/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to update profile');
    }
    
    return await response.json();
  }
  
  async deleteAvatar() {
    const response = await fetch(`/api/users/me/avatar`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete avatar');
    }
    
    return true;
  }
  
  async downloadUserData() {
    const response = await fetch(`/api/users/me/data`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to download user data');
    }
    
    return await response.json();
  }
  
  async anonymizeAccount() {
    const response = await fetch(`/api/users/me/anonymize`, {
      method: 'POST',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to anonymize account');
    }
    
    return true;
  }
  
  async deleteAccount() {
    const response = await fetch(`/api/users/me`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete account');
    }
    
    return true;
  }
}