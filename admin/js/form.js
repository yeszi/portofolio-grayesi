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
                     fetchContactMessages(); 
                 }
            } catch (err) {
                 console.error("Error checking session:", err);
                 showNotification('error', "Terjadi kesalahan saat cek sesi.");
                 setTimeout(() => window.location.href = "login.html", 2000);
            }
        }

        // Logout handler
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

        window.deleteMessage = async function(id) {
            if (!confirm("Anda yakin ingin menghapus pesan ini?")) return;
            const { error } = await supabaseClient
                .from('contact_messages')
                .delete()
                .eq('id', id);

            if (error) {
                 showNotification('error', 'Gagal menghapus pesan: ' + error.message);
                 console.error("Delete error:", error);
            } else {
                 showNotification('success', '🗑️ Pesan berhasil dihapus!');

                 const itemToRemove = document.getElementById(`msg-${id}`);
                 if (itemToRemove) itemToRemove.remove();
            }
        }

        async function fetchContactMessages() {
            const container = document.getElementById('contact-messages');
            const loadingState = document.getElementById('loading-state');

            if (!container.querySelector('.message-item')) {
                 if(loadingState) loadingState.style.display = ''; 
                 else container.innerHTML = '<div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>Memuat pesan...</p></div>';
            }


            const { data, error } = await supabaseClient
                .from('contact_messages')
                .select('*')
                .order('created_at', { ascending: false });

             if(loadingState) loadingState.style.display = 'none';

            if (error) {
                 console.error("Fetch error:", error);
                 container.innerHTML = `
                     <div class="empty-state">
                         <i class="fas fa-exclamation-triangle"></i>
                         <p>Gagal memuat pesan. Coba refresh halaman.</p>
                     </div>
                 `;
                 return;
            }

            if (!data || data.length === 0) {
                 container.innerHTML = `
                     <div class="empty-state">
                         <i class="far fa-folder-open"></i>
                         <p>Belum ada pesan masuk.</p>
                     </div>
                 `;
                 return;
            }

            container.innerHTML = ''; 
            data.forEach(msg => {
                 const msgDate = new Date(msg.created_at);
                 const formattedDate = msgDate.toLocaleString('id-ID', {
                     day: 'numeric', month: 'long', year: 'numeric',
                     hour: '2-digit', minute: '2-digit'
                 });

                 const msgBox = document.createElement('div');
                 msgBox.classList.add('message-item');
                 msgBox.id = `msg-${msg.id}`; 
                 msgBox.innerHTML = `
                     <p><strong>Nama:</strong> ${sanitizeInput(msg.name)}</p>
                     <p><strong>Email:</strong> ${sanitizeInput(msg.email)}</p>
                     <p><strong>Pesan:</strong><br>${sanitizeInput(msg.message).replace(/\n/g, '<br>')}</p>
                     <div class="message-meta">
                         <span><i class="far fa-clock"></i> ${formattedDate}</span>
                         <button class="btn-delete" onclick="deleteMessage('${msg.id}')">
                             <i class="fas fa-trash"></i> Hapus
                         </button>
                     </div>
                 `;
                 container.appendChild(msgBox);
            });
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
            notification.innerHTML = `
                 <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                 <span>${message}</span>
            `;

            document.body.appendChild(notification);

            setTimeout(() => notification.style.opacity = '1', 50);

            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }

        supabaseClient
            .channel('realtime_contact_messages')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, payload => {
                 console.log("📩 Perubahan Realtime Pesan:", payload);
                 showNotification('success', 'Ada pesan baru atau perubahan!');
                 fetchContactMessages(); 
            })
            .subscribe((status) => {
                 if (status === 'SUBSCRIBED') {
                     console.log('👂 Berhasil subscribe ke perubahan pesan.');
                 } else {
                     console.warn('⚠️ Gagal subscribe atau status:', status);
                 }
             });

        checkAdmin(); 

    }); 