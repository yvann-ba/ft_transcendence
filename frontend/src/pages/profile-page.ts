import "../styles/profile-page.css";

function initializeProfilePage(): () => void {
	const tabLinks = document.querySelectorAll<HTMLElement>('.tab-link');
	const tabContents = document.querySelectorAll<HTMLElement>('.tab-content');
	
	function handleTabClick(this: HTMLElement): void {
		// Remove active classes
		tabLinks.forEach(tab => tab.classList.remove('active'));
		tabContents.forEach(content => {
			content.classList.remove('active');
			content.classList.add('fade-out');
		});
		
		// Add active class to clicked tab
		this.classList.add('active');
		
		// Get and activate associated content
		const tabId = this.getAttribute('data-tab');
		if (tabId) {
			const content = document.getElementById(tabId);
			if (content) {
				// Small delay to allow fade out to complete
				setTimeout(() => {
					content.classList.remove('fade-out');
					content.classList.add('active', 'fade-in');
				}, 150);
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