// Membungkus semua kode di dalam DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {

  // --- Bagian Sidebar Toggle ---
  const hamburger = document.getElementById("hamburger");
  const sidebar = document.getElementById("sidebar");
  const closeSidebar = document.getElementById("closeSidebar");

  if (hamburger) {
    hamburger.addEventListener("click", () => {
      sidebar.classList.remove("-translate-x-full");
    });
  }

  if (closeSidebar) {
    closeSidebar.addEventListener("click", () => {
      sidebar.classList.add("-translate-x-full");
    });
  }

  // Menutup sidebar jika klik di luar area
  document.addEventListener('click', (e) => {
    if (window.innerWidth < 768) {
      if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
        sidebar.classList.add("-translate-x-full");
      }
    }
  });

  // --- Listener untuk tombol Logout ---
  const logoutButton = document.getElementById('logout-link');
  if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
      e.preventDefault(); // Mencegah link pindah halaman
      logout(); 
    });
  }


  // --- Bagian Supabase ---
  const supabaseUrl = 'https://owqdtbzhnxbxdsjrlzsa.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93cWR0YnpobnhieGRzanJsenNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NzA1MjMsImV4cCI6MjA2NjQ0NjUyM30.cNmvpc_pBV89o9GHMU2CL0bSdgkdavAZuxB_w0Gv4gA';
  
  // Ambil createClient dari 'supabase' global (dari CDN)
  const { createClient } = supabase;
  // Buat instance client Anda
  const supabaseClient = createClient(supabaseUrl, supabaseKey);

  async function checkSession() {
    try {
      const { data: { session }, error } = await supabaseClient.auth.getSession();
      
      if (error) throw error;
      
      const email = session?.user?.email;
      
      // ----------------------------------------------------
      // PERHATIKAN: Pastikan email ini sudah benar
      // ----------------------------------------------------
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

  // Panggil checkSession setelah DOM siap
  checkSession();

  async function logout() {
    try {
      const { error } = await supabaseClient.auth.signOut();
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
      
      // -----------------------------------------------------------------
      // 🚨 PENTING: GANTI 'your_content_table' DENGAN NAMA TABEL ANDA!
      // -----------------------------------------------------------------
      const { count: contentCount, error: contentError } = await supabaseClient
        .from('your_content_table') // <-- GANTI NAMA INI
        .select('*', { count: 'exact', head: true });
      
      if (contentError) throw contentError;
      document.getElementById('totalContent').textContent = contentCount || 0;

      // Pastikan nama tabel ini 'contact_messages'
      const { data: messages, error: messagesError } = await supabaseClient
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

      // Hitung pesan baru (misal 7 hari terakhir)
      const { count: newMessagesCount, error: countError } = await supabaseClient
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .gt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      
      if (countError) throw countError;
      
      document.getElementById('newMessages').textContent = newMessagesCount || 0;

    } catch (error) {
      // Ini akan memberitahu Anda di Console jika nama tabel salah
      console.error("Error loading dashboard data:", error); 
      alert("Terjadi kesalahan saat memuat data dashboard. Cek Console (F12).");
    }
  }

// Menutup 'DOMContentLoaded'
});