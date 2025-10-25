    const hamburger = document.getElementById("hamburger");
    const sidebar = document.getElementById("sidebar");
    const closeSidebar = document.getElementById("closeSidebar");

    hamburger.addEventListener("click", () => {
      sidebar.classList.remove("-translate-x-full");
    });

    closeSidebar.addEventListener("click", () => {
      sidebar.classList.add("-translate-x-full");
    });

    document.addEventListener('click', (e) => {
      if (window.innerWidth < 768 && !sidebar.contains(e.target)) {
        if (e.target !== hamburger) {
          sidebar.classList.add("-translate-x-full");
        }
      }
    });
 
    const supabaseUrl = 'https://owqdtbzhnxbxdsjrlzsa.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93cWR0YnpobnhieGRzanJsenNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NzA1MjMsImV4cCI6MjA2NjQ0NjUyM30.cNmvpc_pBV89o9GHMU2CL0bSdgkdavAZuxB_w0Gv4gA';
    const supabase = supabase.createClient(supabaseUrl, supabaseKey);

    async function checkSession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        const email = session?.user?.email;
        if (!session || email !== "grayesi.silitonga@gmail.com") {
          alert("Akses ditolak. Silakan login kembali.");
          window.location.href = "login.html";
        } else {
          loadDashboardData();
        }
      } catch (err) {
        console.error("Error checking session:", err);
        alert("Terjadi kesalahan saat verifikasi login.");
        window.location.href = "login.html";
      }
    }

    checkSession();

    async function logout() {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          alert('Gagal logout: ' + error.message);
        } else {
          window.location.href = "login.html";
        }
      } catch (e) {
        console.error("Logout error:", e);
        alert("Terjadi kesalahan saat logout.");
      }
    }

    async function loadDashboardData() {
      try {
        const { count: contentCount, error: contentError } = await supabase
          .from('your_content_table')
          .select('*', { count: 'exact', head: true });
        
        if (contentError) throw contentError;
        
        document.getElementById('totalContent').textContent = contentCount || 0;

        const { data: messages, error: messagesError } = await supabase
          .from('contact_messages')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (messagesError) throw messagesError;
        
        const messagesContainer = document.getElementById('recentMessages');
        if (messages && messages.length > 0) {
          messagesContainer.innerHTML = '';
          messages.forEach(msg => {
            const messageDate = new Date(msg.created_at).toLocaleString('id-ID');
            messagesContainer.innerHTML += `
              <div class="border-b pb-4 last:border-0 last:pb-0">
                <div class="flex justify-between items-start">
                  <h3 class="font-medium">${msg.name} &lt;${msg.email}&gt;</h3>
                  <span class="text-sm text-gray-500">${messageDate}</span>
                </div>
                <p class="text-gray-600 mt-1 line-clamp-2">${msg.message}</p>
              </div>
            `;
          });
        } else {
          messagesContainer.innerHTML = '<p class="text-gray-500">Belum ada pesan</p>';
        }

        const { count: newMessagesCount, error: countError } = await supabase
          .from('contact_messages')
          .select('*', { count: 'exact', head: true })
          .gt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
        
        if (countError) throw countError;
        
        document.getElementById('newMessages').textContent = newMessagesCount || 0;

      } catch (error) {
        console.error("Error loading dashboard data:", error);
        alert("Terjadi kesalahan saat memuat data dashboard.");
      }
    }