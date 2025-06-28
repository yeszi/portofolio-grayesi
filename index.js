// Inisialisasi Swiper untuk Testimonial Section
var swiper = new Swiper(".mySwiper", {
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
        0: { slidesPerView: 1, spaceBetween: 10 },
        768: { slidesPerView: 2, spaceBetween: 20 },
        1024: { slidesPerView: 3, spaceBetween: 30 },
    },
});

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
            navLinks.forEach(links => {
                links.classList.remove('active');
            });
            let activeLink = document.querySelector('header .navbar a[href*=' + id + ']');
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    });

    let header = document.querySelector('.header');
    header.classList.toggle('sticky', window.scrollY > 100);

    menuIcon.classList.remove('bx-x');
    navbar.classList.remove('active');
};

darkModeIcon.onclick = () => {
    darkModeIcon.classList.toggle('bx-sun');
    document.body.classList.toggle('dark-mode');
};

const supabaseUrl = 'https://owqdtbzhnxbxdsjrlzsa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', async () => {
    await loadSection('about_me', 'about', renderAboutMe);
    await loadSection('projects', 'project', renderProject);
    await loadSection('experience', 'experience', renderExperience);
    await loadSection('activity', 'testimonial-wrapper', renderActivity);
    await loadSection('articles', 'articles', renderArticle);

    listenRealtime('about_me', 'about', renderAboutMe);
    listenRealtime('projects', 'project', renderProject);
    listenRealtime('experience', 'experience', renderExperience);
    listenRealtime('activity', 'testimonial-wrapper', renderActivity);
    listenRealtime('articles', 'articles', renderArticle);
});

async function loadSection(table, sectionId, renderer) {
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
        console.error(`Error fetching ${table}:`, error);
        return;
    }
    const container = document.getElementById(sectionId);
    if (container) {
        if (['project', 'experience', 'articles'].includes(sectionId)) {
            container.innerHTML = renderer(data);
        } else if (sectionId === 'about') {
            const aboutContentDiv = container.querySelector('.about-content');
            const aboutImgDiv = container.querySelector('.about-img');
            if (data.length > 0) {
                aboutImgDiv.innerHTML = `<img src="${data[0].image_url}" alt="About Me Image">`;
                aboutContentDiv.querySelector('h3').textContent = data[0].title;
                aboutContentDiv.querySelector('p:nth-of-type(1)').textContent = data[0].description;
            }
        } else if (sectionId === 'testimonial-wrapper') {
            container.innerHTML = renderer(data);
            if (swiper) swiper.destroy(true, true);
            swiper = new Swiper(".mySwiper", {
                slidesPerView: 1,
                spaceBetween: 30,
                loop: true,
                grabCursor: true,
                pagination: { el: ".swiper-pagination", clickable: true },
                navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
                breakpoints: {
                    0: { slidesPerView: 1, spaceBetween: 10 },
                    768: { slidesPerView: 2, spaceBetween: 20 },
                    1024: { slidesPerView: 3, spaceBetween: 30 },
                },
            });
        }
    }
}

function listenRealtime(table, sectionId, renderer) {
    supabase
        .channel(`realtime:${table}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: table }, async () => {
            await loadSection(table, sectionId, renderer);
        })
        .subscribe();
}

function renderActivity(data) {
    if (!data || data.length === 0) return `
        <div class="testimonial-box mySwiper">
            <div class="testimonial-content swiper-wrapper"></div>
            <div class="swiper-button-next"></div>
            <div class="swiper-button-prev"></div>
            <div class="swiper-pagination"></div>
        </div>`;

    const slidesHtml = data.map(act => {
        let imagesHtml = '';
        if (act.image_url && typeof act.image_url === 'string') {
            const imageUrls = act.image_url.split(',');
            imageUrls.forEach(url => {
                imagesHtml += `<img src="${url.trim()}" alt="${act.title}">`;
            });
        } else if (Array.isArray(act.image_url)) {
            act.image_url.forEach(url => {
                imagesHtml += `<img src="${url.trim()}" alt="${act.title}">`;
            });
        } else {
            imagesHtml = `<img src="placeholder.png" alt="No Image">`;
        }

        return `
        <div class="testimonial-slide swiper-slide">
            ${imagesHtml}
            <h3>${act.title}</h3>
            <p>${act.description}</p>
            ${act.hashtag ? `<p>${act.hashtag}</p>` : ''}
        </div>`;
    }).join('');

    return `
        <div class="testimonial-box mySwiper">
            <div class="testimonial-content swiper-wrapper">
                ${slidesHtml}
            </div>
            <div class="swiper-button-next"></div>
            <div class="swiper-button-prev"></div>
            <div class="swiper-pagination"></div>
        </div>`;
}


function renderProject(data) {
    return data.map(p => `
        <div class="project-box">
            <img src="${p.image_url}" alt="${p.title}">
            <div class="portfolio-layer">
                <h4>${p.title}</h4>
                <p>${p.description}</p>
                ${p.link ? `<a href="${p.link}" target="_blank"><i class='bx bx-link-external'></i></a>` : ''}
            </div>
        </div>
    `).join('');
}

function renderExperience(data) {
    return data.map(exp => `
        <div class="project-box">
            <img src="${exp.image_url}" alt="${exp.title}">
            <div class="portfolio-layer">
                <h4>${exp.title}</h4>
                <p>${exp.description}</p>
            </div>
        </div>
    `).join('');
}

function renderArticle(data) {
    return data.map(article => `
        <div class="article-box">
            <img src="${article.image_url}" alt="${article.title}">
            <div class="article-content">
                <h4>${article.title}</h4>
                <p>${article.description}</p>
                ${article.link ? `<a href="${article.link}" class="btn article-btn" target="_blank">Site Profil <i class='bx bx-right-arrow-alt'></i></a>` : ''}
            </div>
        </div>
    `).join('');
}
