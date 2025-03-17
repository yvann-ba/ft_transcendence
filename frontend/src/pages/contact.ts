import "../styles/contact.css";

export default function initializeContactPage(): () => void {
    document.body.classList.add('contact-page');
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
    const header = document.querySelector<HTMLElement>('.contact-header');
    
    if (header) {
        setTimeout(() => {
            const animText = header.querySelector('.h-anim');
            if (animText) {
                animText.classList.add('in');
            }
        }, 300);
    }
    const teamMembers = document.querySelectorAll<HTMLElement>('.team-member');
    const timelineItems = document.querySelectorAll<HTMLElement>('.timeline-item');
    const sections = document.querySelectorAll<HTMLElement>('.collaboration-section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                if (entry.target.classList.contains('timeline-item')) {
                    const index = Array.from(timelineItems).indexOf(entry.target as HTMLElement);
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 200);
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px'
    });
    teamMembers.forEach(member => observer.observe(member));
    timelineItems.forEach(item => observer.observe(item));
    sections.forEach(section => observer.observe(section));
    const photoContainers = document.querySelectorAll<HTMLElement>('.member-photo-container');
    
    const handlePhotoMouseEnter = function(this: HTMLElement) {
        const glow = this.querySelector<HTMLElement>('.member-glow');
        if (glow) {
            glow.style.opacity = '1';
        }
        
        const photo = this.querySelector<HTMLElement>('.member-photo');
        if (photo) {
            photo.style.transform = 'translateY(-10px)';
            photo.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.5)';
        }
    };
    
    const handlePhotoMouseLeave = function(this: HTMLElement) {
        const glow = this.querySelector<HTMLElement>('.member-glow');
        if (glow) {
            glow.style.opacity = '0';
        }
        
        const photo = this.querySelector<HTMLElement>('.member-photo');
        if (photo) {
            photo.style.transform = 'translateY(0)';
            photo.style.boxShadow = 'none';
        }
    };
    
    photoContainers.forEach(container => {
        container.addEventListener('mouseenter', handlePhotoMouseEnter);
        container.addEventListener('mouseleave', handlePhotoMouseLeave);
    });
    const keywords = document.querySelectorAll<HTMLElement>('.keyword');
    
    const handleKeywordMouseEnter = function(this: HTMLElement) {
        this.style.backgroundColor = 'rgba(187, 112, 173, 0.4)';
        this.style.transform = 'translateY(-2px)';
    };
    
    const handleKeywordMouseLeave = function(this: HTMLElement) {
        this.style.backgroundColor = 'rgba(187, 112, 173, 0.2)';
        this.style.transform = 'translateY(0)';
    };
    
    keywords.forEach(keyword => {
        keyword.addEventListener('mouseenter', handleKeywordMouseEnter);
        keyword.addEventListener('mouseleave', handleKeywordMouseLeave);
    });
    const timelineIcons = document.querySelectorAll<HTMLElement>('.timeline-icon');
    
    const handleTimelineIconMouseEnter = function(this: HTMLElement) {
        this.style.backgroundColor = 'rgba(187, 112, 173, 0.8)';
        this.style.transform = 'translateX(-50%) scale(1.1)';
    };
    
    const handleTimelineIconMouseLeave = function(this: HTMLElement) {
        this.style.backgroundColor = 'rgba(187, 112, 173, 0.2)';
        this.style.transform = 'translateX(-50%) scale(1)';
    };
    
    timelineIcons.forEach(icon => {
        icon.addEventListener('mouseenter', handleTimelineIconMouseEnter);
        icon.addEventListener('mouseleave', handleTimelineIconMouseLeave);
    });
    const handleScroll = () => {
        const scrollY = window.scrollY;
        photoContainers.forEach((container, index) => {
            const speed = 0.03;
            const yPos = -(scrollY * speed * (index + 1) % 10);
            
            const photo = container.querySelector<HTMLElement>('.member-photo');
            if (photo) {
                photo.style.transform = `translateY(${yPos}px)`;
            }
        });
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
        teamMembers.forEach(member => observer.unobserve(member));
        timelineItems.forEach(item => observer.unobserve(item));
        sections.forEach(section => observer.unobserve(section));
        
        photoContainers.forEach(container => {
            container.removeEventListener('mouseenter', handlePhotoMouseEnter);
            container.removeEventListener('mouseleave', handlePhotoMouseLeave);
        });
        
        keywords.forEach(keyword => {
            keyword.removeEventListener('mouseenter', handleKeywordMouseEnter);
            keyword.removeEventListener('mouseleave', handleKeywordMouseLeave);
        });
        
        timelineIcons.forEach(icon => {
            icon.removeEventListener('mouseenter', handleTimelineIconMouseEnter);
            icon.removeEventListener('mouseleave', handleTimelineIconMouseLeave);
        });
        
        window.removeEventListener('scroll', handleScroll);
        document.body.classList.remove('contact-page');
        document.body.style.overflowY = originalBodyOverflow;
        document.body.style.height = originalBodyHeight;
        
        if (appContainer) {
            appContainer.style.overflowY = originalAppOverflow;
            appContainer.style.height = originalAppHeight;
        }
    };
}
if (document.readyState !== 'loading') {
    initializeContactPage();
} else {
    document.addEventListener('DOMContentLoaded', initializeContactPage);
}