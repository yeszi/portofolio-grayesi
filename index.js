// Inisialisasi Swiper untuk Testimonial Section
var swiper = new Swiper(".mySwiper", {
    slidesPerView: 1, // Default 1 slide per tampilan
    spaceBetween: 30, // Jarak antar slide
    loop: true, // Mengaktifkan looping slide
    grabCursor: true, // Mengubah kursor saat hover untuk menunjukkan bisa digeser

    pagination: {
        el: ".swiper-pagination", // Elemen untuk pagination
        clickable: true, // Membuat pagination bisa diklik
    },
    navigation: {
        nextEl: ".swiper-button-next", // Elemen untuk tombol next
        prevEl: ".swiper-button-prev", // Elemen untuk tombol prev
    },
    breakpoints: {
        // Ketika lebar layar <= 768px (Mobile & Tablet Portrait)
        0: { // Ini berarti default untuk layar terkecil (0px dan seterusnya)
            slidesPerView: 1,
            spaceBetween: 10, // Mungkin jarak lebih kecil di mobile
        },
        // Ketika lebar layar >= 768px (Tablet Landscape & Desktop kecil)
        768: {
            slidesPerView: 2,
            spaceBetween: 20,
        },
        // Ketika lebar layar >= 1024px (Desktop)
        1024: {
            slidesPerView: 3,
            spaceBetween: 30,
        },
    },
});

// === Kode JavaScript untuk Menu Icon, Sticky Header, dan Dark Mode ===
let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');
let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header .navbar a');
let darkModeIcon = document.querySelector('#darkMode-icon');


// Toggle Navbar saat menu icon diklik
menuIcon.onclick = () => {
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
};

// Mengubah status active navbar link dan sticky header saat scroll
window.onscroll = () => {
    sections.forEach(sec => {
        let top = window.scrollY;
        let offset = sec.offsetTop - 150; // Offset untuk penyesuaian scroll
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');

        if (top >= offset && top < offset + height) {
            navLinks.forEach(links => {
                links.classList.remove('active');
            });
            // Pastikan link navbar yang sesuai dengan section saat ini aktif
            let activeLink = document.querySelector('header .navbar a[href*=' + id + ']');
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    });

    // Menambahkan/menghapus kelas 'sticky' pada header
    let header = document.querySelector('.header');
    header.classList.toggle('sticky', window.scrollY > 100);

    // Menghilangkan ikon toggle dan navbar saat scroll (jika navbar aktif)
    menuIcon.classList.remove('bx-x');
    navbar.classList.remove('active');
};

// Toggle Dark Mode
darkModeIcon.onclick = () => {
    darkModeIcon.classList.toggle('bx-sun'); // Ganti ikon matahari/bulan
    document.body.classList.toggle('dark-mode'); // Toggle kelas dark-mode di body
};


// === Supabase Integration (Jika Anda ingin menggunakan data dari Supabase) ===
const supabaseUrl = 'https://owqdtbzhnxbxdsjrlzsa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93cWR0YnpobnhieGRzanJsenNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NzA1MjMsImV4cCI6MjA2NjQ0NjUyM30.cNmvpc_pBV89o9GHMU2CL0bSdgkdavAZuxB_w0Gv4gA';
const supabase = createClient(supabaseUrl, supabaseKey); // Menggunakan createClient dari window.supabase


document.addEventListener('DOMContentLoaded', async () => {
    // Memuat data saat halaman dimuat
    await loadSection('about_me', 'about', renderAboutMe);
    await loadSection('projects', 'project', renderProject);
    await loadSection('experience', 'experience', renderExperience);
    await loadSection('activity', 'testimonial-wrapper', renderActivity);
    await loadSection('articles', 'articles', renderArticle); // Pastikan ini menargetkan id 'articles' di HTML

    // Aktifkan realtime listener
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
        return; // Hentikan fungsi jika ada error
    }
    const container = document.getElementById(sectionId);
    if (container) {
        // Untuk sections yang isinya diganti sepenuhnya (seperti project, experience, article)
        // Cek apakah kontennya sudah ada atau belum, agar tidak timpa konten statis di awal jika ada
        if (['project', 'experience', 'articles'].includes(sectionId)) {
            container.innerHTML = renderer(data);
        } else if (sectionId === 'about') { // About section punya struktur sedikit berbeda
            const aboutContentDiv = container.querySelector('.about-content');
            const aboutImgDiv = container.querySelector('.about-img');
            if (data.length > 0) {
                // Perbarui hanya bagian yang perlu, jangan timpa seluruh section
                aboutImgDiv.innerHTML = `<img src="${data[0].image_url}" alt="About Me Image">`;
                aboutContentDiv.querySelector('h3').textContent = data[0].title;
                aboutContentDiv.querySelector('p:nth-of-type(1)').textContent = data[0].description;
                // Jika ada lebih dari satu paragraf atau link, Anda perlu logika tambahan
                // Saat ini, renderAboutMe hanya menangani satu paragraf dan tidak ada link dari DB
            }
        } else if (sectionId === 'testimonial-wrapper') {
            // Karena testimonial-wrapper memiliki struktur khusus dengan Swiper
            // Lebih baik Swiper diinisialisasi ulang setelah konten dimuat
            container.innerHTML = renderer(data);
            // Re-initialize Swiper after new content is loaded
            if (swiper) {
                swiper.destroy(true, true); // Destroy existing swiper instance
            }
            swiper = new Swiper(".mySwiper", { // Re-initialize with the same config
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
        .on('postgres_changes', { event: '*', schema: 'public', table: table }, async (payload) => {
            console.log(`Realtime change in ${table}:`, payload);
            await loadSection(table, sectionId, renderer); // Muat ulang bagian yang terpengaruh
        })
        .subscribe();
}

// === RENDER FUNCTIONS ===
function renderAboutMe(data) {
    if (!data || data.length === 0) return '';
    const about = data[0]; // Asumsi hanya satu entri untuk About Me
    return `
        <div class="about-img">
            <img src="${about.image_url}" alt="About Me Image">
        </div>
        <div class="about-content">
            <h2 class="heading">About <span>Me</span></h2>
            <h3>${about.title}</h3>
            <p>${about.description}</p>
            <a href="${about.link1 || '#'}" class="btn" target="_blank">Draft Yesi</a>
            <p>${about.description2 || ''}</p>
            <a href="${about.link2 || '#'}" class="btn" target="_blank">Join Room</a>
        </div>
    `;
}

function renderProject(data) {
    if (!data || data.length === 0) return `<div class="project-container"></div>`; // Return empty container if no data
    return `<div class="project-container">
        ${data.map(project => `
        <div class="project-box">
            <img src="${project.image_url}" alt="${project.title}">
            <div class="portfolio-layer">
                <h4>${project.title}</h4>
                <p>${project.description}</p>
                <a href="${project.link || '#'}" target="_blank"><i class='bx bx-link-external'></i></a>
            </div>
        </div>
        `).join('')}
    </div>`;
}

function renderExperience(data) {
    if (!data || data.length === 0) return `<div class="project-container"></div>`;
    return `<div class="project-container">
        ${data.map(exp => `
        <div class="project-box">
            <img src="${exp.image_url}" alt="${exp.title}">
            <div class="portfolio-layer">
                <h4>${exp.title}</h4>
                <p>${exp.description}</p>
            </div>
        </div>
        `).join('')}
    </div>`;
}

function renderActivity(data) {
    if (!data || data.length === 0) return `
        <div class="testimonial-box mySwiper">
            <div class="testimonial-content swiper-wrapper"></div>
            <div class="swiper-button-next"></div>
            <div class="swiper-button-prev"></div>
            <div class="swiper-pagination"></div>
        </div>`; // Return empty swiper if no data

    // Logic untuk multiple images per slide, asumsikan image_url adalah array atau dipisahkan koma
    // Jika tidak, Anda perlu menyesuaikan Supabase data model atau logika ini.
    const slidesHtml = data.map(act => {
        let imagesHtml = '';
        if (act.image_url && typeof act.image_url === 'string') {
            const imageUrls = act.image_url.split(','); // Asumsi URL dipisahkan koma
            imagesUrls.forEach(url => {
                imagesHtml += `<img src="${url.trim()}" alt="${act.title}">`;
            });
        } else if (Array.isArray(act.image_url)) { // Jika image_url sudah berupa array
            act.image_url.forEach(url => {
                imagesHtml += `<img src="${url.trim()}" alt="${act.title}">`;
            });
        } else {
            imagesHtml = `<img src="placeholder.png" alt="No Image">`; // Placeholder
        }

        return `
        <div class="testimonial-slide swiper-slide">
            ${imagesHtml}
            <h3>${act.title}</h3>
            <p>${act.description}</p>
            ${act.hashtag ? `<p>${act.hashtag}</p>` : ''} </div>
        `;
    }).join('');

    return `
        <div class="testimonial-box mySwiper">
            <div class="testimonial-content swiper-wrapper">
                ${slidesHtml}
            </div>
            <div class="swiper-button-next"></div>
            <div class="swiper-button-prev"></div>
            <div class="swiper-pagination"></div>
        </div>
    `;
}

function renderArticle(data) {
    if (!data || data.length === 0) return `<div class="article-container"></div>`;
    return `<div class="article-container">
        ${data.map(article => `
        <div class="article-box">
            <img src="${article.image_url}" alt="${article.title}">
            <div class="article-content">
                <h4>${article.title}</h4>
                <p>${article.description}</p>
                <a href="${article.link || '#'}" class="btn article-btn" target="_blank">
                    Site Profil <i class='bx bx-right-arrow-alt'></i>
                </a>
            </div>
        </div>
        `).join('')}
    </div>`;
}

// === Initialize ScrollReveal ===
ScrollReveal({
    distance: '80px',
    duration: 2000,
    delay: 200
});

ScrollReveal().reveal('.home-content, .heading', { origin: 'top' });
ScrollReveal().reveal('.home-img, .services-container, .project-box, .testimonial-wrapper, .contact form, .education-container, .article-container', { origin: 'bottom' });
ScrollReveal().reveal('.home-content h1, .about-img', { origin: 'left' });
ScrollReveal().reveal('.home-content p, .about-content', { origin: 'right' });

document.addEventListener('DOMContentLoaded', () => {
    // --- Removed: Menu Pop-up related code ---
    // (openMenuButton, menuPopup, closeBtn, their event listeners)

    const navCards = document.querySelectorAll('.profile-navigator .nav-card');
    const sections = document.querySelectorAll('.content-detail-section, .education');

    // Handle navigation when a card is clicked (still needed for smooth scroll)
    navCards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                // No need to close popup here, just scroll
                window.scrollTo({
                    top: targetSection.offsetTop - 70, // Adjust offset if you have a fixed header
                    behavior: 'smooth'
                });
            }
        });
    });

    // Highlight active nav card based on scroll position
    function highlightActiveSection() {
        let currentActiveSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100; // Adjust offset as needed
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentActiveSectionId = section.id;
            }
        });

        navCards.forEach(card => {
            card.classList.remove('active');
            if (card.getAttribute('href') === `#${currentActiveSectionId}`) {
                card.classList.add('active');
            }
        });
    }

    highlightActiveSection();
    window.addEventListener('scroll', highlightActiveSection);

    // --- Back to Top Pop-up Button Code (kept as is) ---
    const backToTopPopup = document.getElementById('backToTopPopup');
    const scrollThreshold = 300; // Jarak scroll ke bawah sebelum tombol muncul (dalam piksel)

    function toggleBackToTopButton() {
        if (window.scrollY > scrollThreshold) {
            backToTopPopup.classList.add('show');
        } else {
            backToTopPopup.classList.remove('show');
        }
    }

    window.addEventListener('scroll', toggleBackToTopButton);
    toggleBackToTopButton(); // Initial check

    if (backToTopPopup) {
        backToTopPopup.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});