// --- SEMUA KODE JAVASCRIPT ANDA ---

// Import Supabase Client. Pastikan ini ada di bagian paling atas file JS Anda
// jika Anda menggunakan <script type="module"> di HTML.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Mengkapsulasi semua logika skrip utama Anda di dalam DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {

    // --- Toggle Mode Gelap ---
    const darkModeIcon = document.querySelector('#darkMode-icon');

    // Pastikan darkModeIcon ada sebelum menambahkan event listener klik
    if (darkModeIcon) {
        darkModeIcon.onclick = () => {
            document.body.classList.toggle('dark-mode');

            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
                darkModeIcon.classList.remove('bx-moon'); // Ganti ikon menjadi matahari saat mode gelap aktif
                darkModeIcon.classList.add('bx-sun');
            } else {
                localStorage.setItem('theme', 'light');
                darkModeIcon.classList.remove('bx-sun'); // Ganti ikon kembali menjadi bulan
                darkModeIcon.classList.add('bx-moon');
            }
        };

        // Menerapkan preferensi tema yang disimpan dan ikon saat halaman dimuat
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-mode');
            darkModeIcon.classList.remove('bx-moon');
            darkModeIcon.classList.add('bx-sun');
        } else {
            document.body.classList.remove('dark-mode');
            darkModeIcon.classList.remove('bx-sun');
            darkModeIcon.classList.add('bx-moon');
        }
    }


    // --- Fungsionalitas JavaScript Lainnya yang Sudah Ada ---

    // Toggle ikon navbar (menu-icon)
    let menuIcon = document.querySelector('#menu-icon');
    let navbar = document.querySelector('.navbar');

    // Pastikan menuIcon dan navbar ada
    if (menuIcon && navbar) {
        menuIcon.onclick = () => {
            menuIcon.classList.toggle('bx-x');
            navbar.classList.toggle('active');
        };
    }


    // Konfigurasi Scroll Reveal (pastikan pustaka ScrollReveal sudah dimuat)
    // Pastikan ScrollReveal tersedia sebelum menggunakannya
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


    // Swiper untuk testimoni (pastikan pustaka Swiper sudah dimuat)
    let swiper; // Deklarasikan di sini agar bisa diakses dan dihancurkan

    // Fungsi untuk menginisialisasi atau menginisialisasi ulang Swiper
    function initializeSwiper() {
        if (typeof Swiper !== 'undefined') {
            // Hancurkan instance Swiper yang sudah ada untuk menghindari konflik
            if (swiper) {
                swiper.destroy(true, true); // true, true untuk menghapus semua slide dan membebaskan memori
            }
            swiper = new Swiper(".mySwiper", {
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
                // Tambahkan breakpoints responsif untuk Swiper
                breakpoints: {
                    768: { // Sesuaikan breakpoint ini sesuai kebutuhan
                        navigation: {
                            enabled: true, // Aktifkan tombol navigasi di layar lebih besar dari 768px
                        },
                    },
                    0: { // Untuk layar lebih kecil dari 768px
                        navigation: {
                            enabled: false, // Nonaktifkan tombol navigasi di mobile
                        },
                    },
                },
            });
        }
    }


    // Fungsionalitas sticky header
    const header = document.querySelector('header');
    if (header) { // Pastikan header ada
        window.addEventListener('scroll', () => {
            header.classList.toggle('sticky', window.scrollY > 100);
        });
    }


    // Menghapus ikon toggle dan navbar saat mengklik tautan navbar (untuk navigasi seluler)
    const navLinks = document.querySelectorAll('.navbar a');
    if (navLinks.length > 0 && menuIcon && navbar) { // Pastikan elemen ada
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Hanya jika menuIcon dan navbar aktif (artinya, tampilan seluler)
                if (menuIcon.classList.contains('bx-x')) {
                    menuIcon.classList.remove('bx-x');
                    navbar.classList.remove('active');
                }
            });
        });
    }


    // --- Integrasi Supabase (Sudah terstruktur dengan baik) ---
    const supabase = createClient('https://owqdtbzhnxbxdsjrlzsa.supabase.co', 'YeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93cWR0YnpobnhieGRzanJsenNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NzA1MjMsImV4cCI6MjA2NjQ0NjUyM30.cNmvpc_pBV89o9GHMU2CL0bSdgkdavAZuxB_w0Gv4gA')

    async function loadData() {
        await loadProjects();
        await loadExperiences();
        await loadActivities();
        await loadArticles();
        await loadAboutMe();

        // Inisialisasi ulang Swiper setelah memuat konten dinamis
        // Ini penting jika konten testimoni Anda dimuat melalui Supabase
        initializeSwiper();
    }

    async function loadProjects() {
        const { data, error } = await supabase.from('projects').select('*');
        if (error) { console.error('Error loading projects:', error); return; }
        const container = document.querySelector('#project .project-container');
        if (container) {
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
    }

    async function loadExperiences() {
        const { data, error } = await supabase.from('experience').select('*');
        if (error) { console.error('Error loading experiences:', error); return; }
        // Perhatian: Anda memiliki dua .project-container. Pastikan Anda menargetkan yang benar.
        // Jika pengalaman Anda dimaksudkan untuk bagian yang berbeda, sesuaikan selektor.
        // Untuk demonstrasi, saya menggunakan yang kedua yang ditemukan.
        // Jika itu adalah container kedua di bagian proyek, pertimbangkan untuk memberinya ID unik.
        const container = document.querySelectorAll('.project-container')[1];
        if (container) {
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
    }

    async function loadActivities() {
        const { data, error } = await supabase.from('activity').select('*');
        if (error) { console.error('Error loading activities:', error); return; }
        // .testimonial-content adalah container utama, tetapi slide sebenarnya ada di dalam .swiper-wrapper
        const swiperWrapper = document.querySelector('.testimonial-box .swiper-wrapper');
        if (swiperWrapper) {
            swiperWrapper.innerHTML = ''; // Hapus slide sebelumnya
            data.forEach(item => {
                swiperWrapper.innerHTML += `
                    <div class="testimonial-slide swiper-slide">
                        <img src="${item.image_url}" alt="">
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                    </div>`;
            });
        }
    }

    async function loadArticles() {
        const { data, error } = await supabase.from('articles').select('*');
        if (error) { console.error('Error loading articles:', error); return; }
        const container = document.querySelector('#articles .article-container');
        if (container) {
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
    }

    async function loadAboutMe() {
        const { data, error } = await supabase.from('about_me').select('*').eq('id', 1).single();
        if (error) { console.error('Error loading about me:', error); return; }
        if (data) {
            // Pastikan elemen-elemen ini ada sebelum mengaksesnya
            const aboutContentH3 = document.querySelector('.about-content h3');
            const aboutContentP = document.querySelector('.about-content p');
            const aboutImg = document.querySelector('.about-img img');

            if (aboutContentH3) aboutContentH3.textContent = data.title;
            if (aboutContentP) aboutContentP.textContent = data.description;
            if (aboutImg) aboutImg.src = data.image_url;
        }
    }

    // Realtime Listener Supabase
    supabase.channel('all-changes')
        .on('postgres_changes', { event: '*', schema: 'public' }, payload => {
            console.log('Detected change:', payload);
            loadData(); // Muat ulang data saat ada perubahan
        })
        .subscribe();

    // Pemuatan awal data
    loadData();

}); // Akhir dari DOMContentLoaded