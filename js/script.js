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

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

  const supabase = createClient('https://owqdtbzhnxbxdsjrlzsa.supabase.co', 'YeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93cWR0YnpobnhieGRzanJsenNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NzA1MjMsImV4cCI6MjA2NjQ0NjUyM30.cNmvpc_pBV89o9GHMU2CL0bSdgkdavAZuxB_w0Gv4gA')

  // Fungsi fetch dan tampilkan ulang konten
  async function loadData() {
    await loadProjects()
    await loadExperiences()
    await loadActivities()
    await loadArticles()
    await loadAboutMe()
  }

  async function loadProjects() {
    const { data } = await supabase.from('projects').select('*')
    const container = document.querySelector('#project .project-container')
    container.innerHTML = ''
    data.forEach(project => {
      container.innerHTML += `
        <div class="project-box">
          <img src="${project.image_url}" alt="${project.title}">
          <div class="portfolio-layer">
            <h4>${project.title}</h4>
            <p>${project.description}</p>
            <a href="${project.link}" target="_blank"><i class='bx bx-link-external'></i></a>
          </div>
        </div>`
    })
  }

  async function loadExperiences() {
    const { data } = await supabase.from('experience').select('*')
    const container = document.querySelectorAll('#project .project-container')[1]
    container.innerHTML = ''
    data.forEach(item => {
      container.innerHTML += `
        <div class="project-box">
          <img src="${item.image_url}" alt="${item.title}">
          <div class="portfolio-layer">
            <h4>${item.title}</h4>
            <p>${item.description}</p>
          </div>
        </div>`
    })
  }

  async function loadActivities() {
    const { data } = await supabase.from('activity').select('*')
    const container = document.querySelector('.testimonial-content')
    container.innerHTML = ''
    data.forEach(item => {
      container.innerHTML += `
        <div class="testimonial-slide swiper-slide">
          <img src="${item.image_url}" alt="">
          <h3>${item.title}</h3>
          <p>${item.description}</p>
        </div>`
    })
  }

  async function loadArticles() {
    const { data } = await supabase.from('articles').select('*')
    const container = document.querySelector('#articles .article-container')
    container.innerHTML = ''
    data.forEach(article => {
      container.innerHTML += `
        <div class="article-box">
          <img src="${article.image_url}" alt="${article.title}">
          <div class="article-content">
            <h4>${article.title}</h4>
            <p>${article.description}</p>
            <a href="#" class="btn article-btn">Read More <i class='bx bx-right-arrow-alt'></i></a>
          </div>
        </div>`
    })
  }

  async function loadAboutMe() {
    const { data } = await supabase.from('about_me').select('*').eq('id', 1).single()
    if (!data) return
    document.querySelector('.about-content h3').textContent = data.title
    document.querySelector('.about-content p').textContent = data.description
    document.querySelector('.about-img img').src = data.image_url
  }

  // Realtime Listener
  supabase.channel('all-changes')
    .on('postgres_changes', { event: '*', schema: 'public' }, payload => {
      console.log('Detected change:', payload)
      loadData()
    })
    .subscribe()

  loadData()