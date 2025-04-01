import "../styles/profile-edit.css";
import { UserService } from "../services/user-service";
import { navigate } from "../router";
import { handleLogout } from "./profile-page";

export default function ProfileEdit() {
  const personalInfoForm = document.getElementById('personal-info-form') as HTMLFormElement;
  const usernameInput = document.getElementById('username') as HTMLInputElement;
  const firstnameInput = document.getElementById('firstname') as HTMLInputElement;
  const lastnameInput = document.getElementById('lastname') as HTMLInputElement;
  
  const downloadDataBtn = document.getElementById('download-data-btn') as HTMLButtonElement;
  const anonymizeBtn = document.getElementById('anonymize-btn') as HTMLButtonElement;
  const deleteAccountBtn = document.getElementById('delete-account-btn') as HTMLButtonElement;
  
  const confirmationModal = document.getElementById('confirmation-modal') as HTMLDivElement;
  const modalTitle = document.getElementById('modal-title') as HTMLHeadingElement;
  const modalMessage = document.getElementById('modal-message') as HTMLParagraphElement;
  const modalCancelBtn = document.getElementById('modal-cancel') as HTMLButtonElement;
  const modalConfirmBtn = document.getElementById('modal-confirm') as HTMLButtonElement;
  const closeModalBtn = document.querySelector('.close-modal') as HTMLSpanElement;

  let currentAction: 'download' | 'anonymize' | 'delete' | null = null;
  const userService = new UserService();


  async function initializeUserData() {
    try {
      const userData = await userService.getCurrentUser();
      if (userData) {
        usernameInput.value = userData.username || '';
        firstnameInput.value = userData.first_name || '';
        lastnameInput.value = userData.last_name || '';
      }
    } catch (error) {
      showError('Failed to load user data. Please try again later.');
    }
  }

  personalInfoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
      const updatedData = {
        username: usernameInput.value,
        firstname: firstnameInput.value,
        lastname: lastnameInput.value
      };
      
      const res = await userService.updateUserProfile(updatedData);
      if (res.success === false)
        showError(res.error);
      else
        showSuccess('Profile updated successfully!');
    } catch (error) {
      showError('Failed to update profile. Please try again.');
    }
  });

  function showModal(title: string, message: string, action: 'download' | 'anonymize' | 'delete') {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    currentAction = action;
    confirmationModal.style.display = 'block';
    
    if (action === 'delete') {
      modalConfirmBtn.className = 'btn btn-danger';
    } else if (action === 'anonymize') {
      modalConfirmBtn.className = 'btn btn-warning';
    } else {
      modalConfirmBtn.className = 'btn btn-primary';
    }
  }

  function closeModal() {
    confirmationModal.style.display = 'none';
    currentAction = null;
  }

  closeModalBtn.addEventListener('click', closeModal);
  modalCancelBtn.addEventListener('click', closeModal);
  window.addEventListener('click', (e) => {
    if (e.target === confirmationModal) {
      closeModal();
    }
  });

  downloadDataBtn.addEventListener('click', () => {
    showModal(
      'Download Your Data',
      'Are you sure you want to download all your personal data? The process may take a few moments.',
      'download'
    );
  });

  anonymizeBtn.addEventListener('click', () => {
    showModal(
      'Anonymize Your Account',
      'This will remove all personal identifying information while keeping your game statistics. This action cannot be undone. Are you sure you want to continue?',
      'anonymize'
    );
  });

  deleteAccountBtn.addEventListener('click', () => {
    showModal(
      'Delete Your Account',
      'Warning! This will permanently delete your account and ALL associated data. This action cannot be undone. Are you sure you want to proceed?',
      'delete'
    );
  });

  modalConfirmBtn.addEventListener('click', async () => {
    try {
      switch (currentAction) {
        case 'download':
          const data = await userService.downloadUserData();
          downloadJsonFile(data, 'my-account-data.json');
          showSuccess('Your data has been downloaded!');
          break;

          case 'anonymize':
            try {
              const anonymizationResult = await userService.anonymizeAccount();
              
              if (anonymizationResult && anonymizationResult.newUsername) {
                showSuccess(`Votre compte a été anonymisé. Votre nouveau nom d'utilisateur est : ${anonymizationResult.newUsername}`);
                
                const anonymizationInfo = {
                  message: "Votre compte a été anonymisé avec succès",
                  newUsername: anonymizationResult.newUsername,
                  date: new Date().toISOString()
                };
                
                const downloadBtn = document.createElement('button');
                downloadBtn.textContent = "Télécharger mes nouvelles informations";
                downloadBtn.className = "btn btn-primary download-info-btn";
                downloadBtn.onclick = () => {
                  downloadJsonFile(anonymizationInfo, 'mes-nouvelles-infos.json');
                };
                
                const toastContainer = document.getElementById('toast-container');
                if (toastContainer) {
                  toastContainer.appendChild(downloadBtn);
                }
                
                setTimeout(() => {
                  handleLogout();
                  navigate('/');
                }, 10000);
              } else {
                showSuccess('Votre compte a été anonymisé. Vous allez être déconnecté.');
                setTimeout(() => {
                  handleLogout();
                  navigate('/');
                }, 3000);
              }
            } catch (error) {
              showError("Erreur lors de l'anonymisation du compte.");
              closeModal();
            }
            break;

        case 'delete':
          await userService.deleteAccount();
          showSuccess('Your account has been deleted. You will be redirected.');
          setTimeout(() => {
            handleLogout();
          }, 1000);
          break;
      }
      closeModal();
    } catch (error) {
      showError(`Failed to ${currentAction} data. Please try again.`);
      closeModal();
    }
  });

  function downloadJsonFile(data: any, filename: string) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  function showSuccess(message: string) {
    showToast(message, 'success');
  }

  function showError(message: string) {
    showToast(message, 'error');
  }

  function showToast(message: string, type: 'success' | 'error' | 'info' | 'warning') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}-toast`;
    
    let icon = '';
    switch (type) {
      case 'success':
        icon = '✓';
        break;
      case 'error':
        icon = '✗';
        break;
      case 'warning':
        icon = '⚠';
        break;
      case 'info':
        icon = 'ℹ';
        break;
    }
    
    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-message">${message}</div>
      <button class="toast-close">×</button>
    `;
    
    toastContainer.appendChild(toast);
    
    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn)
    {
      closeBtn.addEventListener('click', () => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 300);
      });
    }

    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 300);
    }, 5000);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
  }

  initializeUserData();
}