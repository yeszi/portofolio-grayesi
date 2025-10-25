// MEMBUNGKUS SEMUA KODE AGAR AMAN
document.addEventListener('DOMContentLoaded', () => {

  // --- 1. LOGIKA SIDEBAR & LOGOUT (DIAMBIL DARI DASHBOARD) ---

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

  document.addEventListener('click', (e) => {
    if (window.innerWidth < 768) {
      if (sidebar && !sidebar.contains(e.target) && hamburger && !hamburger.contains(e.target)) {
        sidebar.classList.add("-translate-x-full");
      }
    }
  });

  const logoutButton = document.getElementById('logout-link');
  if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }

  // --- 2. LOGIKA ASLI HALAMAN EDIT ANDA (DENGAN PERBAIKAN) ---

  // Konfigurasi Supabase
  const SUPABASE_URL = 'https://owqdtbzhnxbxdsjrlzsa.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIZVMiOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93cWR0YnpobnhieGRzanJsenNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NzA1MjMsImV4cCI6MjA2NjQ0NjUyM30.cNmvpc_pBV89o9GHMU2CL0bSdgkdavAZuxB_w0Gv4gA';
  const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  // Fungsi sanitasi (ini sudah bagus)
  function sanitizeInput(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Modal functions
  const closeModalBtn = document.getElementById('closeModal');
  const modal = document.getElementById('imageModal');
  const contentSections = document.getElementById('content-sections');
  
  function openModal(imageUrl) {
    const modalImg = document.getElementById('modalImage');
    modalImg.src = imageUrl;
    modal.classList.remove('hidden');
    modal.classList.add('flex'); // Menggunakan flex untuk centering
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
  }

  if(closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Otentikasi
  checkAuth();

  // Render sections
  const menus = [
    { table: 'about_me', title: 'About Me', bucket: 'aboutimages', isSingular: true },
    { table: 'projects', title: 'Projects', bucket: 'projectimages' },
    { table: 'experience', title: 'Experience', bucket: 'experienceimages' },
    { table: 'activity', title: 'My Activity', bucket: 'activityimages' },
    { table: 'articles', title: 'My Articles', bucket: 'articleimages' }
  ];

  // Kosongkan wrapper sebelum me-render
  if (contentSections) {
    contentSections.innerHTML = '';
    menus.forEach(menu => renderSection(menu));
  }
  

  async function checkAuth() {
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session || !session.user || session.user.email !== "grayesi.silitonga@gmail.com") {
        alert("Akses ditolak. Silakan login kembali.");
        window.location.href = "login.html";
      }
    } catch (err) {
      console.error("Error fetching session:", err);
      alert("Terjadi kesalahan saat memverifikasi sesi.");
      window.location.href = "login.html";
    }
  }

  async function logout() {
    try {
      const { error } = await supabaseClient.auth.signOut();
      if (error) throw error;
      window.location.href = "login.html";
    } catch (error) {
      console.error('Logout error:', error.message);
      alert('Gagal logout: ' + error.message);
    }
  }

  function renderSection({ table, title, bucket, isSingular = false }) {
    const section = document.createElement('section');
    // Menerapkan style Tailwind ke section
    section.className = "bg-white rounded-lg shadow-md p-6";
    section.innerHTML = `
        <h2 class="text-xl font-bold text-gray-800 mb-4">${sanitizeInput(title)}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="list-${table}">
          <p class="text-gray-500">Loading...</p>
        </div>
    `;
    if(contentSections) contentSections.appendChild(section);
    fetchData(table, bucket, isSingular);

    // Realtime subscription
    supabaseClient.channel(`realtime_${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        fetchData(table, bucket, isSingular);
      })
      .subscribe();
  }

  async function fetchData(table, bucket, isSingular) {
    try {
      const { data, error } = await supabaseClient.from(table).select('*');
      const container = document.getElementById(`list-${table}`);
      
      if (error) throw error;
      if (!container) return;

      container.innerHTML = '';
      const displayData = isSingular && data.length > 0 ? [data[0]] : data;
      
      if (displayData.length === 0) {
        container.innerHTML = '<p class="text-gray-500 col-span-full text-center">Tidak ada item ditemukan.</p>';
        return;
      }
      
      displayData.forEach(item => {
        const div = document.createElement('div');
        // Menerapkan style Tailwind ke card item
        div.className = 'bg-gray-50 rounded-lg shadow p-4 flex flex-col transition hover:shadow-lg';
        const hasLink = table === 'projects';
        
        const thumbnail = item.image_url 
          ? `<img src="${sanitizeInput(item.image_url)}" class="w-20 h-20 object-cover rounded-md mr-4 flex-shrink-0 cursor-pointer item-thumbnail" alt="${sanitizeInput(item.title || 'Thumbnail')}">`
          : `<div class="w-20 h-20 rounded-md bg-gray-200 flex items-center justify-center text-gray-500 text-xs text-center flex-shrink-0">No Image</div>`;
        
        const linkDisplay = hasLink && item.link 
          ? `<a href="${sanitizeInput(item.link)}" target="_blank" class="text-blue-600 hover:underline text-sm break-all">${sanitizeInput(item.link)}</a>`
          : '';
        
        div.innerHTML = `
            <div class="flex items-start mb-3">
              ${thumbnail}
              <div class="flex-1 min-w-0">
                <h3 class="font-bold text-gray-900 truncate">${sanitizeInput(item.title || 'No Title')}</h3>
                ${linkDisplay}
              </div>
            </div>
            <p class="text-gray-600 text-sm mb-4 line-clamp-3">${sanitizeInput(item.description || 'No description available')}</p>
            
            <div class="mt-auto flex gap-3">
              <button class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2" 
                      data-action="edit" data-table="${table}" data-id="${item.id}" data-bucket="${bucket}" data-haslink="${hasLink}" data-issingular="${isSingular}">
                <i class="fas fa-edit"></i> Edit
              </button>
              ${!isSingular ? `
              <button class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2" 
                      data-action="delete" data-table="${table}" data-id="${item.id}" data-bucket="${bucket}" data-image="${item.image_url || ''}" data-issingular="${isSingular}">
                <i class="fas fa-trash-alt"></i> Delete
              </button>` : ''}
            </div>
        `;
        container.appendChild(div);
      });

      // Add event listeners to buttons
      container.querySelectorAll('[data-action="edit"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const { table, id, bucket, haslink, issingular } = btn.dataset;
          showEditForm(table, id, bucket, haslink === 'true', issingular === 'true');
        });
      });

      container.querySelectorAll('[data-action="delete"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const { table, id, bucket, image, issingular } = btn.dataset;
          deleteItem(table, id, bucket, image, issingular === 'true');
        });
      });

      // Add click handler for thumbnails
      container.querySelectorAll('.item-thumbnail').forEach(img => {
        img.addEventListener('click', () => openModal(img.src));
      });

    } catch (error) {
      console.error(`Error fetching ${table}:`, error);
      const container = document.getElementById(`list-${table}`);
      if (container) {
        container.innerHTML = '<p class="text-red-500 col-span-full">Error loading data.</p>';
      }
    }
  }

  async function showEditForm(table, id, bucket, hasLink, isSingular) {
    try {
      const { data, error } = await supabaseClient.from(table)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      const modal = document.createElement('div');
      // --- PERBAIKAN: MENGGUNAKAN STYLE TAILWIND UNTUK MODAL ---
      modal.className = 'fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4';
      modal.innerHTML = `
          <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <button class="absolute top-3 right-4 text-2xl text-gray-600 hover:text-gray-900" id="closeEditModal">&times;</button>
            <h2 class="text-xl font-bold text-gray-800 mb-4">Edit ${sanitizeInput(table)}</h2>
            
            <form id="editForm" class="space-y-4">
              <div class="form-group">
                <label for="edit-title" class="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                <input type="text" id="edit-title" value="${sanitizeInput(data.title || '')}" required
                       class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              </div>
              
              <div class="form-group">
                <label for="edit-desc" class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea id="edit-desc" required
                          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 h-32">${sanitizeInput(data.description || '')}</textarea>
              </div>
              
              ${hasLink ? `
              <div class="form-group">
                <label for="edit-link" class="block text-sm font-medium text-gray-700 mb-1">Link</label>
                <input type="url" id="edit-link" value="${sanitizeInput(data.link || '')}"
                       class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              </div>` : ''}
              
              <div class="form-group">
                <label for="edit-image" class="block text-sm font-medium text-gray-700 mb-1">Gambar (biarkan kosong jika tidak ingin mengubah)</label>
                <input type="file" id="edit-image" accept="image/*"
                       class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
                ${data.image_url ? `
                <div class="mt-3 flex items-center gap-3">
                  <span class="text-sm text-gray-600">Gambar saat ini:</span>
                  <img src="${sanitizeInput(data.image_url)}" class="w-20 h-20 object-cover rounded-md border border-gray-200 cursor-pointer" id="currentImagePreview">
                </div>` : ''}
              </div>
              
              <div class="flex justify-end gap-3 pt-4">
                <button type="button" class="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium" id="cancelEdit">
                  Batal
                </button>
                <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium flex items-center gap-2">
                  <i class="fas fa-save"></i> Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
      `;
      
      document.body.appendChild(modal);
      document.body.style.overflow = 'hidden';

      // Add event listeners
      modal.querySelector('#closeEditModal').addEventListener('click', () => {
        modal.remove();
        document.body.style.overflow = 'auto';
      });

      modal.querySelector('#cancelEdit').addEventListener('click', () => {
        modal.remove();
        document.body.style.overflow = 'auto';
      });

      const imgPreview = modal.querySelector('#currentImagePreview');
      if (imgPreview) {
          imgPreview.addEventListener('click', () => openModal(data.image_url));
      }

      modal.querySelector('#editForm').addEventListener('submit', (e) => {
        e.preventDefault();
        // --- PERBAIKAN BUG: Meneruskan 'isSingular' ---
        handleEdit(table, id, bucket, hasLink, isSingular, modal);
      });

    } catch (error) {
      console.error('Error showing edit form:', error);
      alert("Gagal mengambil data: " + error.message);
    }
  }

  async function uploadImage(bucket, file) {
    if (!file) return null;
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabaseClient.storage.from(bucket).upload(fileName, file);
    if (error) throw error;
    const { data: { publicUrl } } = supabaseClient.storage.from(bucket).getPublicUrl(fileName);
    return publicUrl;
  }

  async function deleteImage(bucket, imageUrl) {
    if (!imageUrl) return;
    try {
      const fileName = imageUrl.split('/').pop();
      const { error } = await supabaseClient.storage.from(bucket).remove([fileName]);
      if (error) console.error("Gagal hapus gambar lama:", error.message);
    } catch(e) {
      console.error("Error mem-parsing nama file gambar:", e);
    }
  }

  async function handleEdit(table, id, bucket, hasLink, isSingular, modal) {
    const submitButton = modal.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = 'Menyimpan...';

    try {
      const title = document.getElementById('edit-title').value.trim();
      const description = document.getElementById('edit-desc').value.trim();
      const fileInput = document.getElementById('edit-image');
      const file = fileInput.files[0];
      const link = hasLink ? document.getElementById('edit-link').value.trim() : null;
      
      if (!title || !description) {
        alert("Judul dan Deskripsi tidak boleh kosong!");
        return;
      }

      const { data: current, error: currentError } = await supabaseClient.from(table).select('image_url').eq('id', id).single();
      if (currentError) throw currentError;

      let imageUrl = current.image_url || null;
      if (file) {
        const newUrl = await uploadImage(bucket, file);
        if (imageUrl) await deleteImage(bucket, imageUrl);
        imageUrl = newUrl;
      }

      const update = { title, description };
      if (imageUrl) update.image_url = imageUrl;
      if (hasLink) update.link = link;

      const { error } = await supabaseClient.from(table).update(update).eq('id', id);
      if (error) throw error;

      alert("✅ Berhasil update!");
      modal.remove();
      document.body.style.overflow = 'auto';
      
      // --- PERBAIKAN BUG: Menggunakan 'isSingular' saat refresh data ---
      fetchData(table, bucket, isSingular);

    } catch (error) {
      console.error('Error handling edit:', error);
      alert("Gagal update: " + error.message);
    } finally {
      if(submitButton) { // Cek jika modal sudah di-remove
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-save"></i> Simpan Perubahan';
      }
    }
  }

  async function deleteItem(table, id, bucket, imageUrl, isSingular) {
    if (!confirm(`Yakin ingin menghapus dari ${table}?`)) return;
    try {
      if (imageUrl) await deleteImage(bucket, imageUrl);
      const { error } = await supabaseClient.from(table).delete().eq('id', id);
      if (error) throw error;
      alert("✅ Item berhasil dihapus!");
      
      // --- PERBAIKAN BUG: Menggunakan 'isSingular' saat refresh data ---
      fetchData(table, bucket, isSingular);

    } catch (error) {
      console.error('Error deleting item:', error);
      alert("Gagal hapus item: " + error.message);
    }
  }

}); // Penutup DOMContentLoaded