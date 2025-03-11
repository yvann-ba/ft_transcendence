import "../styles/about.css";

/**
 * Initialize the about page animations and interactions
 * @returns Cleanup function to be called when the component unmounts
 */
export default function initializeAboutPage(): () => void {
    // Add class to body for specific styling
    document.body.classList.add('about-page');
    
    // Fix the scroll issue
    document.body.style.overflowY = 'auto';
    document.body.style.height = 'auto';
    
    const appContainer = document.getElementById('app');
    if (appContainer) {
        appContainer.style.overflowY = 'auto';
        appContainer.style.height = 'auto';
    }
    // Handle section animations with Intersection Observer
    const sections = document.querySelectorAll<HTMLElement>('.about-section');
    const header = document.querySelector<HTMLElement>('.about-header');
    
    if (header) {
        setTimeout(() => {
            const animText = header.querySelector('.h-anim');
            if (animText) {
                animText.classList.add('in');
            }
        }, 300);
    }
    
    // Set up intersection observer to add animations when elements come into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
    });
    
    // Observe all sections
    sections.forEach(section => {
        observer.observe(section);
    });
    
    // Add interactive effects to tech cards
    const techCards = document.querySelectorAll<HTMLElement>('.tech-card');
    
    const handleTechCardMouseEnter = function(this: HTMLElement) {
        this.style.backgroundColor = 'rgba(40, 40, 40, 0.8)';
        
        // Find the technology name from the data attribute
        const tech = this.getAttribute('data-tech');
        
        // Add a special effect based on the technology
        if (tech === 'frontend') {
            this.style.borderLeft = '3px solid #BB70AD';
        } else if (tech === 'backend') {
            this.style.borderRight = '3px solid #BB70AD';
        } else if (tech === 'database') {
            this.style.borderBottom = '3px solid #BB70AD';
        } else if (tech === 'devops') {
            this.style.borderTop = '3px solid #BB70AD';
        }
    };
    
    const handleTechCardMouseLeave = function(this: HTMLElement) {
        this.style.backgroundColor = 'rgba(30, 30, 30, 0.5)';
        this.style.borderLeft = '';
        this.style.borderRight = '';
        this.style.borderTop = '';
        this.style.borderBottom = '';
    };
    
    techCards.forEach(card => {
        card.addEventListener('mouseenter', handleTechCardMouseEnter);
        card.addEventListener('mouseleave', handleTechCardMouseLeave);
    });
    
    // Add interactive effects to feature cards
    const featureCards = document.querySelectorAll<HTMLElement>('.feature-card');
    
    const handleFeatureCardMouseEnter = function(this: HTMLElement) {
        const icon = this.querySelector('.feature-icon');
        if (icon) {
            icon.classList.add('pulse');
            icon.style.backgroundColor = 'rgba(187, 112, 173, 0.6)';
        }
    };
    
    const handleFeatureCardMouseLeave = function(this: HTMLElement) {
        const icon = this.querySelector('.feature-icon');
        if (icon) {
            icon.classList.remove('pulse');
            icon.style.backgroundColor = 'rgba(187, 112, 173, 0.2)';
        }
    };
    
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', handleFeatureCardMouseEnter);
        card.addEventListener('mouseleave', handleFeatureCardMouseLeave);
    });
    
    // Create parallax effect on scroll
    const handleScroll = () => {
        const scrollY = window.scrollY;
        
        // Apply subtle parallax effect to sections
        sections.forEach((section, index) => {
            if (section.classList.contains('visible')) {
                const speed = 0.05;
                const yPos = -(scrollY * speed * (index + 1) % 15);
                section.style.transform = `translateY(${yPos}px)`;
            }
        });
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Return cleanup function to remove event listeners
    return () => {
        sections.forEach(section => {
            observer.unobserve(section);
        });
        
        techCards.forEach(card => {
            card.removeEventListener('mouseenter', handleTechCardMouseEnter);
            card.removeEventListener('mouseleave', handleTechCardMouseLeave);
        });
        
        featureCards.forEach(card => {
            card.removeEventListener('mouseenter', handleFeatureCardMouseEnter);
            card.removeEventListener('mouseleave', handleFeatureCardMouseLeave);
        });
        
        window.removeEventListener('scroll', handleScroll);
        
        // Remove the body class when unmounting
        document.body.classList.remove('about-page');
    };
}

// Initialize the page when it's loaded directly
if (document.readyState !== 'loading') {
    initializeAboutPage();
} else {
    document.addEventListener('DOMContentLoaded', initializeAboutPage);
}