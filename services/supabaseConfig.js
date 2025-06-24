// supabaseConfig.js
// File ini berisi inisialisasi klien Supabase dan fungsi-fungsi terkait otentikasi.

// Impor fungsi createClient dari Supabase JS CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// !!! PENTING: Ganti dengan Project URL dan Anon Key Supabase Anda yang sebenarnya !!!
// Anda bisa mendapatkan ini dari Supabase Dashboard -> Project Settings -> API
const SUPABASE_URL = 'https://gxzqjwfnqwbjprsuugrb.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4enFqd2ZucXdianByc3V1Z3JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NTI1NjYsImV4cCI6MjA2NjMyODU2Nn0.lbkRMytn73nKYbg5GeIVOh7wi1Z_cQ2Qh4QIkxLLdhs';

// Inisialisasi klien Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Fungsi Otentikasi Admin ---

/**
 * Mendaftarkan pengguna baru sebagai admin.
 * Fungsi ini sebaiknya hanya digunakan sekali untuk membuat admin pertama,
 * dan kemudian dihapus atau dinonaktifkan di lingkungan produksi untuk keamanan.
 * @param {string} email - Email pengguna.
 * @param {string} password - Kata sandi pengguna.
 * @returns {Promise<Object>} - Objek yang berisi data user atau error.
 */
async function signUpAdmin(email, password) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    if (error) throw error;
    console.log('Pendaftaran berhasil:', data.user);
    return { user: data.user, error: null };
  } catch (error) {
    console.error('Error saat pendaftaran:', error.message);
    return { user: null, error: error };
  }
}

/**
 * Melakukan login admin menggunakan email dan kata sandi.
 * @param {string} email - Email admin.
 * @param {string} password - Kata sandi admin.
 * @returns {Promise<Object>} - Objek yang berisi data user atau error.
 */
async function signInAdmin(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) throw error;
    console.log('Login berhasil:', data.user);
    return { user: data.user, error: null };
  } catch (error) {
    console.error('Error saat login:', error.message);
    return { user: null, error: error };
  }
}

/**
 * Melakukan logout admin.
 * @returns {Promise<Object>} - Objek yang berisi error (jika ada).
 */
async function signOutAdmin() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    console.log('Logout berhasil.');
    return { error: null };
  } catch (error) {
    console.error('Error saat logout:', error.message);
    return { error: error };
  }
}

/**
 * Mendapatkan sesi pengguna yang sedang aktif.
 * Berguna untuk memeriksa apakah pengguna sedang login dan mendapatkan informasi sesi.
 * @returns {Promise<Object|null>} - Objek sesi atau null jika tidak ada sesi.
 */
async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Error saat mendapatkan sesi:', error.message);
    return null;
  }
}

/**
 * Mendengarkan perubahan status otentikasi (login, logout, dll.).
 * @param {function} callback - Fungsi callback yang akan dipanggil saat status otentikasi berubah.
 * @returns {Object} - Objek langganan yang bisa digunakan untuk berhenti mendengarkan (`unsubscribe`).
 */
function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

// Ekspor semua fungsi dan objek Supabase agar bisa digunakan di file lain
export {
  supabase,
  signUpAdmin,
  signInAdmin,
  signOutAdmin,
  getSession,
  onAuthStateChange
};
