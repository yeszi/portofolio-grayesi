// Import harus di luar DOMContentLoaded
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient('https://owqdtbzhnxbxdsjrlzsa.supabase.co', 'YeyJhbGciOiJI...');

document.addEventListener('DOMContentLoaded', () => {
    // --- DARK MODE TOGGLE ---
    const darkModeIcon = document.querySelector('#darkMode-icon');

    if (darkModeIcon) {
        darkModeIcon.onclick = () => {
            document.body.classList.toggle('dark-mode');

            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
                darkModeIcon.classList.replace('bx-moon', 'bx-sun');
            } else {
                localStorage.setItem('theme', 'light');
                darkModeIcon.classList.replace('bx-sun', 'bx-moon');
            }
        };

        // Load saved theme
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-mode');
            darkModeIcon.classList.replace('bx-moon', 'bx-sun');
        }
    }

    // --- MENU TOGGLE ---
    const menuIcon = document.querySelector('#menu-icon');
    const navbar = document.querySelector('.navbar');

    if (menuIcon && navbar) {
        menuIcon.onclick = () => {
            menuIcon.classList.toggle('bx-x');
            navbar.classList.toggle('active');
        };

        // Close menu on nav link click
        document.querySelectorAll('.navbar a').forEach(link => {
            link.onclick = () => {
                menuIcon.classList.remove('bx-x');
                navbar.classList.remove('active');
            };
        });
    }

    // --- STICKY HEADER ---
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('sticky', window.scrollY > 100);
        });
    }

    // --- SCROLL REVEAL ---
    if (typeof ScrollReveal !== 'undefined') {
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
    }

    // --- SWIPER ---
    if (typeof Swiper !== 'undefined') {
        new Swiper(".mySwiper", {
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
    }

    // Load data from Supabase
    loadData();
});

async function loadData() {
    await loadProjects();
    await loadExperiences();
    await loadActivities();
    await loadArticles();
    await loadAboutMe();
}

async function loadProjects() {
    const { data } = await supabase.from('projects').select('*');
    const container = document.querySelector('#project .project-container');
    if (!container) return;
    container.innerHTML = '';
    data.forEach(project => {
        container.innerHTML += `
            <div class="project-box">
              <img src="${project.image_url}" alt="${project.title}">
              <div class="portfolio-layer">
                <h4>${project.title}</h4>
                <p>${project.description}</p>
                <a href="${project.link}" target="_blank"><i class='bx bx-link-external'></i></a>
              </div>
            </div>`;
    });
}

async function loadExperiences() {
    const { data } = await supabase.from('experience').select('*');
    const containers = document.querySelectorAll('#project .project-container');
    if (containers.length < 2) return;
    const container = containers[1];
    container.innerHTML = '';
    data.forEach(item => {
        container.innerHTML += `
            <div class="project-box">
              <img src="${item.image_url}" alt="${item.title}">
              <div class="portfolio-layer">
                <h4>${item.title}</h4>
                <p>${item.description}</p>
              </div>
            </div>`;
    });
}

async function loadActivities() {
    const { data } = await supabase.from('activity').select('*');
    const container = document.querySelector('.testimonial-content');
    if (!container) return;
    container.innerHTML = '';
    data.forEach(item => {
        container.innerHTML += `
            <div class="testimonial-slide swiper-slide">
              <img src="${item.image_url}" alt="">
              <h3>${item.title}</h3>
              <p>${item.description}</p>
            </div>`;
    });
}

async function loadArticles() {
    const { data } = await supabase.from('articles').select('*');
    const container = document.querySelector('#articles .article-container');
    if (!container) return;
    container.innerHTML = '';
    data.forEach(article => {
        container.innerHTML += `
            <div class="article-box">
              <img src="${article.image_url}" alt="${article.title}">
              <div class="article-content">
                <h4>${article.title}</h4>
                <p>${article.description}</p>
                <a href="#" class="btn article-btn">Read More <i class='bx bx-right-arrow-alt'></i></a>
              </div>
            </div>`;
    });
}

async function loadAboutMe() {
    const { data } = await supabase.from('about_me').select('*').eq('id', 1).single();
    if (!data) return;
    document.querySelector('.about-content h3').textContent = data.title;
    document.querySelector('.about-content p').textContent = data.description;
    document.querySelector('.about-img img').src = data.image_url;
}

supabase.channel('all-changes')
    .on('postgres_changes', { event: '*', schema: 'public' }, payload => {
        console.log('Detected change:', payload);
        loadData();
    })
    .subscribe();
