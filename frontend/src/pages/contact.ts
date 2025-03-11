import "../styles/contact.css";

/**
 * Initialize the contact page animations and interactions
 * @returns Cleanup function to be called when the component unmounts
 */
export default function initializeContactPage(): () => void {
    // Add class to body for specific styling
    document.body.classList.add('contact-page');
    
    // Fix the scroll issue
    document.body.style.overflowY = 'auto';
    document.body.style.height = 'auto';
    
    const appContainer = document.getElementById('app');
    if (appContainer) {
        appContainer.style.overflowY = 'auto';
        appContainer.style.height = 'auto';
    }
    // Animation for header elements
    const header = document.querySelector<HTMLElement>('.contact-header');
    
    if (header) {
        setTimeout(() => {
            const animText = header.querySelector('.h-anim');
            if (animText) {
                animText.classList.add('in');
            }
        }, 300);
    }
    
    // Handle animations for team members using Intersection Observer
    const teamMembers = document.querySelectorAll<HTMLElement>('.team-member');
    const timelineItems = document.querySelectorAll<HTMLElement>('.timeline-item');
    const sections = document.querySelectorAll<HTMLElement>('.collaboration-section, .contact-form-section');
    
    // Create intersection observer for animation on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // If it's a timeline item, add a slight animation delay
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
    
    // Observe all elements that should animate on scroll
    teamMembers.forEach(member => observer.observe(member));
    timelineItems.forEach(item => observer.observe(item));
    sections.forEach(section => observer.observe(section));
    
    // Photo hover effects
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
    
    // Keywords hover effect
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
    
    // Timeline icons hover effect
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
    
    // Contact form handling removed as requested
    
    // Create parallax effect on scroll
    const handleScroll = () => {
        const scrollY = window.scrollY;
        
        // Parallax effect for photos
        photoContainers.forEach((container, index) => {
            const speed = 0.03;
            const yPos = -(scrollY * speed * (index + 1) % 10);
            
            const photo = container.querySelector('.member-photo');
            if (photo) {
                (photo as HTMLElement).style.transform = `translateY(${yPos}px)`;
            }
        });
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Clean up function
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
        
        // Contact form cleanup removed
        
        window.removeEventListener('scroll', handleScroll);
        
        // Remove the body class when unmounting
        document.body.classList.remove('contact-page');
    };
}

// Initialize the page when it's loaded directly
if (document.readyState !== 'loading') {
    initializeContactPage();
} else {
    document.addEventListener('DOMContentLoaded', initializeContactPage);
}