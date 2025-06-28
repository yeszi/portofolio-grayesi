// Supabase Init
const SUPABASE_URL = 'https://owqdtbzhnxbxdsjrlzsa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93cWR0YnpobnhieGRzanJsenNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NzA1MjMsImV4cCI6MjA2NjQ0NjUyM30.cNmvpc_pBV89o9GHMU2CL0bSdgkdavAZuxB_w0Gv4gA';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Inisialisasi Swiper
let swiper;

// DOM Loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Memuat data awal untuk setiap bagian
    await loadSection('about_me', 'about', renderAboutMe);
    await loadSection('projects', 'project', renderProject);
    await loadSection('experience', 'experience', renderExperience);
    await loadSection('activity', 'activity', renderActivity); // Perbaikan: menggunakan 'activity' sebagai sectionId

    // Mendengarkan perubahan realtime untuk setiap bagian
    listenRealtime('about_me', 'about', renderAboutMe);
    listenRealtime('projects', 'project', renderProject);
    listenRealtime('experience', 'experience', renderExperience);
    listenRealtime('activity', 'activity', renderActivity); // Perbaikan: menggunakan 'activity' sebagai sectionId
});

// Load Section - Memuat data dari Supabase dan merendernya
async function loadSection(table, sectionId, renderer) {
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
        console.error(`Error fetching ${table}:`, error);
        return;
    }

    const container = document.getElementById(sectionId);
    if (!container) {
        console.warn(`Container with ID '${sectionId}' not found for table '${table}'.`);
        return;
    }

    if (sectionId === 'about') {
        renderAboutMe(data);
    } else if (sectionId === 'activity') { // Perbaikan: menggunakan 'activity'
        const testimonialWrapper = container.querySelector('.testimonial-wrapper'); // Mencari div internal
        if (testimonialWrapper) {
            testimonialWrapper.innerHTML = renderer(data);
            initializeSwiper(); // Inisialisasi Swiper setelah rendering
        } else {
            console.warn(`Div with class 'testimonial-wrapper' not found inside section '#activity'.`);
        }
    } else if (sectionId === 'project') {
        const box = container.querySelector('.project-container');
        if (box) {
            box.innerHTML = renderer(data);
        } else {
            console.warn(`Div with class 'project-container' not found inside section '#project'.`);
        }
    } else if (sectionId === 'experience') {
        const box = container.querySelector('.experience-container'); // Perbaikan: mencari '.experience-container'
        if (box) {
            box.innerHTML = renderer(data);
        } else {
            console.warn(`Div with class 'experience-container' not found inside section '#experience'.`);
        }
    }
}

// Initialize Swiper
function initializeSwiper() {
    if (swiper) {
        swiper.destroy(true, true); // Hancurkan Swiper yang ada sebelum membuat yang baru
    }
    swiper = new Swiper(".mySwiper", {
        slidesPerView: 1,
        spaceBetween: 30,
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
        breakpoints: {
            0: {
                slidesPerView: 1,
                spaceBetween: 10,
            },
            768: {
                slidesPerView: 2,
                spaceBetween: 20,
            },
            1024: {
                slidesPerView: 3,
                spaceBetween: 30,
            },
        },
    });
}

// Realtime Listener
function listenRealtime(table, sectionId, renderer) {
    supabase
        .channel(`realtime:${table}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
            console.log(`Realtime change detected in ${table}:`, payload); // Untuk debugging
            loadSection(table, sectionId, renderer); // Memuat ulang section saat ada perubahan
        })
        .subscribe();
}

// Render About Me
function renderAboutMe(data) {
    if (!data || data.length === 0) return;
    const aboutContentDiv = document.querySelector('#about .about-content');
    const aboutImgDiv = document.querySelector('#about .about-img');
    const item = data[0];

    // Pastikan elemen ada sebelum mencoba mengatur textContent
    if (aboutContentDiv.querySelector('h3')) {
        aboutContentDiv.querySelector('h3').textContent = item.title || '';
    }
    if (aboutContentDiv.querySelector('p:nth-of-type(1)')) {
        aboutContentDiv.querySelector('p:nth-of-type(1)').textContent = item.description || '';
    }

    if (item.image_url && item.image_url.startsWith('http')) {
        aboutImgDiv.innerHTML = `<img src="${item.image_url}" alt="About Me Image" />`;
    } else {
        aboutImgDiv.innerHTML = '';
    }
}

// Render Project
function renderProject(data) {
    // Pastikan data adalah array dan tidak kosong
    if (!data || data.length === 0) return '';
    return data.map(item => `
        <div class="project-box">
            <img src="${item.image_url}" alt="${item.title}">
            <div class="portfolio-layer">
                <h4>${item.title}</h4>
                <p>${item.description}</p>
                <a href="${item.link || '#'}" target="_blank"><i class='bx bx-link-external'></i></a>
            </div>
        </div>`).join('');
}

// Render Experience
function renderExperience(data) {
    // Pastikan data adalah array dan tidak kosong
    if (!data || data.length === 0) return '';
    return data.map(item => `
        <div class="experience-box">
            <img src="${item.image_url}" alt="${item.title}">
            <div class="portfolio-layer">
                <h4>${item.title}</h4>
                <p>${item.description}</p>
            </div>
        </div>`).join('');
}

// Render Activity
function renderActivity(data) {
    // Pastikan data adalah array dan tidak kosong
    if (!data || data.length === 0) return '';
    return `
        <div class="testimonial-box mySwiper">
            <div class="testimonial-content swiper-wrapper">
                ${data.map(act => `
                    <div class="testimonial-slide swiper-slide">
                        ${(act.image_url || '').split(',').map(url => `<img src="${url.trim()}" alt="${act.title}">`).join('')}
                        <h3>${act.title}</h3>
                        <p>${act.description}</p>
                        ${act.hashtag ? `<p class="hashtag-text">${act.hashtag}</p>` : ''} </div>
                `).join('')}
            </div>
            <div class="swiper-button-next"></div>
            <div class="swiper-button-prev"></div>
            <div class="swiper-pagination"></div>
        </div>`;
}

// Dark Mode Toggle
const darkModeIcon = document.querySelector('#darkMode-icon');
const body = document.body;

// Simpan preferensi di localStorage
if (localStorage.getItem('dark-mode') === 'enabled') {
    body.classList.add('dark-mode');
}

darkModeIcon.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('dark-mode', 'enabled');
    } else {
        localStorage.setItem('dark-mode', 'disabled');
    }
});