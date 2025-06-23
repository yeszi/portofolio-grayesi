// --- Dark Mode Toggle ---
const darkModeIcon = document.querySelector('#darkMode-icon');

darkModeIcon.onclick = () => {
    document.body.classList.toggle('dark-mode');

    // Optional: Save user's preference in localStorage
    // This makes the dark mode persistent across sessions
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        darkModeIcon.classList.remove('bx-moon'); // Change icon to sun when dark mode is on
        darkModeIcon.classList.add('bx-sun');
    } else {
        localStorage.setItem('theme', 'light');
        darkModeIcon.classList.remove('bx-sun'); // Change icon back to moon
        darkModeIcon.classList.add('bx-moon');
    }
};

// Optional: Apply saved theme preference and icon on page load
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        darkModeIcon.classList.remove('bx-moon');
        darkModeIcon.classList.add('bx-sun');
    } else {
        // Ensure it's in light mode if no preference or explicitly light
        document.body.classList.remove('dark-mode');
        darkModeIcon.classList.remove('bx-sun');
        darkModeIcon.classList.add('bx-moon');
    }
});


// --- Other Existing JavaScript Functionalities ---

// Toggle icon navbar (menu-icon)
let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menuIcon.onclick = () => {
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
};

// Scroll reveal configuration (make sure ScrollReveal library is loaded)
ScrollReveal({
    reset: true,
    distance: '80px',
    duration: 2000,
    delay: 200
});

ScrollReveal().reveal('.home-content, .heading', { origin: 'top' });
ScrollReveal().reveal('.home-img, .services-container, .project-box, .contact form', { origin: 'bottom' });
ScrollReveal().reveal('.home-content h1, .about-img', { origin: 'left' });
ScrollReveal().reveal('.home-content p, .about-content', { origin: 'right' });

// Swiper for testimonials (make sure Swiper library is loaded)
var swiper = new Swiper(".mySwiper", {
    slidesPerView: 1,
    spaceBetween: 50,
    loop: true,
    grabCursor: true,
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
});

// Sticky header functionality
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
    header.classList.toggle('sticky', window.scrollY > 100);
});

// Remove toggle icon and navbar when click navbar link (for mobile navigation)
const navLinks = document.querySelectorAll('.navbar a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        // Only if menuIcon and navbar are active (meaning, mobile view)
        if (menuIcon.classList.contains('bx-x')) {
            menuIcon.classList.remove('bx-x');
            navbar.classList.remove('active');
        }
    });
});