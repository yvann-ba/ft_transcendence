import "../styles/profile-page.css";
import { getCurrentUser } from "../utils/utils";

async function initializeProfilePage(): Promise<() => void> {

    const user = await getCurrentUser();

    if (user) {
        updateProfileInfo(user);
    }

	const tabLinks = document.querySelectorAll<HTMLElement>('.tab-link');
	const tabContents = document.querySelectorAll<HTMLElement>('.tab-content');
	
	function handleTabClick(this: HTMLElement): void {
		tabLinks.forEach(tab => tab.classList.remove('active'));
		tabContents.forEach(content => {
			content.classList.remove('active');
			content.classList.add('fade-out');
		});
		this.classList.add('active');
		const tabId = this.getAttribute('data-tab');
		if (tabId) {
			const content = document.getElementById(tabId);
			if (content) {
				setTimeout(() => {
					content.classList.remove('fade-out');
					content.classList.add('active', 'fade-in');
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
    initializeChart();
    initializeHistoryTable();
	
	return () => {
		tabLinks.forEach(link => link.removeEventListener('click', handleTabClick));
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
        const historyRows = document.querySelectorAll('#tab-history tbody tr');
        historyRows.forEach(row => {
            row.removeEventListener('mouseenter', handleHistoryRowHover);
            row.removeEventListener('mouseleave', handleHistoryRowLeave);
        });
	};
}
let handleSegmentMouseEnter: (event: MouseEvent) => void;
let handleSegmentMouseLeave: (event: MouseEvent) => void;
let handleSegmentMouseMove: (event: MouseEvent) => void;
let handleHistoryRowHover: (event: MouseEvent) => void;
let handleHistoryRowLeave: (event: MouseEvent) => void;
let animateChart: () => void;
let animateHistoryTable: () => void;

function initializeHistoryTable(): void {
    const historyTab = document.getElementById('tab-history');
    if (!historyTab) return;
    const rows = historyTab.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const resultCell = row.querySelector('td:last-child');
        if (!resultCell) return;
        
        const cellText = resultCell.textContent?.trim().toLowerCase() || '';
        const isWin = cellText.includes('win') || cellText === 'w' || cellText === 'victory' || cellText === '1';
        const resultBadge = document.createElement('span');
        resultBadge.className = `result-badge ${isWin ? 'win' : 'loss'}`;
        resultBadge.textContent = isWin ? 'W' : 'L';
        resultCell.textContent = '';
        resultCell.appendChild(resultBadge);
        row.classList.add(isWin ? 'win-row' : 'loss-row');
        row.setAttribute('data-result', isWin ? 'win' : 'loss');
        row.classList.add('animated-row');
        row.style.opacity = '0';
        row.style.transform = 'translateY(20px)';
    });
    handleHistoryRowHover = function(this: HTMLElement) {
        this.classList.add('row-hover');
        const badge = this.querySelector('.result-badge');
        if (badge) {
            badge.classList.add('pulse');
        }
        const opponentCell = this.querySelector('td:nth-child(2)');
        if (opponentCell) {
            opponentCell.classList.add('highlight-opponent');
        }
    };
    
    handleHistoryRowLeave = function(this: HTMLElement) {
        this.classList.remove('row-hover');
        const badge = this.querySelector('.result-badge');
        if (badge) {
            badge.classList.remove('pulse');
        }
        const opponentCell = this.querySelector('td:nth-child(2)');
        if (opponentCell) {
            opponentCell.classList.remove('highlight-opponent');
        }
    };
    rows.forEach(row => {
        row.addEventListener('mouseenter', handleHistoryRowHover);
        row.addEventListener('mouseleave', handleHistoryRowLeave);
    });
    const headerCells = historyTab.querySelectorAll('thead th');
    headerCells.forEach((header, index) => {
        header.style.cursor = 'pointer';
        header.setAttribute('data-sort-direction', 'none');
        header.addEventListener('click', () => sortTable(index, header));
    });
    const headerRow = historyTab.querySelector('thead tr');
    if (headerRow) {
        headerRow.classList.add('header-row-animated');
    }
    animateHistoryTable = () => {
        rows.forEach(row => {
            row.style.opacity = '0';
            row.style.transform = 'translateY(20px)';
            row.style.transition = 'none';
        });
        void historyTab.offsetWidth;
        if (headerRow) {
            headerRow.classList.add('header-active');
        }
        rows.forEach((row, index) => {
            setTimeout(() => {
                row.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, 150 + (index * 100));
        });
    };
    if (historyTab.classList.contains('active')) {
        setTimeout(animateHistoryTable, 300);
    }
}

function sortTable(columnIndex: number, headerElement: Element): void {
    const historyTable = document.querySelector('#tab-history table');
    if (!historyTable) return;
    
    const tbody = historyTable.querySelector('tbody');
    if (!tbody) return;
    const currentDirection = headerElement.getAttribute('data-sort-direction') || 'none';
    const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
    const allHeaders = historyTable.querySelectorAll('thead th');
    allHeaders.forEach(header => {
        header.setAttribute('data-sort-direction', 'none');
        header.classList.remove('sorted-asc', 'sorted-desc');
    });
    headerElement.setAttribute('data-sort-direction', newDirection);
    headerElement.classList.add(newDirection === 'asc' ? 'sorted-asc' : 'sorted-desc');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    rows.sort((rowA, rowB) => {
        const cellA = rowA.cells[columnIndex].textContent?.trim() || '';
        const cellB = rowB.cells[columnIndex].textContent?.trim() || '';
        if (columnIndex === 0) {
            const dateA = new Date(cellA).getTime();
            const dateB = new Date(cellB).getTime();
            return newDirection === 'asc' ? dateA - dateB : dateB - dateA;
        }
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
        const comparison = cellA.localeCompare(cellB);
        return newDirection === 'asc' ? comparison : -comparison;
    });
    tbody.classList.add('sorting');
    setTimeout(() => {
        rows.forEach((row, index) => {
            row.style.opacity = '0';
            row.style.transform = 'translateY(10px)';
            tbody.appendChild(row);
            setTimeout(() => {
                row.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, 50 * index);
        });
        setTimeout(() => {
            tbody.classList.remove('sorting');
        }, rows.length * 50 + 300);
    }, 300);
}

function initializeChart(): void {
    const wins = 85;
    const losses = 65;
    const total = wins + losses;
    const winPercentage = (wins / total * 100).toFixed(1);
    const lossPercentage = (losses / total * 100).toFixed(1);
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const winSegment = document.getElementById('win-segment');
    const lossSegment = document.getElementById('loss-segment');
    const winPercentageText = document.getElementById('win-percentage');
    const winLegend = document.getElementById('win-legend');
    const lossLegend = document.getElementById('loss-legend');
    const tooltip = document.getElementById('chart-tooltip');
    
    if (!winSegment || !lossSegment || !winPercentageText || !winLegend || !lossLegend || !tooltip) {
        return;
    }
    winPercentageText.textContent = `${winPercentage}% Wins`;
    animateChart = () => {
        const winDashArray = `${circumference * wins / total} ${circumference}`;
        const lossDashArray = `${circumference * losses / total} ${circumference}`;
        winSegment.style.transition = 'none';
        lossSegment.style.transition = 'none';
        winSegment.style.strokeDasharray = `0 ${circumference}`;
        lossSegment.style.strokeDasharray = `0 ${circumference}`;
        lossSegment.style.strokeDashoffset = `${-circumference * wins / total}`;
        void winSegment.offsetWidth;
        winLegend.classList.remove('visible');
        lossLegend.classList.remove('visible');
        setTimeout(() => {
            winSegment.style.transition = 'stroke-dasharray 1.5s ease-in-out';
            winSegment.style.strokeDasharray = winDashArray;
        }, 300);
        setTimeout(() => {
            lossSegment.style.transition = 'stroke-dasharray 1.5s ease-in-out';
            lossSegment.style.strokeDasharray = lossDashArray;
            setTimeout(() => {
                winLegend.classList.add('visible');
                setTimeout(() => lossLegend.classList.add('visible'), 200);
            }, 500);
        }, 600);
    };
    const chartContainer = document.querySelector('.chart-container');
    if (!chartContainer) return;
    handleSegmentMouseEnter = function(this: HTMLElement, e: MouseEvent) {
        tooltip.style.opacity = '1';
        
        if (this === winSegment) {
            tooltip.textContent = `Wins: ${wins} (${winPercentage}%)`;
            winSegment.style.stroke = '#5dca60';
        } else {
            tooltip.textContent = `Losses: ${losses} (${lossPercentage}%)`;
            lossSegment.style.stroke = '#ff5c50';
        }
    };
    
    handleSegmentMouseLeave = function(e: MouseEvent) {
        tooltip.style.opacity = '0';
        winSegment.style.stroke = '#4CAF50';
        lossSegment.style.stroke = '#F44336';
    };
    
    handleSegmentMouseMove = function(e: MouseEvent) {
        const rect = chartContainer.getBoundingClientRect();
        tooltip.style.left = `${e.clientX - rect.left + 10}px`;
        tooltip.style.top = `${e.clientY - rect.top - 30}px`;
    };
    winSegment.addEventListener('mouseenter', handleSegmentMouseEnter);
    winSegment.addEventListener('mouseleave', handleSegmentMouseLeave);
    winSegment.addEventListener('mousemove', handleSegmentMouseMove);
    
    lossSegment.addEventListener('mouseenter', handleSegmentMouseEnter);
    lossSegment.addEventListener('mouseleave', handleSegmentMouseLeave);
    lossSegment.addEventListener('mousemove', handleSegmentMouseMove);
    const statsTab = document.getElementById('tab-stats');
    if (statsTab && statsTab.classList.contains('active')) {
        animateChart();
    }
}

if (document.readyState !== 'loading') {
    initializeProfilePage();
} else {
    document.addEventListener('DOMContentLoaded', initializeProfilePage);
}

function updateProfileInfo(user: any): void {
    const usernameElement = document.querySelector('.profile-info .username');
    const nameElement = document.querySelector('.profile-info .name');
    const avatarElement = document.querySelector('.profile-info .avatar') as HTMLImageElement;
    const loginButton = document.querySelector('.profile-info .btn-add-friend');

    if (usernameElement) {
        usernameElement.textContent = user.username;
    }
    
    if (nameElement) {
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
        nameElement.textContent = fullName ? `Name: ${fullName}` : '';
    }
    
    if (avatarElement) {
        if (user.avatar) {
            avatarElement.src = user.avatar;
            avatarElement.alt = `${user.username}'s avatar`;
        } else {
            avatarElement.alt = `${user.username}'s avatar`;
        }
    }
    
    if (loginButton) {
        loginButton.textContent = 'Edit Profile';
        loginButton.setAttribute('data-i18n', 'profile.edit');
        
        // loginButton.addEventListener('click', openProfileEditor);
    }
}


export default initializeProfilePage;