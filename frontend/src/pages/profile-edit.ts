import "../styles/profile-edit.css";

// ========== FONCTIONS UTILITAIRES ==========

function showNotification(type: 'success' | 'error' | 'info', message: string) {
  // Créer un élément de notification
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  // Ajouter à la page
  document.body.appendChild(notification);
  
  // Afficher avec une animation
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Supprimer après un délai
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// ========== GESTION DE LA MODAL DE CONFIRMATION ==========

function closeConfirmationModal() {
  const modal = document.getElementById('confirmation-modal') as HTMLElement;
  if (modal) {
    modal.style.display = 'none';
  }
}

function openConfirmationModal(title: string, message: string, confirmAction: () => void) {
  const modal = document.getElementById('confirmation-modal') as HTMLElement;
  const modalTitle = document.getElementById('modal-title') as HTMLElement;
  const modalMessage = document.getElementById('modal-message') as HTMLElement;
  const confirmBtn = document.getElementById('modal-confirm') as HTMLElement;
  
  if (!modal || !modalTitle || !modalMessage || !confirmBtn) {
    console.error('Modal elements not found');
    return;
  }
  
  // Configurer le contenu de la modal
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  
  // Configurer l'action de confirmation
  confirmBtn.onclick = () => {
    confirmAction();
    closeConfirmationModal();
  };
  
  // Afficher la modal
  modal.style.display = 'flex';
}

function initConfirmationModal() {
  const modal = document.getElementById('confirmation-modal');
  const closeBtn = document.querySelector('.close-modal');
  const cancelBtn = document.getElementById('modal-cancel');
  
  // Fermer la modal au clic sur le X ou sur Annuler
  closeBtn?.addEventListener('click', closeConfirmationModal);
  cancelBtn?.addEventListener('click', closeConfirmationModal);
  
  // Fermer la modal si on clique en dehors
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeConfirmationModal();
    }
  });
}

// ========== GESTION DU PROFIL ==========

function fillProfileForm(userData: any) {
  // Remplir les champs du formulaire avec les données de l'utilisateur
  const usernameInput = document.getElementById('username') as HTMLInputElement;
  const displayNameInput = document.getElementById('display-name') as HTMLInputElement;
  const avatarPreview = document.getElementById('avatar-preview-img') as HTMLImageElement;
  
  if (usernameInput) usernameInput.value = userData.username || '';
  if (displayNameInput) displayNameInput.value = userData.displayName || '';
  
  // Affichage de l'avatar s'il existe
  if (userData.avatarUrl) {
    avatarPreview.src = userData.avatarUrl;
    avatarPreview.style.display = 'block';
  } else {
    avatarPreview.style.display = 'none';
  }
}

async function loadUserData() {
  try {
    const response = await fetch(`/api/users/me`, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = '/login'; // Redirection si non connecté
        return;
      }
      throw new Error('Failed to fetch user data');
    }
    
    const userData = await response.json();
    fillProfileForm(userData);
  } catch (error) {
    console.error('Error loading user data:', error);
    showNotification('error', 'Impossible de charger vos informations personnelles.');
  }
}

function initProfileForm() {
  const personalInfoForm = document.getElementById('personal-info-form') as HTMLFormElement;
  const avatarInput = document.getElementById('avatar') as HTMLInputElement;
  const avatarPreview = document.getElementById('avatar-preview-img') as HTMLImageElement;
  
  if (!personalInfoForm || !avatarInput || !avatarPreview) {
    console.error('Form elements not found');
    return;
  }
  
  // Chargement initial des données utilisateur
  loadUserData();
  
  // Prévisualisation de l'avatar
  avatarInput.addEventListener('change', (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          avatarPreview.src = e.target.result as string;
          avatarPreview.style.display = 'block';
        }
      };
      reader.readAsDataURL(file);
    }
  });
  
  // Soumission du formulaire de modification de profil
  personalInfoForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    try {
      const formData = new FormData(personalInfoForm);
      
      const response = await fetch(`/api/users/profile`, {
        method: 'PUT',
        credentials: 'include',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      showNotification('success', 'Profil mis à jour avec succès!');
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('error', 'Erreur lors de la mise à jour du profil.');
    }
  });
}

// ========== FONCTIONNALITÉS RGPD ==========

async function handleAccountDeletion() {
  try {
    const response = await fetch(`/api/users/delete-account`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete account');
    }
    
    // Supprimer tout cookie ou stockage local lié à l'authentification
    document.cookie = 'sessionid=; Max-Age=0; path=/;';
    document.cookie = 'auth_token=; Max-Age=0; path=/;';
    
    // Aussi avec le domaine spécifié
    document.cookie = 'sessionid=; Max-Age=0; path=/; domain=' + window.location.hostname;
    document.cookie = 'auth_token=; Max-Age=0; path=/; domain=' + window.location.hostname;
    
    // Supprimer les données locales
    localStorage.removeItem('token');
    
    showNotification('success', 'Votre compte a été supprimé avec succès.');
    
    // Redirection vers la page d'accueil après un court délai
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  } catch (error) {
    console.error('Error deleting account:', error);
    showNotification('error', 'Erreur lors de la suppression de votre compte.');
  }
}

async function handleAnonymization() {
  try {
    const response = await fetch(`/api/users/anonymize`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to anonymize account');
    }
    
    showNotification('success', 'Votre compte a été anonymisé avec succès.');
    
    // Recharger les données pour afficher les changements
    setTimeout(() => {
      loadUserData();
    }, 1500);
  } catch (error) {
    console.error('Error anonymizing account:', error);
    showNotification('error', 'Erreur lors de l\'anonymisation de votre compte.');
  }
}

async function handleDataDownload() {
  try {
    // Notification indiquant que la préparation des données est en cours
    showNotification('info', 'Préparation de vos données...');
    
    const response = await fetch(`/api/users/data-export`, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to download data');
    }
    
    // Télécharger le fichier
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my_data.json';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    showNotification('success', 'Téléchargement terminé!');
  } catch (error) {
    console.error('Error downloading user data:', error);
    showNotification('error', 'Erreur lors du téléchargement de vos données.');
  }
}

function initGDPRFeatures() {
  // Téléchargement des données
  const downloadDataBtn = document.getElementById('download-data-btn');
  downloadDataBtn?.addEventListener('click', handleDataDownload);
  
  // Anonymisation du compte
  const anonymizeBtn = document.getElementById('anonymize-btn');
  anonymizeBtn?.addEventListener('click', () => {
    openConfirmationModal(
      'Anonymiser votre compte',
      'Cette action remplacera vos informations personnelles par des données anonymes. Votre historique de jeu sera conservé, mais ne sera plus lié à votre identité réelle. Cette action est irréversible. Voulez-vous continuer?',
      handleAnonymization
    );
  });
  
  // Suppression du compte
  const deleteAccountBtn = document.getElementById('delete-account-btn');
  deleteAccountBtn?.addEventListener('click', () => {
    openConfirmationModal(
      'Supprimer votre compte',
      'Cette action supprimera définitivement votre compte et toutes les données associées. Cette opération est irréversible. Voulez-vous vraiment supprimer votre compte?',
      handleAccountDeletion
    );
  });
}

// ========== INITIALISATION DE LA PAGE ==========

function initProfileEditPage() {
  initProfileForm();
  initGDPRFeatures();
  initConfirmationModal();
}

// Export de la fonction principale
export default function() {
  initProfileEditPage();
  // Vous pouvez retourner une fonction de nettoyage si nécessaire
  return () => {
    // Nettoyage des event listeners si nécessaire
    console.log("Nettoyage de la page profile-edit");
  };
}