import "../styles/about.css";
import { languageService } from '../utils/languageContext';

function updatePageTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (key) {
            element.textContent = languageService.translate(key);
        }
    });
}

export default function initializeAboutPage(): () => void {
    document.body.classList.add('about-page');
    const appContainer = document.getElementById('app');
    const originalBodyOverflow = document.body.style.overflowY;
    const originalBodyHeight = document.body.style.height;
    let originalAppOverflow = '';
    let originalAppHeight = '';
    
    if (appContainer) {
        originalAppOverflow = appContainer.style.overflowY;
        originalAppHeight = appContainer.style.height;
        appContainer.style.overflowY = 'auto';
        appContainer.style.height = 'auto';
    }
    document.body.style.overflowY = 'auto';
    document.body.style.height = 'auto';
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
    updatePageTranslations();

    window.addEventListener('languageChanged', updatePageTranslations);

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
    sections.forEach(section => {
        observer.observe(section);
    });
    const techCards = document.querySelectorAll<HTMLElement>('.tech-card');
    
    const handleTechCardMouseEnter = function(this: HTMLElement) {
        this.style.backgroundColor = 'rgba(40, 40, 40, 0.8)';
        const tech = this.getAttribute('data-tech');
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
    const featureCards = document.querySelectorAll<HTMLElement>('.feature-card');
    
    const handleFeatureCardMouseEnter = function(this: HTMLElement) {
        const icon = this.querySelector<HTMLElement>('.feature-icon');
        if (icon) {
            icon.classList.add('pulse');
            icon.style.backgroundColor = 'rgba(187, 112, 173, 0.6)';
        }
    };
    
    const handleFeatureCardMouseLeave = function(this: HTMLElement) {
        const icon = this.querySelector<HTMLElement>('.feature-icon');
        if (icon) {
            icon.classList.remove('pulse');
            icon.style.backgroundColor = 'rgba(187, 112, 173, 0.2)';
        }
    };
    
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', handleFeatureCardMouseEnter);
        card.addEventListener('mouseleave', handleFeatureCardMouseLeave);
    });
    const handleScroll = () => {
        const scrollY = window.scrollY;
        sections.forEach((section, index) => {
            if (section.classList.contains('visible')) {
                const speed = 0.05;
                const yPos = -(scrollY * speed * (index + 1) % 15);
                section.style.transform = `translateY(${yPos}px)`;
            }
        });
    };
    
    window.addEventListener('scroll', handleScroll);
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
        document.body.classList.remove('about-page');
        document.body.style.overflowY = originalBodyOverflow;
        document.body.style.height = originalBodyHeight;
        window.removeEventListener('languageChanged', updatePageTranslations);
        
        if (appContainer) {
            appContainer.style.overflowY = originalAppOverflow;
            appContainer.style.height = originalAppHeight;
        }
    };
}
if (document.readyState !== 'loading') {
    initializeAboutPage();
} else {
    document.addEventListener('DOMContentLoaded', initializeAboutPage);
}