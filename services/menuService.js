// menuService.js
// File ini berisi fungsi-fungsi untuk berinteraksi dengan tabel 'menu_items' di Supabase.

// Impor objek supabase dari file konfigurasi
import { supabase } from 'services/supabaseConfig.js./supabaseConfig.js'; // Pastikan path ini benar relatif terhadap menuService.js

// --- Fungsi Manajemen Item Menu ---

/**
 * Mengambil semua item menu dari tabel 'menu_items'.
 * Data akan diurutkan berdasarkan kolom 'order' secara ascending.
 * @returns {Promise<Array>} - Array objek item menu atau array kosong jika terjadi error.
 */
async function getMenuItems() {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('order', { ascending: true }); // Mengurutkan berdasarkan kolom 'order'

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saat mengambil item menu:', error.message);
    return [];
  }
}

/**
 * Menambahkan item menu baru ke tabel 'menu_items'.
 * @param {Object} item - Objek item menu dengan properti 'name', 'url', dan 'order'.
 * @returns {Promise<Object|null>} - Objek item menu yang baru ditambahkan atau null jika terjadi error.
 */
async function addMenuItem(item) {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .insert([item])
      .select(); // Mengembalikan data yang baru ditambahkan

    if (error) throw error;
    console.log('Item menu berhasil ditambahkan:', data[0]);
    return data[0]; // Mengembalikan objek pertama dari array data yang dikembalikan
  } catch (error) {
    console.error('Error saat menambahkan item menu:', error.message);
    return null;
  }
}

/**
 * Memperbarui item menu yang sudah ada di tabel 'menu_items'.
 * @param {string} id - ID unik dari item menu yang akan diperbarui.
 * @param {Object} updates - Objek yang berisi properti yang akan diperbarui (misal: { name: 'Nama Baru', url: '/url-baru' }).
 * @returns {Promise<Object|null>} - Objek item menu yang diperbarui atau null jika terjadi error.
 */
async function updateMenuItem(id, updates) {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .update(updates)
      .eq('id', id) // Mencari baris berdasarkan ID
      .select(); // Mengembalikan data yang sudah diperbarui

    if (error) throw error;
    console.log('Item menu berhasil diperbarui:', data[0]);
    return data[0];
  } catch (error) {
    console.error('Error saat memperbarui item menu:', error.message);
    return null;
  }
}

/**
 * Menghapus item menu dari tabel 'menu_items'.
 * @param {string} id - ID unik dari item menu yang akan dihapus.
 * @returns {Promise<boolean>} - True jika berhasil dihapus, false jika terjadi error.
*/
async function deleteMenuItem(id) {
  try {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id); // Mencari baris berdasarkan ID dan menghapusnya

    if (error) throw error;
    console.log('Item menu berhasil dihapus.');
    return true;
  } catch (error) {
    console.error('Error saat menghapus item menu:', error.message);
    return false;
  }
}

// Ekspor semua fungsi manajemen menu agar bisa digunakan di file lain
export {
  getMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem
};
