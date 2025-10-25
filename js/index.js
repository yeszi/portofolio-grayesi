// Supabase Configuration - SAMA DENGAN ADMIN PANEL
        const SUPABASE_URL = 'https://owqdtbzhnxbxdsjrlzsa.supabase.co';
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93cWR0YnpobnhieGRzanJsenNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NzA1MjMsImV4cCI6MjA2NjQ0NjUyM30.cNmvpc_pBV89o9GHMU2CL0bSdgkdavAZuxB_w0Gv4gA';
        
        // Initialize Supabase client
        const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

        console.log('🚀 Supabase client initialized');

        // Initialize when DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
            console.log('📄 DOM Loaded - Starting data loading...');
            loadAllData();
            
            // Initialize other functionality
            initDarkMode();
            initMenuToggle();
            initScrollReveal();
            initScrollToTop();
        });

        // Load all data from Supabase - SESUAI DENGAN TABEL DI ADMIN
        async function loadAllData() {
            console.log('🔄 Loading all data from Supabase...');
            
            try {
                await Promise.all([
                    loadAboutMe(),
                    loadProjects(),
                    loadExperiences(),
                    loadActivities()
                ]);
                console.log('✅ All data loaded successfully!');
            } catch (error) {
                console.error('❌ Error loading data:', error);
                // Show fallback content if there's an error
                showFallbackContent();
            }
        }

        // Load About Me from Supabase
        async function loadAboutMe() {
            console.log('👤 Loading About Me...');
            const aboutContent = document.getElementById('about-description');
            const aboutImage = document.getElementById('about-image');
            const homeImage = document.getElementById('home-profile-image');
            
            if (!aboutContent) {
                console.log('❌ About content element not found');
                return;
            }
            
            try {
                const { data, error } = await supabase
                    .from('about_me')
                    .select('*')
                    .single();

                if (error) {
                    console.log('ℹ️ No about_me data, using default content');
                    return; // Keep default content
                }

                if (data && data.description) {
                    console.log('✅ About Me loaded from Supabase');
                    aboutContent.textContent = data.description;
                    
                    // Update images if available
                    if (data.image_url) {
                        if (aboutImage) {
                            aboutImage.src = data.image_url;
                            aboutImage.alt = "About Me";
                        }
                        if (homeImage) {
                            homeImage.src = data.image_url;
                            homeImage.alt = "Profile Picture";
                        }
                    }
                }
            } catch (error) {
                console.error('❌ Error loading About Me:', error);
            }
        }

        // Load Projects from Supabase
        async function loadProjects() {
            console.log('💼 Loading Projects from Supabase...');
            const projectContainer = document.querySelector('.project-container');
            
            if (!projectContainer) {
                console.log('❌ Project container not found');
                return;
            }
            
            try {
                const { data, error } = await supabase
                    .from('projects')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('❌ Error fetching projects:', error);
                    projectContainer.innerHTML = `
                        <div class="error-message">
                            <p>Failed to load projects data.</p>
                        </div>
                    `;
                    return;
                }

                if (data && data.length > 0) {
                    console.log(`✅ ${data.length} projects loaded from Supabase`);
                    projectContainer.innerHTML = data.map(project => `
                        <div class="project-box">
                            <div class="project-image">
                                <img src="${project.image_url || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'}" 
                                     alt="${project.title}" 
                                     onerror="this.src='https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'">
                            </div>
                            <div class="project-content">
                                <h4>${project.title}</h4>
                                <p>${project.description}</p>
                                ${project.link ? `
                                    <a href="${project.link}" class="project-btn" target="_blank">
                                        View Project <i class='bx bx-right-arrow-alt'></i>
                                    </a>
                                ` : '<a href="#project" class="project-btn">View Details <i class=\'bx bx-right-arrow-alt\'></i></a>'}
                            </div>
                        </div>
                    `).join('');
                } else {
                    console.log('ℹ️ No projects found in database');
                    projectContainer.innerHTML = `
                        <div class="error-message">
                            <p>No projects found.</p>
                        </div>
                    `;
                }
            } catch (error) {
                console.error('❌ Error loading projects:', error);
                projectContainer.innerHTML = `
                    <div class="error-message">
                        <p>Error loading projects.</p>
                    </div>
                `;
            }
        }

        // Load Experiences from Supabase - DENGAN GAMBAR
        async function loadExperiences() {
            console.log('💼 Loading Experiences from Supabase...');
            const experienceContainer = document.querySelector('.experience-container');
            
            if (!experienceContainer) {
                console.log('❌ Experience container not found');
                return;
            }
            
            try {
                const { data, error } = await supabase
                    .from('experience')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    console.log('ℹ️ No experiences data');
                    showFallbackExperiences();
                    return;
                }

                if (data && data.length > 0) {
                    console.log(`✅ ${data.length} experiences loaded from Supabase`);
                    experienceContainer.innerHTML = data.map(exp => `
                        <div class="experience-card">
                            <div class="experience-image">
                                <img src="${exp.image_url || 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'}" 
                                     alt="${exp.title}" 
                                     onerror="this.src='https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'">
                            </div>
                            <div class="experience-content">
                                <h4>${exp.title}</h4>
                                <p>${exp.description}</p>
                                ${exp.period ? `<span class="experience-period">${exp.period}</span>` : ''}
                            </div>
                        </div>
                    `).join('');
                } else {
                    console.log('ℹ️ No experiences found');
                    showFallbackExperiences();
                }
            } catch (error) {
                console.error('❌ Error loading experiences:', error);
                showFallbackExperiences();
            }
        }

        // Load Activities from Supabase
        async function loadActivities() {
            console.log('🎯 Loading Activities from Supabase...');
            const activityContainer = document.querySelector('.activity-grid');
            
            if (!activityContainer) {
                console.log('❌ Activity container not found');
                return;
            }
            
            try {
                const { data, error } = await supabase
                    .from('activity')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) {
                    console.log('ℹ️ No activities data');
                    showFallbackActivities();
                    return;
                }

                if (data && data.length > 0) {
                    console.log(`✅ ${data.length} activities loaded from Supabase`);
                    activityContainer.innerHTML = data.map(activity => `
                        <div class="activity-card">
                            <div class="activity-image">
                                <img src="${activity.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'}" 
                                     alt="${activity.title}" 
                                     onerror="this.src='https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'">
                            </div>
                            <div class="activity-content">
                                <h4>${activity.title}</h4>
                                <p>${activity.description}</p>
                            </div>
                        </div>
                    `).join('');
                } else {
                    console.log('ℹ️ No activities found');
                    showFallbackActivities();
                }
            } catch (error) {
                console.error('❌ Error loading activities:', error);
                showFallbackActivities();
            }
        }

        // Fallback content functions
        function showFallbackExperiences() {
            console.log('🔄 Showing fallback experiences');
            const experienceContainer = document.querySelector('.experience-container');
            experienceContainer.innerHTML = `
                <div class="experience-card">
                    <div class="experience-image">
                        <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" alt="Work Experience">
                    </div>
                    <div class="experience-content">
                        <h4>Frontend Developer Intern</h4>
                        <p>Mengembangkan dan memelihara aplikasi web menggunakan React.js dan TypeScript.</p>
                        <span class="experience-period">Jun 2023 - Sep 2023</span>
                    </div>
                </div>
            `;
        }

        function showFallbackActivities() {
            console.log('🔄 Showing fallback activities');
            const activityContainer = document.querySelector('.activity-grid');
            activityContainer.innerHTML = `
                <div class="activity-card">
                    <div class="activity-image">
                        <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" alt="Coding Workshop">
                    </div>
                    <div class="activity-content">
                        <h4>Web Development Workshop</h4>
                        <p>Mengikuti workshop pengembangan web modern dengan fokus pada responsive design.</p>
                    </div>
                </div>
            `;
        }

        function showFallbackContent() {
            showFallbackExperiences();
            showFallbackActivities();
        }

        // Real-time updates for all tables
        function setupRealTimeUpdates() {
            console.log('🔄 Setting up real-time updates...');
            
            // Listen for changes in all tables
            const tables = ['about_me', 'projects', 'experience', 'activity'];
            
            tables.forEach(table => {
                supabase
                    .channel(`${table}-changes`)
                    .on('postgres_changes', 
                        { event: '*', schema: 'public', table: table },
                        (payload) => {
                            console.log(`🔄 Real-time update received for ${table}:`, payload);
                            // Reload the corresponding section
                            switch(table) {
                                case 'about_me':
                                    loadAboutMe();
                                    break;
                                case 'projects':
                                    loadProjects();
                                    break;
                                case 'experience':
                                    loadExperiences();
                                    break;
                                case 'activity':
                                    loadActivities();
                                    break;
                            }
                        }
                    )
                    .subscribe((status) => {
                        if (status === 'SUBSCRIBED') {
                            console.log(`✅ Successfully subscribed to ${table} real-time updates`);
                        } else {
                            console.log(`❌ Failed to subscribe to ${table} real-time updates`);
                        }
                    });
            });
        }

        // Initialize real-time updates
        setupRealTimeUpdates();

        // Dark Mode Toggle
        function initDarkMode() {
            const darkModeIcon = document.querySelector('#darkMode-icon');
            const body = document.body;

            // Check for saved theme preference or respect OS preference
            const isDarkMode = localStorage.getItem('darkMode') === 'true' || 
                                   (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);

            if (isDarkMode) {
                body.classList.add('dark-mode');
                darkModeIcon.classList.replace('bx-moon', 'bx-sun');
            }

            darkModeIcon.addEventListener('click', () => {
                body.classList.toggle('dark-mode');
                const isDark = body.classList.contains('dark-mode');
                localStorage.setItem('darkMode', isDark);
                
                if (isDark) {
                    darkModeIcon.classList.replace('bx-moon', 'bx-sun');
                } else {
                    darkModeIcon.classList.replace('bx-sun', 'bx-moon');
                }
            });
        }

        // Mobile Menu Toggle
        function initMenuToggle() {
            const menuIcon = document.querySelector('#menu-icon');
            const navbar = document.querySelector('.navbar');

            menuIcon.addEventListener('click', () => {
                navbar.classList.toggle('active');
                menuIcon.classList.toggle('bx-x');
            });

            // Close menu when clicking on a link
            document.querySelectorAll('.navbar a').forEach(link => {
                link.addEventListener('click', () => {
                    navbar.classList.remove('active');
                    menuIcon.classList.remove('bx-x');
                });
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navbar.contains(e.target) && !menuIcon.contains(e.target)) {
                    navbar.classList.remove('active');
                    menuIcon.classList.remove('bx-x');
                }
            });
        }

        // Scroll Reveal Animation
        function initScrollReveal() {
            const sr = ScrollReveal({
                distance: '50px',
                duration: 1500,
                delay: 200,
                reset: true
            });

            sr.reveal('.home-content, .heading', { origin: 'top' });
            sr.reveal('.home-img, .services-container, .project-box, .activity-card, .experience-card, .organization-box', { origin: 'bottom' });
            sr.reveal('.home-content h1, .about-img', { origin: 'left' });
            sr.reveal('.home-content p, .about-content', { origin: 'right' });
        }

        // Scroll to Top Functionality
        function initScrollToTop() {
            const backBtn = document.querySelector('.floating-back-btn');
            
            window.addEventListener('scroll', () => {
                if (window.scrollY > 500) {
                    backBtn.classList.add('show');
                } else {
                    backBtn.classList.remove('show');
                }
            });

            backBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }

        // Handle image loading errors
        document.addEventListener('DOMContentLoaded', function() {
            document.querySelectorAll('img').forEach(img => {
                img.addEventListener('error', function() {
                    this.src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80';
                    this.alt = 'Image not available';
                });
            });
        });