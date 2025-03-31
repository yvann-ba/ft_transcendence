import "../styles/profile-page.css";
import { getCurrentUser } from "../utils/utils";
import { navigate } from "../router";
import { languageService } from "../utils/languageContext";

    function updateButtonTranslations(): void {
        // Update Log out button
        const logoutButton = document.querySelector('.btn-add-friend') as HTMLElement;
        if (logoutButton) {
        logoutButton.textContent = languageService.translate('profile.logout', 'Log out');
        }
        
        // Update Edit profile link
        const editProfileLink = document.querySelector('.btn a') as HTMLElement;
        if (editProfileLink) {
        editProfileLink.textContent = languageService.translate('profile.edit', 'Edit profile');
        }
    }

    function updatePageTranslations(): void {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
          const key = element.getAttribute('data-i18n');
          if (key) {
            element.textContent = languageService.translate(key);
          }
        });
        
        // Add this line to update button texts
        updateButtonTranslations();
    }

    async function loadGameHistory(): Promise<void> {
        try {
        const response = await fetch('/api/game-history', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération de l\'historique');
        }
        
        const gameHistory = await response.json();
        
        const historyTable = document.querySelector('#tab-history .score-table');
        if (!historyTable) return;
        
        const tbody = historyTable.querySelector('tbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        
        const thead = historyTable.querySelector('thead');
        if (thead && thead.innerHTML.trim() === '') {
            thead.innerHTML = `
            <tr>
                <th>Date</th>
                <th>Opponent</th>
                <th>Result</th>
                <th>Winner</th>
            </tr>
            `;
            updatePageTranslations();
        }
        
        if (gameHistory.length === 0) {
            tbody.innerHTML = `
            <tr>
                <td colspan="4" class="no-data">No game history available</td>
            </tr>
            `;
        } else {
            gameHistory.forEach((game: any) => {
            const row = document.createElement('tr');
            row.className = game.result.toLowerCase();
            
            const date = new Date(game.played_at);
            const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            
            let winner = '';
            if (game.result === 'WIN') {
                winner = 'You';
                row.classList.add('win-row');
            } else if (game.result === 'LOSS') {
                winner = game.opponent_type === 'AI' ? 'AI' : game.opponent_name || 'Opponent';
                row.classList.add('loss-row');
            } else {
                winner = 'Draw';
            }
            
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${game.opponent_type === 'AI' ? `AI (${game.difficulty})` : game.opponent_name || 'Player'}</td>
                <td>${game.user_score} - ${game.opponent_score}</td>
                <td class="winner ${game.result.toLowerCase()}">${winner}</td>
            `;
            
            tbody.appendChild(row);
            });
        }

        initializeHistoryTable();
        } catch (error) {
        console.error('Erreur lors du chargement de l\'historique des parties:', error);
        }
    }

    function setupGlobalErrorHandler() {
        // This will catch all resource load errors including image errors
        window.addEventListener('error', function(event) {
            // Check if this is an image error
            if (event.target && (event.target as HTMLElement).tagName === 'IMG') {
                const img = event.target as HTMLImageElement;
                
                // Check if this is a Google image URL (which is causing the 429 errors)
                if (img.src && (
                    img.src.includes('googleusercontent.com') || 
                    img.src.includes('ggpht.com') || 
                    img.src.includes('gstatic.com')
                )) {
                    // This is a Google image that failed to load - likely a 429 error
                    console.log("Suppressed Google image load error:", img.src.split('?')[0]);
                    
                    // Prevent the error from showing in console
                    event.preventDefault();
                    event.stopPropagation();
                    return false;
                }

                // If any avatar image fails to load, replace with default
                if (img.classList.contains('avatar')) {
                    img.src = "/assets/images/avatar.jpg";
                    
                    // Prevent the error from showing in console
                    event.preventDefault();
                    event.stopPropagation();
                    return false;
                }
            }
        }, true); // Using the capture phase is important here
    }

    async function initializeProfilePage(): Promise<() => void> {
        // Add this line at the beginning
        setupGlobalErrorHandler();

        updatePageTranslations();
        window.addEventListener('languageChanged', updatePageTranslations);

        const user = await getCurrentUser();

        if (user) {
            updateProfileInfo(user);
            await loadGameHistory();
            initializeChart(user.player_wins, user.player_games);
            updateButtonTranslations();
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
                        
                        // Refresh translations when changing tabs
                        updatePageTranslations();
                    }, 150);
                }
            }
        }
        
        tabLinks.forEach(link => link.addEventListener('click', handleTabClick));
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

            window.removeEventListener('languageChanged', updatePageTranslations);
        };
    }
    let handleSegmentMouseEnter: (this: HTMLElement, event: Event) => void;
    let handleSegmentMouseLeave: (event: Event) => void;
    let handleSegmentMouseMove: (event: MouseEvent) => void;
    let handleHistoryRowHover: (this: HTMLElement, event: Event) => void;
    let handleHistoryRowLeave: (this: HTMLElement, event: Event) => void;
    let animateChart: () => void;
    let animateHistoryTable: () => void;

    function initializeHistoryTable(): void {
        const historyTab = document.getElementById('tab-history');
        if (!historyTab) return;
        const rows = historyTab.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            // Appliquer les styles en fonction du résultat
            if (row.classList.contains('win')) {
                row.classList.add('win-row');
            } else if (row.classList.contains('loss')) {
                row.classList.add('loss-row');
            } else if (row.classList.contains('draw')) {
                row.classList.add('draw-row');
            }
            
            // Animation row
            row.classList.add('animated-row');
            (row as HTMLElement).style.opacity = '0';
            (row as HTMLElement).style.transform = 'translateY(20px)';
        });
        
        // Le reste de votre code existant pour handleHistoryRowHover, etc.
        handleHistoryRowHover = function(this: HTMLElement, event: Event) {
            this.classList.add('row-hover');
            const winnerCell = this.querySelector('.winner');
            if (winnerCell) {
                winnerCell.classList.add('highlight');
            }
            const scoreCell = this.querySelector('td:nth-child(3)');
            if (scoreCell) {
                scoreCell.classList.add('highlight-score');
            }
        };
        
        handleHistoryRowLeave = function(this: HTMLElement, event: Event) {
            this.classList.remove('row-hover');
            const winnerCell = this.querySelector('.winner');
            if (winnerCell) {
                winnerCell.classList.remove('highlight');
            }
            const scoreCell = this.querySelector('td:nth-child(3)');
            if (scoreCell) {
                scoreCell.classList.remove('highlight-score');
            }
        };
        
        rows.forEach(row => {
            row.addEventListener('mouseenter', handleHistoryRowHover);
            row.addEventListener('mouseleave', handleHistoryRowLeave);
        });
        const headerCells = historyTab.querySelectorAll('thead th');
        headerCells.forEach((header, index) => {
            (header as HTMLElement).style.cursor = 'pointer';
            header.setAttribute('data-sort-direction', 'none');
            header.addEventListener('click', () => sortTable(index, header));
        });
        const headerRow = historyTab.querySelector('thead tr');
        if (headerRow) {
            headerRow.classList.add('header-row-animated');
        }
        animateHistoryTable = () => {
            rows.forEach(row => {
                (row as HTMLElement).style.opacity = '0';
                (row as HTMLElement).style.transform = 'translateY(20px)';
                (row as HTMLElement).style.transition = 'none';
            });
            void historyTab.offsetWidth;
            if (headerRow) {
                headerRow.classList.add('header-active');
            }
            rows.forEach((row, index) => {
                setTimeout(() => {
                    (row as HTMLElement).style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    (row as HTMLElement).style.opacity = '1';
                    (row as HTMLElement).style.transform = 'translateY(0)';
                }, 150 + (index * 100));
            });
        };
        if (historyTab.classList.contains('active')) {
            setTimeout(animateHistoryTable, 300);
        }
    }

    function sortTable(columnIndex: number, headerElement: Element): void {
        const historyTable = document.querySelector('#tab-history table');
        if (!historyTable)
            return;
        
        const tbody = historyTable.querySelector('tbody');
        if (!tbody)
            return;
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
                (row as HTMLElement).style.opacity = '0';
                (row as HTMLElement).style.transform = 'translateY(10px)';
                tbody.appendChild(row);
                setTimeout(() => {
                    (row as HTMLElement).style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    (row as HTMLElement).style.opacity = '1';
                    (row as HTMLElement).style.transform = 'translateY(0)';
                }, 50 * index);
            });
            setTimeout(() => {
                tbody.classList.remove('sorting');
            }, rows.length * 50 + 300);
        }, 300);
    }

    function initializeChart(nb_wins: number, nb_games: number): void {
        const wins = nb_wins;
        const losses = nb_games - nb_wins;
        const total = nb_games;
        
        // Handle the case where there are no games played
        if (total === 0) {
            // Set default values when no games have been played
            const winSegment = document.getElementById('win-segment');
            const lossSegment = document.getElementById('loss-segment');
            const winPercentageText = document.getElementById('win-percentage');
            const ratioText = document.querySelector('.ratio-text');
            const winNum = document.getElementById('win-num');
            const lossNum = document.getElementById('loss-num');
            
            if (winSegment && lossSegment && winPercentageText && ratioText && winNum && lossNum) {
                winSegment.style.strokeDasharray = `0 ${2 * Math.PI * 45}`;
                lossSegment.style.strokeDasharray = `0 ${2 * Math.PI * 45}`;
                ratioText.textContent = "0";
                winPercentageText.textContent = "0% Wins";
                winNum.textContent = "0 Wins";
                lossNum.textContent = "0 Losses";
            }
            return;
        }
        
        const winPercentage = (wins / total * 100).toFixed(1);
        const lossPercentage = (losses / total * 100).toFixed(1);
        const radius = 45;
        const circumference = 2 * Math.PI * radius;
        const winSegment = document.getElementById('win-segment');
        const lossSegment = document.getElementById('loss-segment');
        const winPercentageText = document.getElementById('win-percentage');
        const winLegend = document.getElementById('win-legend');
        const ratioText = document.querySelector('.ratio-text');
        const lossLegend = document.getElementById('loss-legend');
        const tooltip = document.getElementById('chart-tooltip');
        const winNum = document.getElementById('win-num');
        const lossNum = document.getElementById('loss-num');
        
        if (!winSegment || !lossSegment || !winPercentageText || !winLegend || !lossLegend || !tooltip || !ratioText || !winNum || !lossNum) {
            return;
        }
        const winRatio = losses > 0 ? (wins / losses).toFixed(2) : wins > 0 ? "∞" : "0";
        
        ratioText.textContent = String(winRatio);

        winNum.textContent = `${wins} ${languageService.translate("profile.stats.wins", "Wins")}`;
        lossNum.textContent = `${losses} ${languageService.translate("profile.stats.losses", "Losses")}`;

        const translatedPercentText = languageService.translate("profile.stats.win_percentage", "{percent}% Wins")
        .replace("{percent}", winPercentage);
        winPercentageText.textContent = translatedPercentText;


        animateChart = () => {
            // Calculate the correct stroke dash array values
            const winDashArray = `${circumference * wins / total} ${circumference}`;
            const lossDashArray = `${circumference * losses / total} ${circumference}`;
            
            // Reset transitions
            winSegment.style.transition = 'none';
            lossSegment.style.transition = 'none';
            
            // Set initial state
            winSegment.style.strokeDasharray = `0 ${circumference}`;
            lossSegment.style.strokeDasharray = `0 ${circumference}`;
            lossSegment.style.strokeDashoffset = `${-circumference * wins / total}`;
            
            // Force reflow
            void winSegment.offsetWidth;
            
            // Reset legend visibility
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
                setTimeout(() => {
                    winLegend.classList.add('visible');
                    setTimeout(() => lossLegend.classList.add('visible'), 200);
                }, 500);
            }, 600);
        };

        const chartContainer = document.querySelector('.chart-container');
        if (!chartContainer) return;
        handleSegmentMouseEnter = function(this: HTMLElement, e: Event) {
            tooltip.style.opacity = '1';
            
            if (this === winSegment) {
                tooltip.textContent = `Wins: ${wins} (${winPercentage}%)`;
                (winSegment as HTMLElement).style.stroke = '#5dca60';
            } else {
                tooltip.textContent = `Losses: ${losses} (${lossPercentage}%)`;
                (lossSegment as HTMLElement).style.stroke = '#ff5c50';
            }
        };
        
        handleSegmentMouseLeave = function(e: Event) {
            tooltip.style.opacity = '0';
            (winSegment as HTMLElement).style.stroke = '#4CAF50';
            (lossSegment as HTMLElement).style.stroke = '#F44336';
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
        const logoutButton = document.querySelector('.profile-info .btn-add-friend');

        if (usernameElement) {
            usernameElement.textContent = user.username;
        }
        
        if (nameElement) {
            const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
            nameElement.textContent = fullName ? `${fullName}` : '';
        }
        
        if (avatarElement) {
            // Always use default avatar instead of handling Google images
            avatarElement.src = "/assets/images/avatar.jpg";
            avatarElement.alt = `${user.username}'s avatar`;
            
            // Clear any cached avatar data
            localStorage.removeItem('cachedAvatarImage');
            localStorage.removeItem('cachedAvatarTimestamp');
            localStorage.removeItem('lastSuccessfulAvatarUrl');
        } else {
            console.log("Avatar element not found in the DOM");
        }
        
        if (logoutButton) {
            logoutButton.textContent = languageService.translate('profile.logout', 'Log out');
            logoutButton.classList.add('logout-button');
            
            // Add logout functionality
            logoutButton.addEventListener('click', handleLogout);
        }
    }

    // Function to handle logout
    async function handleLogout(): Promise<void> {
        try {
            // 1. Call server-side logout endpoint first
            const response = await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include',
            });

            if (!response.ok) {
                console.warn('Server logout failed, continuing with client-side logout');
            }
            
            localStorage.removeItem('token');
            
            document.cookie = 'sessionid=; Max-Age=0; path=/;';
            document.cookie = 'auth_token=; Max-Age=0; path=/;';
            
            document.cookie = 'sessionid=; Max-Age=0; path=/; domain=' + window.location.hostname;
            document.cookie = 'auth_token=; Max-Age=0; path=/; domain=' + window.location.hostname;
            
            const profileLabel = document.querySelector(".profile-label") as HTMLElement;
            if (profileLabel) {
                profileLabel.textContent = "Login";
                profileLabel.setAttribute("data-hover", "Login");
            }
            
            // 5. Redirect to home page with a small delay to ensure cleanup completes
            setTimeout(() => {
                navigate('/');
            }, 100);
            
        } catch (error) {
            console.error('Error during logout:', error);
            // Even if there's an error, attempt to navigate away
            navigate('/');
        }
    }

    export default initializeProfilePage;