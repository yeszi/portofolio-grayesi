        const SUPABASE_URL = 'https://owqdtbzhnxbxdsjrlzsa.supabase.co';
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93cWR0YnpobnhieGRzanJsenNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NzA1MjMsImV4cCI6MjA2NjQ0NjUyM30.cNmvpc_pBV89o9GHMU2CL0bSdgkdavAZuxB_w0Gv4gA';
        const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

        document.addEventListener('DOMContentLoaded', async () => {
            await loadArticles();
            listenToArticleChanges();
            initCommonFeatures();
        });

        async function loadArticles() {
            const { data, error } = await supabaseClient.from('articles').select('*');
            const articleContainer = document.querySelector('#articles-section .article-container');

            if (error) {
                console.error("Error fetching articles:", error);
                if (articleContainer) {
                    articleContainer.innerHTML = '<p style="text-align: center; font-size: 1.8rem; color: var(--text-color);">Failed to load articles. Please try again later.</p>';
                }
                return;
            }

            if (articleContainer) {
                articleContainer.innerHTML = renderArticles(data);
            }
        }

        function listenToArticleChanges() {
            supabaseClient
                .channel('realtime:articles')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'articles' }, (payload) => {
                    console.log("Realtime article change detected:", payload);
                    loadArticles();
                })
                .subscribe();
        }

        function renderArticles(data) {
            if (!data || data.length === 0) {
                return '<p style="text-align: center; font-size: 1.8rem; color: var(--text-color);">No articles found.</p>';
            }
            
            return data.map(item => `
                <div class="article-box">
                    <img src="${item.image_url || 'https://via.placeholder.com/320x220?text=No+Image'}" alt="${item.title || 'Article Thumbnail'}">
                    <div class="article-content">
                        <h4>${item.title || 'Untitled Article'}</h4>
                        <p>${item.description || 'No description provided.'}</p>
                        <a href="${item.link || '#'}" class="article-btn">Visit Link</a>
                    </div>
                </div>`).join('');
        }

        function initCommonFeatures() {
            // Dark Mode Toggle
            const darkModeIcon = document.querySelector('#darkMode-icon');
            const body = document.body;
            
            if (localStorage.getItem('dark-mode') === 'enabled') {
                body.classList.add('dark-mode');
                darkModeIcon.classList.replace('bx-moon', 'bx-sun');
            }

            darkModeIcon.addEventListener('click', () => {
                body.classList.toggle('dark-mode');
                const isDarkMode = body.classList.contains('dark-mode');
                
                if (isDarkMode) {
                    darkModeIcon.classList.replace('bx-moon', 'bx-sun');
                    localStorage.setItem('dark-mode', 'enabled');
                } else {
                    darkModeIcon.classList.replace('bx-sun', 'bx-moon');
                    localStorage.setItem('dark-mode', 'disabled');
                }
            });

            // Mobile Menu Toggle
            const menuIcon = document.querySelector('#menu-icon');
            const navbar = document.querySelector('.navbar');
            
            menuIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                navbar.classList.toggle('active');
                menuIcon.classList.toggle('bx-x');
            });

            // Close menu when clicking on links
            document.querySelectorAll('.navbar a').forEach(link => {
                link.addEventListener('click', () => {
                    navbar.classList.remove('active');
                    menuIcon.classList.remove('bx-x');
                });
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navbar.contains(e.target) && !menuIcon.contains(e.target) && navbar.classList.contains('active')) {
                    navbar.classList.remove('active');
                    menuIcon.classList.remove('bx-x');
                }
            });

            // Sticky Header
            const header = document.querySelector('.header');
            window.addEventListener('scroll', () => {
                header.classList.toggle('sticky', window.scrollY > 100);
            });

            // Floating Back Button
            const floatingBackBtn = document.querySelector('.floating-back-btn');
            if (floatingBackBtn) {
                window.addEventListener('scroll', () => {
                    if (window.scrollY > 300) {
                        floatingBackBtn.classList.add('show');
                    } else {
                        floatingBackBtn.classList.remove('show');
                    }
                });

                floatingBackBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                });
            }

            // Handle window resize
            window.addEventListener('resize', () => {
                if (window.innerWidth > 768) {
                    navbar.classList.remove('active');
                    menuIcon.classList.remove('bx-x');
                }
            });
        }