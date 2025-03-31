import "../styles/profile-edit.css";
import { UserService } from "../services/user-service";

export default function ProfileEdit() {
  const personalInfoForm = document.getElementById('personal-info-form') as HTMLFormElement;
  const usernameInput = document.getElementById('username') as HTMLInputElement;
  const firstnameInput = document.getElementById('firstname') as HTMLInputElement;
  const lastnameInput = document.getElementById('lastname') as HTMLInputElement;
  const avatarPreviewImg = document.getElementById('avatar-preview-img') as HTMLImageElement;
  const avatarDeleteBtn = document.getElementById('avatar-delete-btn') as HTMLButtonElement;
  
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
      console.log(userData);
      if (userData) {
        usernameInput.value = userData.username || '';
        firstnameInput.value = userData.first_name || '';
        lastnameInput.value = userData.last_name || '';
        
        if (userData.avatar) {
          avatarPreviewImg.src = userData.avatar;
        } else {
          avatarPreviewImg.src = '/assets/default-avatar.png';
        }
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
      
      await userService.updateUserProfile(updatedData);
      showSuccess('Profile updated successfully!');
    } catch (error) {
      showError('Failed to update profile. Please try again.');
    }
  });

  avatarDeleteBtn.addEventListener('click', async () => {
    try {
      await userService.deleteAvatar();
      avatarPreviewImg.src = '/assets/default-avatar.png';
      showSuccess('Avatar deleted successfully!');
    } catch (error) {
      showError('Failed to delete avatar. Please try again.');
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

  // Confirmation action handler
  modalConfirmBtn.addEventListener('click', async () => {
    try {
      switch (currentAction) {
        case 'download':
          const data = await userService.downloadUserData();
          downloadJsonFile(data, 'my-account-data.json');
          showSuccess('Your data has been downloaded!');
          break;

        case 'anonymize':
          await userService.anonymizeAccount();
          showSuccess('Your account has been anonymized. You will be logged out.');
          setTimeout(() => {
            window.location.href = '/logout';
          }, 2000);
          break;

        case 'delete':
          await userService.deleteAccount();
          showSuccess('Your account has been deleted. You will be redirected.');
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
          break;
      }
      closeModal();
    } catch (error) {
      showError(`Failed to ${currentAction} data. Please try again.`);
      closeModal();
    }
  });

  // Helper functions
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
    alert(message);
  }

  function showError(message: string) {
    alert(message);
  }

  initializeUserData();
}