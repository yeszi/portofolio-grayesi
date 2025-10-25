 document.addEventListener('DOMContentLoaded', () => {

        const sidebar = document.getElementById('sidebar');
        const openBtn = document.getElementById('hamburger-open');
        const closeBtn = document.getElementById('sidebar-close');
        const overlay = document.getElementById('sidebar-overlay');

        function openSidebar() {
            if(sidebar) sidebar.classList.add('open');
            if(overlay) overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeSidebar() {
            if(sidebar) sidebar.classList.remove('open');
            if(overlay) overlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        }

        if (openBtn) openBtn.addEventListener('click', openSidebar);
        if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
        if (overlay) overlay.addEventListener('click', closeSidebar);

        const SUPABASE_URL = 'https://owqdtbzhnxbxdsjrlzsa.supabase.co';
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93cWR0YnpobnhieGRzanJsenNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NzA1MjMsImV4cCI6MjA2NjQ0NjUyM30.cNmvpc_pBV89o9GHMU2CL0bSdgkdavAZuxB_w0Gv4gA';
        const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

        const BUCKETS = {
            ABOUT: 'aboutimages',
            PROJECT: 'projectimages',
            EXPERIENCE: 'experienceimages',
            ACTIVITY: 'activitybucket', 
            ARTICLE: 'articlesimage', 
        };

        supabaseClient.auth.getSession().then(({ data: { session } }) => {
            if (!session || session.user.email !== "grayesi.silitonga@gmail.com") {
                alert("Akses ditolak. Silakan login kembali.");
                window.location.href = "login.html"; 
            }
        }).catch(err => {
             console.error("Error checking session:", err);
             alert("Terjadi kesalahan saat verifikasi login.");
             window.location.href = "login.html";
        });

        const logoutButton = document.getElementById('logoutLink');
        if (logoutButton) {
            logoutButton.addEventListener('click', async (e) => {
                e.preventDefault();
                const { error } = await supabaseClient.auth.signOut();
                if (error) {
                     alert('Gagal logout: ' + error.message);
                } else {
                    alert("Berhasil logout!");
                    window.location.href = "login.html"; 
                }
            });
        }

        window.uploadImage = async function(bucket, file) {
            if (!file) {
                console.warn("⚠️ Tidak ada file yang dipilih.");
                return null;
            }
            const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`; 
            console.log(`📤 Mengupload ${fileName} ke bucket ${bucket}...`);

            const { data, error } = await supabaseClient.storage.from(bucket).upload(fileName, file);
            if (error) {
                console.error("❌ Kesalahan Upload:", error);
                alert("Upload gambar gagal: " + error.message);
                return null;
            }
            const { data: publicUrlData } = supabaseClient.storage.from(bucket).getPublicUrl(fileName);
            console.log("✅ Upload berhasil. URL:", publicUrlData.publicUrl);
            return publicUrlData.publicUrl;
        }

        window.clearInputs = function(ids) {
            ids.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    if (el.type === 'file') {
                        el.value = null; 
                    } else {
                        el.value = '';
                    }
                }
            });
        }

        window.updateAboutMe = async function() {
            const title = document.getElementById('judul-about').value.trim();
            const description = document.getElementById('deskripsi-about').value.trim();
            const fileInput = document.getElementById('gambar-about-file');
            const file = fileInput.files[0];

            if (!file) return alert("Pilih gambar untuk About Me!");
            if (!title || !description) return alert("Isi Judul dan Deskripsi About Me!");


            const image_url = await uploadImage(BUCKETS.ABOUT, file);
            if (!image_url) return; 

            const { error } = await supabaseClient
                .from('about_me')
                .upsert({ id: 1, title, description, image_url }, { onConflict: 'id' }); 

            if (error) {
                console.error("Supabase error (About Me):", error);
                return alert("Gagal update About Me: " + error.message);
            }

            alert("✅ About Me berhasil diperbarui!");
            clearInputs(['judul-about', 'deskripsi-about', 'gambar-about-file']);
        }

        window.tambahProject = async function() {
            const title = document.getElementById('judul-project').value.trim();
            const description = document.getElementById('deskripsi-project').value.trim();
            const fileInput = document.getElementById('gambar-project-file');
            const file = fileInput.files[0];
            const link = document.getElementById('link-project').value.trim();

            if (!title || !description || !file) return alert("Isi Judul, Deskripsi, dan Gambar Project!");

            const image_url = await uploadImage(BUCKETS.PROJECT, file);
            if (!image_url && file) return; 
            const { error } = await supabaseClient
                .from('projects')
                .insert({ title, description, image_url: image_url, link: link || null }); 

            if (error) {
                console.error("Supabase error (Project):", error);
                return alert("Gagal tambah project: " + error.message);
            }

            alert("✅ Project berhasil ditambahkan!");
            clearInputs(['judul-project', 'deskripsi-project', 'gambar-project-file', 'link-project']);
        }

        window.tambahExperience = async function() {
            const title = document.getElementById('judul-exp').value.trim();
            const description = document.getElementById('deskripsi-exp').value.trim();
            const fileInput = document.getElementById('gambar-exp-file');
            const file = fileInput.files[0]; 

            if (!title || !description) return alert("Isi Judul dan Deskripsi Pengalaman!");

            let image_url = null;
            if (file) {
                image_url = await uploadImage(BUCKETS.EXPERIENCE, file);
                if (!image_url) return; 
            }

            const { error } = await supabaseClient
                .from('experience')
                .insert({ title, description, image_url: image_url });

            if (error) {
                console.error("Supabase error (Experience):", error);
                return alert("Gagal tambah pengalaman: " + error.message);
            }

            alert("✅ Pengalaman berhasil ditambahkan!");
            clearInputs(['judul-exp', 'deskripsi-exp', 'gambar-exp-file']);
        }

        window.tambahActivity = async function() {
            const title = document.getElementById('judul-activity').value.trim();
            const description = document.getElementById('deskripsi-activity').value.trim();
            const fileInput = document.getElementById('gambar-activity-file');
            const file = fileInput.files[0];

            if (!title || !description || !file) return alert("Isi Judul, Deskripsi, dan Gambar Aktivitas!");

            const image_url = await uploadImage(BUCKETS.ACTIVITY, file);
            if (!image_url) return;

            const { error } = await supabaseClient
                .from('activity')
                .insert({ title, description, image_url: image_url });

            if (error) {
                 console.error("Supabase error (Activity):", error);
                return alert("Gagal tambah aktivitas: " + error.message);
            }

            alert("✅ Aktivitas berhasil ditambahkan!");
            clearInputs(['judul-activity', 'deskripsi-activity', 'gambar-activity-file']);
        }

        window.tambahArticle = async function() {
            const title = document.getElementById('judul-article').value.trim();
            const description = document.getElementById('deskripsi-article').value.trim();
            const fileInput = document.getElementById('gambar-article-file');
            const file = fileInput.files[0];
            const link = document.getElementById('link-article').value.trim();

             if (!title || !description || !file || !link) return alert("Isi Judul, Deskripsi, Gambar, dan Link Artikel!");

             try {
                 new URL(link);
             } catch (_) {
                 return alert("Format Link Artikel tidak valid. Pastikan menggunakan http:// atau https://");
             }

            const image_url = await uploadImage(BUCKETS.ARTICLE, file);
            if (!image_url) return;

            const { error } = await supabaseClient
                .from('articles')
                .insert({ title, description, image_url: image_url, link });

            if (error) {
                console.error("Supabase error (Article):", error);
                return alert("Gagal tambah artikel: " + error.message);
            }

            alert("✅ Artikel berhasil ditambahkan!");
            clearInputs(['judul-article', 'deskripsi-article', 'gambar-article-file', 'link-article']);
        }

    }); 