 document.addEventListener('DOMContentLoaded', () => {

        const sidebar = document.getElementById('sidebar');
        const openBtn = document.getElementById('hamburger-open');
        const closeBtn = document.getElementById('sidebar-close');
        const overlay = document.getElementById('sidebar-overlay');
        const mainContent = document.getElementById('mainContent');

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

        document.querySelectorAll('.sidebar-nav a').forEach(link => {
             link.addEventListener('click', (e) => {
                 if(link.id === 'logoutLink') return;
                 if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
                     closeSidebar();
                 }
             });
        });

        /* --- LOGIKA DASHBOARD --- */
        const SUPABASE_URL = 'https://owqdtbzhnxbxdsjrlzsa.supabase.co';
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93cWR0YnpobnhieGRzanJsenNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NzA1MjMsImV4cCI6MjA2NjQ0NjUyM30.cNmvpc_pBV89o9GHMU2CL0bSdgkdavAZuxB_w0Gv4gA';
        const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

        async function checkAdmin() {
            try {
                 const { data: { session } } = await supabaseClient.auth.getSession();
                 if (!session || session.user.email !== "grayesi.silitonga@gmail.com") {
                     showNotification('error', "❌ Akses ditolak. Login sebagai admin.");
                     setTimeout(() => window.location.href = "login.html", 2000);
                 } else {
                     console.log("✅ Admin logged in:", session.user.email);
                     loadDashboardData(); // Muat data jika admin
                 }
            } catch (err) {
                 console.error("Error checking session:", err);
                 showNotification('error', "Terjadi kesalahan saat cek sesi.");
                 setTimeout(() => window.location.href = "login.html", 2000);
            }
        }

        const logoutButton = document.getElementById('logoutLink');
        if (logoutButton) {
            logoutButton.addEventListener('click', async (e) => {
                e.preventDefault();
                 const { error } = await supabaseClient.auth.signOut();
                 if (error) {
                     showNotification('error', 'Gagal logout: ' + error.message);
                 } else {
                     showNotification('success', 'Berhasil logout...');
                     setTimeout(() => window.location.href = "login.html", 1500);
                 }
            });
        }

        async function loadDashboardData() {
            // Muat Total Konten (gabungan dari semua tabel)
            loadTotalContent();
            // Muat Jumlah Pesan Baru
            loadNewMessagesCount();
            // Muat Pesan Terbaru
            loadRecentMessages();
        }

        async function loadTotalContent() {
             const contentTables = ['projects', 'experience', 'activity', 'articles']; // Tambahkan tabel lain jika ada
             let totalCount = 0;
             let errorOccurred = false;
             const totalContentEl = document.getElementById('totalContent');

             try {
                 for (const table of contentTables) {
                     // Kita hanya perlu count, head: true lebih efisien
                     const { count, error } = await supabaseClient
                         .from(table)
                         .select('*', { count: 'exact', head: true });

                     if (error) {
                         console.warn(`Warning: Could not count table ${table}:`, error.message);
                         // Anda bisa memilih untuk melanjutkan atau berhenti jika satu tabel error
                         // errorOccurred = true;
                         // break; // Uncomment jika ingin berhenti jika ada error
                     } else {
                         totalCount += count || 0;
                     }
                 }

                 if (errorOccurred) {
                      totalContentEl.textContent = 'Error';
                 } else {
                      totalContentEl.textContent = totalCount;
                 }

             } catch (err) {
                 console.error("Error calculating total content:", err);
                 totalContentEl.textContent = 'Error';
             }
        }

        async function loadNewMessagesCount() {

     const newMessagesEl = document.getElementById('newMessages');

     try {

         // Hitung SEMUA pesan

         const { count, error } = await supabaseClient

             .from('contact_messages')

             .select('*', { count: 'exact', head: true }); // <-- Hapus filter tanggal .gt(...)



         if (error) throw error;

         newMessagesEl.textContent = count || 0;



     } catch (error) {

         console.error("Error loading total messages count:", error);

         newMessagesEl.textContent = 'Error';

     }

 }
         async function loadRecentMessages() {
            const container = document.getElementById('recentMessages');
             container.innerHTML = '<div class="loading-messages">Memuat pesan terbaru...</div>'; // Tampilkan loading

             try {
                 const { data, error } = await supabaseClient
                     .from('contact_messages')
                     .select('id, name, created_at, message') // Pilih kolom yang dibutuhkan
                     .order('created_at', { ascending: false })
                     .limit(3); // Ambil 3 terbaru

                 if (error) throw error;

                 if (!data || data.length === 0) {
                     container.innerHTML = '<p class="empty-msg">Tidak ada pesan terbaru.</p>';
                     return;
                 }

                 container.innerHTML = ''; // Kosongkan
                 data.forEach(msg => {
                     const msgDate = new Date(msg.created_at);
                     const formattedDate = msgDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                     const msgItem = document.createElement('div');
                     msgItem.className = 'message-item-dash';
                     msgItem.innerHTML = `
                         <div class="message-meta-dash">
                             <h4>${sanitizeInput(msg.name)}</h4>
                             <span>${formattedDate}</span>
                         </div>
                         <p class="message-body-dash">${sanitizeInput(msg.message)}</p>
                     `;
                     container.appendChild(msgItem);
                 });

             } catch (error) {
                 console.error("Error loading recent messages:", error);
                 container.innerHTML = '<p class="empty-msg" style="color: var(--error-color);">Gagal memuat pesan.</p>';
             }
         }

        function sanitizeInput(str) {
             if (!str) return '';
             const temp = document.createElement('div');
             temp.textContent = str;
             return temp.innerHTML;
        }

        function showNotification(type, message) {
            const notification = document.createElement('div');
            notification.style.position = 'fixed';
            notification.style.bottom = '20px';
            notification.style.left = '50%';
            notification.style.transform = 'translateX(-50%)';
            notification.style.padding = '10px 20px';
            notification.style.borderRadius = '5px';
            notification.style.color = 'white';
            notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
            notification.style.zIndex = '2000';
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s ease';
            notification.style.display = 'flex';
            notification.style.alignItems = 'center';
            notification.style.gap = '10px';
            notification.style.background = (type === 'success') ? 'var(--success-color)' : 'var(--error-color)';
            notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i><span>${message}</span>`;
            document.body.appendChild(notification);
            setTimeout(() => notification.style.opacity = '1', 50);
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }

        // Initialize
        checkAdmin(); // Mulai dengan cek admin

    });