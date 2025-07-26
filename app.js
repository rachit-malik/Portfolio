// Application state
let currentSectionIndex = 0;
let isAutoPlay = false;
let autoPlayInterval;
let sidebarTimeout;

// Section mapping
const sections = [
    { id: 'home', name: 'Home' },
    { id: 'about', name: 'About' },
    { id: 'languages', name: 'Languages' },
    { id: 'experience', name: 'Experience' },
    { id: 'projects', name: 'Projects' },
    { id: 'certifications', name: 'Certifications' },
    { id: 'skills', name: 'Skills' },
    { id: 'hobbies', name: 'Hobbies' },
    { id: 'contact', name: 'Contact' }
];

// DOM elements
let sidebar, mobileMenuToggle, mobileOverlay, mainContent;
let navLinks, contentSections, nowPlayingText, progressPlayed, playBtn, prevBtn, nextBtn;

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Spotify-style portfolio...');
    
    // Get DOM elements with error checking
    sidebar = document.getElementById('sidebar');
    mobileMenuToggle = document.getElementById('mobileMenuToggle');
    mobileOverlay = document.getElementById('mobileOverlay');
    mainContent = document.getElementById('mainContent');
    navLinks = document.querySelectorAll('.nav-link');
    contentSections = document.querySelectorAll('.content-section');
    nowPlayingText = document.getElementById('nowPlayingText');
    progressPlayed = document.getElementById('progressPlayed');
    playBtn = document.getElementById('playBtn');
    prevBtn = document.getElementById('prevBtn');
    nextBtn = document.getElementById('nextBtn');
    
    // Verify critical elements exist
    if (!sidebar || !mainContent || navLinks.length === 0) {
        console.error('Critical DOM elements missing!');
        return;
    }
    
    // Initialize all functionality
    initializeAutoHidingSidebar();
    initializeMobileMenu();
    initializeNavigation();
    initializePlayerControls();
    initializeKeyboardNavigation();
    initializeTouchGestures();
    
    // Set initial state
    setTimeout(() => {
        updateActiveStates();
        updateNowPlaying();
        updateProgressBar();
        
        // Trigger language animation on load if languages section is active
        if (sections[currentSectionIndex].id === 'languages') {
            animateLanguageProgressBars();
        }
    }, 100);
    
    console.log('Portfolio initialized successfully');
});

// Auto-hiding sidebar functionality
function initializeAutoHidingSidebar() {
    if (!sidebar || !mainContent) return;
    
    // Handle mouse enter
    sidebar.addEventListener('mouseenter', function() {
        clearTimeout(sidebarTimeout);
        if (window.innerWidth > 768) { // Only on desktop
            sidebar.style.width = '250px';
            mainContent.style.marginLeft = '250px';
            console.log('Sidebar expanded');
        }
    });
    
    // Handle mouse leave with delay
    sidebar.addEventListener('mouseleave', function() {
        if (window.innerWidth > 768) { // Only on desktop
            sidebarTimeout = setTimeout(() => {
                sidebar.style.width = '40px';
                mainContent.style.marginLeft = '40px';
                console.log('Sidebar collapsed');
            }, 200); // 0.5 second delay
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 768) {
            // Mobile: reset to mobile state
            sidebar.style.width = '';
            mainContent.style.marginLeft = '';
        } else {
            // Desktop: ensure proper collapsed state
            if (!sidebar.matches(':hover') && !sidebar.classList.contains('mobile-open')) {
                sidebar.style.width = '40px';
                mainContent.style.marginLeft = '40px';
            }
        }
    });
    
    console.log('Auto-hiding sidebar initialized');
}

// Mobile menu functionality
function initializeMobileMenu() {
    if (!mobileMenuToggle || !mobileOverlay || !sidebar) return;
    
    // Toggle mobile menu
    mobileMenuToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const isOpen = sidebar.classList.contains('mobile-open');
        console.log('Mobile menu toggle clicked, currently open:', isOpen);
        
        if (isOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });
    
    // Close on overlay click
    mobileOverlay.addEventListener('click', function(e) {
        e.preventDefault();
        closeMobileMenu();
    });
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebar.classList.contains('mobile-open')) {
            closeMobileMenu();
        }
    });
    
    console.log('Mobile menu initialized');
}

function openMobileMenu() {
    console.log('Opening mobile menu');
    sidebar.classList.add('mobile-open');
    mobileOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (mobileMenuToggle) {
        mobileMenuToggle.querySelector('i').className = 'fas fa-times';
    }
}

function closeMobileMenu() {
    console.log('Closing mobile menu');
    sidebar.classList.remove('mobile-open');
    mobileOverlay.classList.remove('active');
    document.body.style.overflow = '';
    if (mobileMenuToggle) {
        mobileMenuToggle.querySelector('i').className = 'fas fa-bars';
    }
}

// Navigation functionality
function initializeNavigation() {
    console.log('Initializing navigation with', navLinks.length, 'links');
    
    navLinks.forEach((link, index) => {
        const sectionId = link.getAttribute('data-section');
        console.log(`Setting up navigation for link ${index}: ${sectionId}`);
        
        // Remove any existing event listeners
        link.replaceWith(link.cloneNode(true));
    });
    
    // Re-query nav links after cloning
    navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach((link, index) => {
        const sectionId = link.getAttribute('data-section');
        
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log(`Navigation clicked: ${sectionId}`);
            
            // Find the index of the section in our sections array
            const sectionIndex = sections.findIndex(section => section.id === sectionId);
            
            if (sectionIndex !== -1) {
                console.log(`Navigating to section index: ${sectionIndex}`);
                navigateToSection(sectionIndex);
                
                // Close mobile menu if open
                if (sidebar && sidebar.classList.contains('mobile-open')) {
                    closeMobileMenu();
                }
            } else {
                console.error(`Section not found: ${sectionId}`);
            }
        });
        
        // Add hover effects for desktop
        link.addEventListener('mouseenter', function() {
            if (window.innerWidth > 768) {
                this.style.transform = 'translateX(8px)';
            }
        });
        
        link.addEventListener('mouseleave', function() {
            if (window.innerWidth > 768) {
                this.style.transform = '';
            }
        });
    });
    
    console.log('Navigation initialized with', navLinks.length, 'working links');
}

// Navigate to specific section
function navigateToSection(index) {
    // Ensure index is within bounds
    if (index < 0) index = sections.length - 1;
    if (index >= sections.length) index = 0;
    
    const previousIndex = currentSectionIndex;
    currentSectionIndex = index;
    
    console.log(`Navigating from section ${previousIndex} to section ${index} (${sections[index].name})`);
    
    updateActiveStates();
    showContentSection(sections[index].id);
    updateNowPlaying();
    updateProgressBar();
    
    // Special handling for languages section
    if (sections[index].id === 'languages') {
        setTimeout(() => {
            animateLanguageProgressBars();
        }, 500);
    }
    
    // Add page transition effect
    if (mainContent) {
        mainContent.style.opacity = '0.8';
        setTimeout(() => {
            mainContent.style.opacity = '1';
        }, 200);
    }
}

// Update active states for navigation links
function updateActiveStates() {
    console.log('Updating active states for section:', sections[currentSectionIndex].name);
    
    navLinks.forEach((link) => {
        const sectionId = link.getAttribute('data-section');
        const currentSectionId = sections[currentSectionIndex].id;
        
        if (sectionId === currentSectionId) {
            link.classList.add('active');
            console.log(`Activated link: ${sectionId}`);
        } else {
            link.classList.remove('active');
        }
    });
}

// Show content section with smooth transition
function showContentSection(sectionId) {
    console.log(`Showing section: ${sectionId}`);
    
    if (!contentSections || contentSections.length === 0) {
        console.error('No content sections found!');
        return;
    }
    
    // Hide all sections
    contentSections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section with slight delay for smoother transition
    setTimeout(() => {
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            console.log(`Successfully activated section: ${sectionId}`);
            
            // Scroll to top of main content
            if (mainContent) {
                mainContent.scrollTop = 0;
            }
        } else {
            console.error(`Target section not found: ${sectionId}`);
        }
    }, 100);
}

// Animate language progress bars with stagger effect
function animateLanguageProgressBars() {
    const progressFills = document.querySelectorAll('#languages .progress-fill');
    console.log('Animating', progressFills.length, 'progress bars');
    
    progressFills.forEach((fill, index) => {
        const progress = fill.getAttribute('data-progress');
        // Reset width first
        fill.style.width = '0%';
        
        // Animate to target width with staggered delay
        setTimeout(() => {
            fill.style.width = progress + '%';
            console.log(`Animated progress bar ${index} to ${progress}%`);
            
            // Add a subtle glow effect
            fill.style.boxShadow = '0 0 10px rgba(29, 185, 84, 0.5)';
            setTimeout(() => {
                fill.style.boxShadow = '';
            }, 1000);
        }, index * 300 + 200);
    });
}

// Player controls functionality
function initializePlayerControls() {
    console.log('Initializing player controls');
    
    // Play/Pause button
    if (playBtn) {
        playBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Play button clicked');
            toggleAutoPlay();
        });
    } else {
        console.error('Play button not found!');
    }
    
    // Previous button
    if (prevBtn) {
        prevBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Previous button clicked');
            navigateToSection(currentSectionIndex - 1);
            addButtonFeedback(prevBtn);
        });
    } else {
        console.error('Previous button not found!');
    }
    
    // Next button
    if (nextBtn) {
        nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Next button clicked');
            navigateToSection(currentSectionIndex + 1);
            addButtonFeedback(nextBtn);
        });
    } else {
        console.error('Next button not found!');
    }
    
    console.log('Player controls initialized');
}

// Add visual feedback to button clicks
function addButtonFeedback(button) {
    if (!button) return;
    
    button.style.transform = 'scale(0.9)';
    button.style.transition = 'transform 0.1s ease';
    setTimeout(() => {
        button.style.transform = '';
        button.style.transition = 'all 0.3s ease-in-out';
    }, 150);
}

// Toggle auto-play functionality
function toggleAutoPlay() {
    isAutoPlay = !isAutoPlay;
    console.log('Auto-play toggled to:', isAutoPlay);
    
    if (!playBtn) {
        console.error('Play button not available for toggle');
        return;
    }
    
    const playIcon = playBtn.querySelector('i');
    if (!playIcon) {
        console.error('Play icon not found');
        return;
    }
    
    if (isAutoPlay) {
        playIcon.className = 'fas fa-pause';
        playBtn.setAttribute('title', 'Pause Auto-play');
        startAutoPlay();
        
        // Add visual indicator
        playBtn.style.boxShadow = '0 0 20px rgba(29, 185, 84, 0.8)';
        console.log('Auto-play started');
    } else {
        playIcon.className = 'fas fa-play';
        playBtn.setAttribute('title', 'Auto-play Sections');
        stopAutoPlay();
        
        // Remove visual indicator
        playBtn.style.boxShadow = '0 4px 15px rgba(29, 185, 84, 0.3)';
        console.log('Auto-play stopped');
    }
    
    addButtonFeedback(playBtn);
}

// Start auto-play with visual feedback
function startAutoPlay() {
    stopAutoPlay(); // Clear any existing interval
    console.log('Starting auto-play interval');
    
    autoPlayInterval = setInterval(() => {
        console.log('Auto-play advancing to next section');
        navigateToSection(currentSectionIndex + 1);
        
        // Add pulse effect to play button
        if (playBtn) {
            const originalTransform = playBtn.style.transform;
            playBtn.style.transform = 'scale(1.1)';
            setTimeout(() => {
                playBtn.style.transform = originalTransform;
            }, 300);
        }
        
    }, 4000); // 4 seconds per section
}

// Stop auto-play
function stopAutoPlay() {
    if (autoPlayInterval) {
        console.log('Stopping auto-play interval');
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
    }
}

// Update now playing text with smooth transition
function updateNowPlaying() {
    if (!nowPlayingText) {
        console.error('Now playing text element not found');
        return;
    }
    
    const currentSection = sections[currentSectionIndex];
    
    // Fade out, change text, fade in
    nowPlayingText.style.opacity = '0.5';
    nowPlayingText.style.transition = 'opacity 0.2s ease';
    
    setTimeout(() => {
        nowPlayingText.textContent = `Now Viewing: ${currentSection.name}`;
        nowPlayingText.style.opacity = '1';
    }, 200);
    
    console.log(`Updated now playing: ${currentSection.name}`);
}

// Update progress bar with smooth animation
function updateProgressBar() {
    if (!progressPlayed) {
        console.error('Progress bar element not found');
        return;
    }
    
    const progress = ((currentSectionIndex + 1) / sections.length) * 100;
    progressPlayed.style.width = progress + '%';
    
    // Add glow effect during transition
    progressPlayed.style.boxShadow = '0 0 10px rgba(29, 185, 84, 0.8)';
    setTimeout(() => {
        progressPlayed.style.boxShadow = '';
    }, 500);
    
    console.log(`Updated progress bar: ${progress.toFixed(1)}%`);
}

// Enhanced keyboard navigation
function initializeKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        // Don't interfere if user is typing in an input or if mobile menu is open
        if (e.target.tagName === 'INPUT' || 
            e.target.tagName === 'TEXTAREA' || 
            (sidebar && sidebar.classList.contains('mobile-open'))) return;
        
        let handled = true;
        
        switch(e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                console.log('Keyboard: Previous section');
                navigateToSection(currentSectionIndex - 1);
                break;
            case 'ArrowRight':
            case 'ArrowDown':
                console.log('Keyboard: Next section');
                navigateToSection(currentSectionIndex + 1);
                break;
            case ' ': // Spacebar
                console.log('Keyboard: Toggle auto-play');
                toggleAutoPlay();
                break;
            case 'Home':
                console.log('Keyboard: Go to home');
                navigateToSection(0);
                break;
            case 'End':
                console.log('Keyboard: Go to last section');
                navigateToSection(sections.length - 1);
                break;
            case 'Escape':
                if (isAutoPlay) {
                    console.log('Keyboard: Stop auto-play');
                    toggleAutoPlay();
                } else if (sidebar && sidebar.classList.contains('mobile-open')) {
                    closeMobileMenu();
                }
                break;
            // Number keys for direct navigation
            case '1': case '2': case '3': case '4': case '5':
            case '6': case '7': case '8': case '9':
                const sectionIndex = parseInt(e.key) - 1;
                if (sectionIndex < sections.length) {
                    console.log(`Keyboard: Navigate to section ${sectionIndex + 1}`);
                    navigateToSection(sectionIndex);
                }
                break;
            default:
                handled = false;
        }
        
        if (handled) {
            e.preventDefault();
            
            // Visual feedback for keyboard navigation
            if (document.body) {
                document.body.style.boxShadow = 'inset 0 0 20px rgba(29, 185, 84, 0.1)';
                setTimeout(() => {
                    document.body.style.boxShadow = '';
                }, 300);
            }
        }
    });
    
    console.log('Keyboard navigation initialized');
}

// Enhanced touch gestures for mobile navigation
function initializeTouchGestures() {
    if (!('ontouchstart' in window)) {
        console.log('Touch not supported, skipping touch gestures');
        return;
    }
    
    if (!mainContent) {
        console.error('Main content not found for touch gestures');
        return;
    }
    
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    let isScrolling = false;
    let touchStartTime = 0;
    
    mainContent.addEventListener('touchstart', function(e) {
        if (sidebar && sidebar.classList.contains('mobile-open')) return;
        
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        touchStartTime = Date.now();
        isScrolling = false;
    }, { passive: true });
    
    mainContent.addEventListener('touchmove', function(e) {
        if (sidebar && sidebar.classList.contains('mobile-open')) return;
        
        const touchMoveY = e.changedTouches[0].screenY;
        const touchMoveX = e.changedTouches[0].screenX;
        
        // Detect if user is scrolling vertically
        if (Math.abs(touchMoveY - touchStartY) > Math.abs(touchMoveX - touchStartX)) {
            isScrolling = true;
        }
    }, { passive: true });
    
    mainContent.addEventListener('touchend', function(e) {
        if ((sidebar && sidebar.classList.contains('mobile-open')) || isScrolling) return;
        
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        
        const touchDuration = Date.now() - touchStartTime;
        
        // Only handle quick swipes (less than 500ms)
        if (touchDuration < 500) {
            handleSwipe();
        }
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diffX = touchStartX - touchEndX;
        const diffY = Math.abs(touchStartY - touchEndY);
        
        // Only handle horizontal swipes with minimal vertical movement
        if (Math.abs(diffX) > swipeThreshold && diffY < 100) {
            if (diffX > 0) {
                // Swipe left - next section
                console.log('Touch: Swipe left, next section');
                navigateToSection(currentSectionIndex + 1);
                
                // Visual feedback
                if (mainContent) {
                    mainContent.style.transform = 'translateX(-5px)';
                    setTimeout(() => {
                        mainContent.style.transform = '';
                    }, 200);
                }
            } else {
                // Swipe right - previous section
                console.log('Touch: Swipe right, previous section');
                navigateToSection(currentSectionIndex - 1);
                
                // Visual feedback
                if (mainContent) {
                    mainContent.style.transform = 'translateX(5px)';
                    setTimeout(() => {
                        mainContent.style.transform = '';
                    }, 200);
                }
            }
        }
    }
    
    console.log('Touch gestures initialized');
}

// Performance optimization: Debounce resize events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle window resize for responsive behavior
window.addEventListener('resize', debounce(function() {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        document.body.classList.add('mobile-view');
        // Reset sidebar state on mobile
        if (sidebar && mainContent) {
            sidebar.style.width = '';
            mainContent.style.marginLeft = '';
        }
    } else {
        document.body.classList.remove('mobile-view');
        // Close mobile menu if open
        if (sidebar && sidebar.classList.contains('mobile-open')) {
            closeMobileMenu();
        }
        // Reset to collapsed state on desktop
        if (sidebar && mainContent && !sidebar.matches(':hover')) {
            sidebar.style.width = '40px';
            mainContent.style.marginLeft = '40px';
        }
    }
}, 250));

// Error handling and recovery
window.addEventListener('error', function(e) {
    console.warn('An error occurred:', e.error);
    
    // Ensure basic functionality still works
    if (!document.querySelector('.content-section.active')) {
        const homeSection = document.getElementById('home');
        if (homeSection) {
            homeSection.classList.add('active');
            currentSectionIndex = 0;
            updateActiveStates();
            updateNowPlaying();
            updateProgressBar();
            console.log('Recovered to home section');
        }
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    stopAutoPlay();
    if (sidebarTimeout) {
        clearTimeout(sidebarTimeout);
    }
});

// Additional features for enhanced interactivity
document.addEventListener('DOMContentLoaded', function() {
    // Ensure external links work properly
    setTimeout(() => {
        const externalLinks = document.querySelectorAll('a[href^="http"], a[target="_blank"]');
        console.log('Found', externalLinks.length, 'external links');
        
        externalLinks.forEach(link => {
            // Ensure target="_blank" is set
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
            
            // Add click handler for visual feedback
            link.addEventListener('click', function(e) {
                console.log('External link clicked:', this.href);
                this.style.opacity = '0.7';
                setTimeout(() => {
                    this.style.opacity = '';
                }, 500);
            });
        });
        
        // Add smooth scrolling for any internal links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        console.log('Additional interactive features initialized');
    }, 500);
});

// Export functions for potential testing or external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        navigateToSection,
        toggleAutoPlay,
        sections,
        openMobileMenu,
        closeMobileMenu
    };
}
