import "../styles/profile-page.css";

// Ajouter au début du fichier
interface User42Profile {
    id: number;
    login: string;
    displayname: string;
    image: {
        link: string;
    };
    // Autres champs que vous souhaitez utiliser
}

async function loadUserProfile(): Promise<User42Profile | null> {
    try {
        const response = await fetch('/api/user/profile', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Échec du chargement du profil');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        return null;
    }
}


async function initializeProfilePage(): Promise<() => void> {

    const profileData = await loadUserProfile();
    if (profileData) {
        // Mettre à jour l'interface avec les données de l'utilisateur
        const profileImage = document.getElementById('profile-image') as HTMLImageElement;
        const profileName = document.getElementById('profile-name') as HTMLElement;
        
        if (profileImage && profileData.image && profileData.image.link) {
            profileImage.src = profileData.image.link;
            profileImage.alt = profileData.displayname || profileData.login;
        }
        
        if (profileName) {
            profileName.textContent = profileData.displayname || profileData.login;
        }
    }
    
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
                    
                    // Special animations based on tab
                    if (tabId === 'tab-stats') {
                        setTimeout(animateChart, 300);
                    } else if (tabId === 'tab-history') {
                        animateHistoryTable();
                    }
				}, 150);
			}
		}
	}
	
	tabLinks.forEach(link => link.addEventListener('click', handleTabClick));
	
    // Initialize the win/loss chart
    initializeChart();
    
    // Initialize history table animations
    initializeHistoryTable();
	
	return () => {
		tabLinks.forEach(link => link.removeEventListener('click', handleTabClick));
        
        // Remove chart event listeners if needed
        const winSegment = document.getElementById('win-segment');
        const lossSegment = document.getElementById('loss-segment');
        if (winSegment && lossSegment) {
            winSegment.removeEventListener('mouseenter', handleSegmentMouseEnter);
            winSegment.removeEventListener('mouseleave', handleSegmentMouseLeave);
            winSegment.removeEventListener('mousemove', handleSegmentMouseMove);
            lossSegment.removeEventListener('mouseenter', handleSegmentMouseEnter);
            lossSegment.removeEventListener('mouseleave', handleSegmentMouseLeave);
            lossSegment.removeEventListener('mousemove', handleSegmentMouseMove);
        }
        
        // Remove history table event listeners
        const historyRows = document.querySelectorAll('#tab-history tbody tr');
        historyRows.forEach(row => {
            row.removeEventListener('mouseenter', handleHistoryRowHover);
            row.removeEventListener('mouseleave', handleHistoryRowLeave);
        });
	};
}

// Chart event handler references (for cleanup)
let handleSegmentMouseEnter: (this: HTMLElement, event: MouseEvent) => void;
let handleSegmentMouseLeave: (event: MouseEvent) => void;
let handleSegmentMouseMove: (event: MouseEvent) => void;

// History row event handlers
let handleHistoryRowHover: (this: HTMLElement, event: Event) => void;
let handleHistoryRowLeave: (this: HTMLElement, event: Event) => void;

// Chart animation function reference
let animateChart: () => void;
let animateHistoryTable: () => void;

function initializeHistoryTable(): void {
    const historyTab = document.getElementById('tab-history');
    if (!historyTab) return;
    
    // Add a result indicator badge to each row
    const rows = historyTab.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const resultCell = row.querySelector('td:last-child');
        if (!resultCell) return;
        
        const cellText = resultCell.textContent?.trim().toLowerCase() || '';
        // Check for various win indicators in the text
        const isWin = cellText.includes('win') || cellText === 'w' || cellText === 'victory' || cellText === '1';
        const resultBadge = document.createElement('span');
        resultBadge.className = `result-badge ${isWin ? 'win' : 'loss'}`;
        resultBadge.textContent = isWin ? 'W' : 'L';
        
        // Replace text with badge
        resultCell.textContent = '';
        resultCell.appendChild(resultBadge);
        
        // Add result class to the row for styling
        row.classList.add(isWin ? 'win-row' : 'loss-row');
        
        // Add data attributes for filtering later if needed
        row.setAttribute('data-result', isWin ? 'win' : 'loss');
        
        // Add animation classes but keep them invisible at first
        row.classList.add('animated-row');
        (row as HTMLElement).style.opacity = '0';
        (row as HTMLElement).style.transform = 'translateY(20px)';
    });
    
    // Define hover handlers
    handleHistoryRowHover = function(this: HTMLElement, _event: Event) {
        this.classList.add('row-hover');
        
        // Add pulse animation to the badge
        const badge = this.querySelector('.result-badge');
        if (badge) {
            badge.classList.add('pulse');
        }
        
        // Highlight opponent name with glow effect
        const opponentCell = this.querySelector('td:nth-child(2)');
        if (opponentCell) {
            opponentCell.classList.add('highlight-opponent');
        }
    };
    
    handleHistoryRowLeave = function(this: HTMLElement, _event: Event) {
        this.classList.remove('row-hover');
        
        // Remove pulse
        const badge = this.querySelector('.result-badge');
        if (badge) {
            badge.classList.remove('pulse');
        }
        
        // Remove highlight
        const opponentCell = this.querySelector('td:nth-child(2)');
        if (opponentCell) {
            opponentCell.classList.remove('highlight-opponent');
        }
    };
    
    // Add hover effects
    rows.forEach(row => {
        row.addEventListener('mouseenter', handleHistoryRowHover);
        row.addEventListener('mouseleave', handleHistoryRowLeave);
    });
    
    // Add table sorting functionality
    const headerCells = historyTab.querySelectorAll('thead th');
    headerCells.forEach((header, index) => {
        (header as HTMLElement).style.cursor = 'pointer';
        header.setAttribute('data-sort-direction', 'none');
        header.addEventListener('click', () => sortTable(index, header));
    });
    
    // Add table header styling
    const headerRow = historyTab.querySelector('thead tr');
    if (headerRow) {
        headerRow.classList.add('header-row-animated');
    }
    
    // Animation function
    animateHistoryTable = () => {
        // Reset all rows first
        rows.forEach(row => {
            (row as HTMLElement).style.opacity = '0';
            (row as HTMLElement).style.transform = 'translateY(20px)';
            (row as HTMLElement).style.transition = 'none';
        });
        
        // Force reflow
        void historyTab.offsetWidth;
        
        // Animate header first
        if (headerRow) {
            headerRow.classList.add('header-active');
        }
        
        // Stagger the row animations
        rows.forEach((row, index) => {
            setTimeout(() => {
                (row as HTMLElement).style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                (row as HTMLElement).style.opacity = '1';
                (row as HTMLElement).style.transform = 'translateY(0)';
            }, 150 + (index * 100));
        });
    };
    
    // Check if history tab is active and animate if needed
    if (historyTab.classList.contains('active')) {
        setTimeout(animateHistoryTable, 300);
    }
}

function sortTable(columnIndex: number, headerElement: Element): void {
    const historyTable = document.querySelector('#tab-history table');
    if (!historyTable) return;
    
    const tbody = historyTable.querySelector('tbody');
    if (!tbody) return;
    
    // Get current sort direction and update it
    const currentDirection = headerElement.getAttribute('data-sort-direction') || 'none';
    const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
    
    // Reset all headers
    const allHeaders = historyTable.querySelectorAll('thead th');
    allHeaders.forEach(header => {
        header.setAttribute('data-sort-direction', 'none');
        header.classList.remove('sorted-asc', 'sorted-desc');
    });
    
    // Set new sort direction
    headerElement.setAttribute('data-sort-direction', newDirection);
    headerElement.classList.add(newDirection === 'asc' ? 'sorted-asc' : 'sorted-desc');
    
    // Get all rows and convert to array for sorting
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    // Sort rows
    rows.sort((rowA, rowB) => {
        const cellA = rowA.cells[columnIndex].textContent?.trim() || '';
        const cellB = rowB.cells[columnIndex].textContent?.trim() || '';
        
        // If sorting date column
        if (columnIndex === 0) {
            const dateA = new Date(cellA).getTime();
            const dateB = new Date(cellB).getTime();
            return newDirection === 'asc' ? dateA - dateB : dateB - dateA;
        }
        
        // If sorting result column (assumes badges are used)
        if (columnIndex === 2) {
            const isWinA = rowA.classList.contains('win-row');
            const isWinB = rowB.classList.contains('win-row');
            if (isWinA === isWinB) return 0;
            if (newDirection === 'asc') {
                return isWinA ? -1 : 1;
            } else {
                return isWinA ? 1 : -1;
            }
        }
        
        // Default string comparison
        const comparison = cellA.localeCompare(cellB);
        return newDirection === 'asc' ? comparison : -comparison;
    });
    
    // Apply animation class to indicate sorting
    tbody.classList.add('sorting');
    
    // Re-append rows in sorted order with staggered animation
    setTimeout(() => {
        rows.forEach((row, index) => {
            (row as HTMLElement).style.opacity = '0';
            (row as HTMLElement).style.transform = 'translateY(10px)';
            tbody.appendChild(row);
            
            // Staggered fade-in animation
            setTimeout(() => {
                (row as HTMLElement).style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                (row as HTMLElement).style.opacity = '1';
                (row as HTMLElement).style.transform = 'translateY(0)';
            }, 50 * index);
        });
        
        // Remove sorting class after animation completes
        setTimeout(() => {
            tbody.classList.remove('sorting');
        }, rows.length * 50 + 300);
    }, 300);
}

function initializeChart(): void {
    // Data from your profile
    const wins = 85;
    const losses = 65;
    const total = wins + losses;
    const winPercentage = (wins / total * 100).toFixed(1);
    const lossPercentage = (losses / total * 100).toFixed(1);
    
    // Calculate circumference of the circle
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    
    // Elements
    const winSegment = document.getElementById('win-segment');
    const lossSegment = document.getElementById('loss-segment');
    const winPercentageText = document.getElementById('win-percentage');
    const winLegend = document.getElementById('win-legend');
    const lossLegend = document.getElementById('loss-legend');
    const tooltip = document.getElementById('chart-tooltip');
    
    if (!winSegment || !lossSegment || !winPercentageText || !winLegend || !lossLegend || !tooltip) {
        return;
    }
    
    // Set win percentage text
    winPercentageText.textContent = `${winPercentage}% Wins`;
    
    // Function to animate the chart
    animateChart = () => {
        // Calculate stroke dasharray values
        const winDashArray = `${circumference * wins / total} ${circumference}`;
        const lossDashArray = `${circumference * losses / total} ${circumference}`;
        
        // Reset to initial state (for re-animation)
        winSegment.style.transition = 'none';
        lossSegment.style.transition = 'none';
        winSegment.style.strokeDasharray = `0 ${circumference}`;
        lossSegment.style.strokeDasharray = `0 ${circumference}`;
        lossSegment.style.strokeDashoffset = `${-circumference * wins / total}`;
        
        // Force reflow
        void winSegment.offsetWidth;
        
        // Remove visible class from legend items
        winLegend.classList.remove('visible');
        lossLegend.classList.remove('visible');
        
        // Animate win segment
        setTimeout(() => {
            winSegment.style.transition = 'stroke-dasharray 1.5s ease-in-out';
            winSegment.style.strokeDasharray = winDashArray;
        }, 300);
        
        // Animate loss segment
        setTimeout(() => {
            lossSegment.style.transition = 'stroke-dasharray 1.5s ease-in-out';
            lossSegment.style.strokeDasharray = lossDashArray;
            
            // Show legend with delay
            setTimeout(() => {
                winLegend.classList.add('visible');
                setTimeout(() => lossLegend.classList.add('visible'), 200);
            }, 500);
        }, 600);
    };
    
    // Add hover interactions for segments
    const chartContainer = document.querySelector('.chart-container');
    if (!chartContainer) return;
    
    // Define event handlers (store references for cleanup)
    handleSegmentMouseEnter = function(this: HTMLElement, _e: MouseEvent) {
        tooltip.style.opacity = '1';
        
        if (this === winSegment) {
            tooltip.textContent = `Wins: ${wins} (${winPercentage}%)`;
            winSegment.style.stroke = '#5dca60';
        } else {
            tooltip.textContent = `Losses: ${losses} (${lossPercentage}%)`;
            lossSegment.style.stroke = '#ff5c50';
        }
    };
    
    handleSegmentMouseLeave = function(_e: MouseEvent) {
        tooltip.style.opacity = '0';
        winSegment.style.stroke = '#4CAF50';
        lossSegment.style.stroke = '#F44336';
    };
    
    handleSegmentMouseMove = function(e: MouseEvent) {
        const rect = chartContainer.getBoundingClientRect();
        tooltip.style.left = `${e.clientX - rect.left + 10}px`;
        tooltip.style.top = `${e.clientY - rect.top - 30}px`;
    };
    
    // Add event listeners
    winSegment.addEventListener('mouseenter', handleSegmentMouseEnter);
    winSegment.addEventListener('mouseleave', handleSegmentMouseLeave);
    winSegment.addEventListener('mousemove', handleSegmentMouseMove);
    
    lossSegment.addEventListener('mouseenter', handleSegmentMouseEnter);
    lossSegment.addEventListener('mouseleave', handleSegmentMouseLeave);
    lossSegment.addEventListener('mousemove', handleSegmentMouseMove);
    
    // Check if stats tab is currently active and animate if needed
    const statsTab = document.getElementById('tab-stats');
    if (statsTab && statsTab.classList.contains('active')) {
        animateChart();
    }
}

if (document.readyState !== 'loading') {
    initializeProfilePage().catch(console.error);
} else {
    document.addEventListener('DOMContentLoaded', () => {
        initializeProfilePage().catch(console.error);
    });
}

export default initializeProfilePage;