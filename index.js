// Inisialisasi Swiper
let swiper = new Swiper(".mySwiper", {
  slidesPerView: 1,
  spaceBetween: 30,
  loop: true,
  grabCursor: true,
  pagination: { el: ".swiper-pagination", clickable: true },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev"
  },
  breakpoints: {
    0: { slidesPerView: 1, spaceBetween: 10 },
    768: { slidesPerView: 2, spaceBetween: 20 },
    1024: { slidesPerView: 3, spaceBetween: 30 }
  }
});

// Toggle menu dan dark mode
let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');
let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header .navbar a');
let darkModeIcon = document.querySelector('#darkMode-icon');

menuIcon.onclick = () => {
  menuIcon.classList.toggle('bx-x');
  navbar.classList.toggle('active');
};

window.onscroll = () => {
  sections.forEach(sec => {
    let top = window.scrollY;
    let offset = sec.offsetTop - 150;
    let height = sec.offsetHeight;
    let id = sec.getAttribute('id');
    if (top >= offset && top < offset + height) {
      navLinks.forEach(links => links.classList.remove('active'));
      let activeLink = document.querySelector('header .navbar a[href*=' + id + ']');
      if (activeLink) activeLink.classList.add('active');
    }
  });
  document.querySelector('.header').classList.toggle('sticky', window.scrollY > 100);
  menuIcon.classList.remove('bx-x');
  navbar.classList.remove('active');
};

darkModeIcon.onclick = () => {
  darkModeIcon.classList.toggle('bx-sun');
  document.body.classList.toggle('dark-mode');
};

// Supabase Init
const SUPABASE_URL = 'https://owqdtbzhnxbxdsjrlzsa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93cWR0YnpobnhieGRzanJsenNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NzA1MjMsImV4cCI6MjA2NjQ0NjUyM30.cNmvpc_pBV89o9GHMU2CL0bSdgkdavAZuxB_w0Gv4gA';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Load Data dan Real-Time Listener
document.addEventListener('DOMContentLoaded', async () => {
  await loadSection('about_me', 'about', renderAboutMe);
  await loadSection('projects', 'project', renderProject);
  await loadSection('experience', 'experience', renderExperience);
  await loadSection('activity', 'testimonial-wrapper', renderActivity);
  await loadSection('articles', 'organization', renderArticle);

  listenRealtime('about_me', 'about', renderAboutMe);
  listenRealtime('projects', 'project', renderProject);
  listenRealtime('experience', 'experience', renderExperience);
  listenRealtime('activity', 'testimonial-wrapper', renderActivity);
  listenRealtime('articles', 'organization', renderArticle);
});

async function loadSection(table, sectionId, renderer) {
  const { data, error } = await supabase.from(table).select('*');
  if (error) return console.error(`Error fetching ${table}:`, error);
  const container = document.getElementById(sectionId);
  if (!container) return;

  if (sectionId === 'about') {
    renderAboutMe(data);
  } else if (sectionId === 'testimonial-wrapper') {
    container.innerHTML = renderer(data);
    if (swiper) swiper.destroy(true, true);
    swiper = new Swiper(".mySwiper", swiper.params);
  } else {
    container.querySelector('.project-container')?.replaceChildren(); // clear if exists
    container.querySelector('.article-container')?.replaceChildren(); // clear if exists
    container.innerHTML = renderer(data);
  }
}

function listenRealtime(table, sectionId, renderer) {
  supabase
    .channel(`realtime:${table}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, async () => {
      await loadSection(table, sectionId, renderer);
    })
    .subscribe();
}

// ================== Renderer Functions ===================
function renderAboutMe(data) {
  if (!data || data.length === 0) return;
  const aboutContentDiv = document.querySelector('#about .about-content');
  const aboutImgDiv = document.querySelector('#about .about-img');
  const item = data[0];
  aboutContentDiv.querySelector('h3').textContent = item.title || '';
  aboutContentDiv.querySelector('p:nth-of-type(1)').textContent = item.description || '';
  if (item.image_url) {
    aboutImgDiv.innerHTML = `<img src="${item.image_url}" alt="About Me Image">`;
  }
}

function renderProject(data) {
  return data.map(item => `
    <div class="project-box">
      <img src="${item.image_url}" alt="${item.title}">
      <div class="portfolio-layer">
        <h4>${item.title}</h4>
        <p>${item.description}</p>
        <a href="${item.link || 'articles.html'}" target="_blank"><i class='bx bx-link-external'></i></a>
      </div>
    </div>`).join('');
}

function renderExperience(data) {
  return data.map(item => `
    <div class="experience-box">
      <img src="${item.image_url}" alt="${item.title}">
      <div class="portfolio-layer">
        <h4>${item.title}</h4>
        <p>${item.description}</p>
      </div>
    </div>`).join('');
}

function renderArticle(data) {
  return data.map(item => `
    <div class="article-box">
      <img src="${item.image_url}" alt="Article Thumbnail">
      <div class="article-content">
        <h4>${item.title}</h4>
        <p>${item.description}</p>
        <a href="${item.link}" class="btn article-btn" target="_blank">Site Profil <i class='bx bx-right-arrow-alt'></i></a>
      </div>
    </div>`).join('');
}

function renderActivity(data) {
  return `
    <div class="testimonial-box mySwiper">
      <div class="testimonial-content swiper-wrapper">
        ${data.map(act => `
          <div class="testimonial-slide swiper-slide">
            ${(act.image_url || '').split(',').map(url => `<img src="${url.trim()}" alt="${act.title}">`).join('')}
            <h3>${act.title}</h3>
            <p>${act.description}</p>
            ${act.hashtag ? `<p>${act.hashtag}</p>` : ''}
          </div>
        `).join('')}
      </div>
      <div class="swiper-button-next"></div>
      <div class="swiper-button-prev"></div>
      <div class="swiper-pagination"></div>
    </div>`;
}
