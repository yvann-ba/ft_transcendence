import "../styles/profile-page.css";

function initializeProfilePage(): () => void {
	const tabLinks = document.querySelectorAll<HTMLElement>('.tab-link');
	const tabContents = document.querySelectorAll<HTMLElement>('.tab-content');
  
	function handleTabClick(this: HTMLElement) {
		tabLinks.forEach(tab => tab.classList.remove('active'));
		tabContents.forEach(content => content.classList.remove('active'));
  
		// Ajouter la classe 'active' à l'onglet cliqué
		this.classList.add('active');
  
		// Récupérer l'id du contenu associé via l'attribut data-tab
		const tabId = this.getAttribute('data-tab');
		if (tabId) {
		  const content = document.getElementById(tabId);
		  if (content) {
			content.classList.add('active');
		  }
		}
	}
  
	tabLinks.forEach(link => link.addEventListener('click', handleTabClick));
  
	return () => {
	  tabLinks.forEach(link => link.removeEventListener('click', handleTabClick));
	};
  }

if (document.readyState !== 'loading') {
  initializeProfilePage();
} else {
  document.addEventListener('DOMContentLoaded', initializeProfilePage);
}

export default initializeProfilePage;
