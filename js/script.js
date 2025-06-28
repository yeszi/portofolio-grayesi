// =========================================================
// Konfigurasi Supabase
// GANTI DENGAN KUNCI DAN URL SUPABASE ANDA!
// =========================================================
const SUPABASE_URL = 'https://owqdtbzhnxbxdsjrlzsa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93cWR0YnpobnhieGRzanJsenNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NzA1MjMsImV4cCI6MjA2NjQ0NjUyM30.cNmvpc_pBV89o9GHMU2CL0bSdgkdavAZuxB_w0Gv4gA';

const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    console.log("Script index.js dimuat!"); // Pesan pertama

    try {
        const { data, error } = await supabase
            .from('projects') // Ganti dengan nama tabel yang PASTI ada datanya
            .select('*');

        if (error) {
            console.error('ERROR DARI SUPABASE:', error); // Log error lengkap
            alert('Gagal mengambil data: ' + error.message);
        } else {
            console.log('DATA DARI SUPABASE BERHASIL:', data); // Log data lengkap
            alert('Data berhasil diambil! Jumlah item: ' + data.length);
        }
    } catch (e) {
        console.error('ERROR SAAT MENJALANKAN KODE:', e); // Log error JavaScript
        alert('Terjadi kesalahan JavaScript: ' + e.message);
    }
});

// Anda bisa hapus semua kode UI/Swiper/ScrollReveal lainnya untuk sementara
// agar fokus hanya pada koneksi Supabase