// Language management system
let currentLanguage = 'en';

// Language options configuration
export const LANG_OPTIONS = {
    'tr': { 
        code: 'TR', 
        name: 'Türkçe',
        templateName: 'Türkçe Şablonlar',
        optionName: 'Türkçe'
    },
    'en': { 
        code: 'US', 
        name: 'English',
        templateName: 'English Templates',
        optionName: 'English'
    }
};

// Get language options for current language
export function getLanguageOptionsForCurrentLang() {
    const currentLang = getCurrentLanguage();
    if (currentLang === 'tr') {
        return {
            tr: 'Türkçe',
            en: 'İngilizce',
            all: 'Tüm Diller',
            trTemplates: 'Türkçe Şablonlar',
            enTemplates: 'İngilizce Şablonlar',
            allTemplates: 'Tüm Şablonlar'
        };
    } else {
        return {
            tr: 'Turkish',
            en: 'English',
            all: 'All Languages',
            trTemplates: 'Turkish Templates',
            enTemplates: 'English Templates',
            allTemplates: 'All Templates'
        };
    }
}


// Translation data
const translations = {
    tr: {
        // Navigation
        'accounts-tab': '📧 Hesaplar',
        'contacts-tab': '👥 Kişiler',
        'templates-tab': '📜 Şablonlar',
        'send-tab': '🚀 Gönder',
'logs-tab': '📊 Loglar',
        'settings-tab': '⚙️ Ayarlar',
        
        // Accounts
        'accounts-title': '📧 E-posta Hesapları',
        'accounts-name-header': 'Ad',
        'accounts-email-header': 'E-posta',
        'accounts-smtp-header': 'SMTP Sunucusu',
        'accounts-port-header': 'Port',
        'accounts-actions-header': 'İşlemler',
        'add-account-btn': '📧 Yeni Hesap Ekle',
        'account-edit-title': 'Hesap Düzenle',
        'provider-label': 'E-posta Sağlayıcısı:',
        'select-provider-option': 'Seç',
        'gmail-option': 'Gmail',
        'yandex-option': 'Yandex',
        'yahoo-option': 'Yahoo',
        'custom-option': 'Özel',
        'account-name-label': 'Hesap Adı:',
        'account-email-label': 'E-posta:',
        'account-password-label': 'Şifre:',
        'account-smtp-label': 'SMTP Sunucusu:',
        'account-port-label': 'SMTP Portu:',
        'tls-label': 'TLS Kullan',
        'save-account-btn': '💾 Kaydet',
        'delete-account-btn': '🗑️ Sil',
        'cancel-account-btn': '❌ İptal',
        'continue-accounts-btn': '▶ Devam',
        'edit-account-btn': '✏️ Düzenle',
        
        // Settings
'settings-title': '⚙️ Uygulama Ayarları',
        'country-label': 'Ülke:',
        'timezone-label': 'Saat Dilimi:',
        'dateformat-label': 'Tarih/Saat Formatı:',
        'default-language-label': 'Varsayılan Dil:',
        'logs-language-label': 'Log Dili:',
        'save-settings-btn': '💾 Ayarları Kaydet',
        'reload-settings-btn': '🔄 Ayarları Yükle',
        'continue-settings-btn': '▶ Devam',
        
        // Data Management
'data-management-title': '📁 Veri Yönetimi',
        'data-location-label': 'Uygulama Veri Konumu:',
        'data-size-label': 'Veri Boyutu:',
        'refresh-data-btn': '🔄 Bilgileri Yenile',
        'export-data-btn': '📤 Verileri Dışa Aktar',
        'import-data-btn': '📥 Tüm Veriyi İçe Aktar',
        'import-templates-btn': '📝 Şablonları İçe Aktar',
        'import-accounts-btn': '👤 Hesapları İçe Aktar',
        'uninstall-app-btn': '😑️ Uygulamayı Kaldır',
        // Uninstall modal
        'uninstall-title': 'Uygulamayı Kaldır',
        'uninstall-warning': '⚠️ Bu işlem uygulama verilerinin tamamını kalıcı olarak silecektir!',
        'export-before-label': 'Kaldırmadan önce verileri dışa aktar',
        'export-path-label': 'Dışa Aktarma Konumu:',
        'confirm-uninstall-btn': 'Uygulamayı Kaldır',
        'cancel-uninstall-btn': 'İptal',
        'uninstall-results-title': 'Kaldırma Tamamlandı',
        'close-results-btn': 'Kapat',
'processing-text': 'İşleniyor...',
        'simulate-uninstall-label': 'SİMÜLASYON: Silmeden dene (dosyalar silinmez, uygulama kapanmaz)',
        'removed-files-title': 'Silinecek Dosyalar',
        'data-to-be-removed-title': 'Silinecek Veriler',
        'removed-files-heading': 'Silinen Dosyalar',
        'uninstall-confirm-title': 'Kaldırmayı Onayla',
        'uninstall-confirm-warning': 'Bu işlem TÜM uygulama verilerini KALICI OLARAK SİLECEKTİR!',
        'uninstall-export-message': 'Veriler buraya aktarılacak:',
        'uninstall-confirm-question': 'Kaldırmak istediğinizden kesinlikle emin misiniz?',
        'uninstall-confirm-yes': 'EVET, KALDIR',
        'uninstall-confirm-no': 'HAYIR, İPTAL',
        'app-closing-in': 'Uygulama kapanacak:',
        'seconds': 'saniye',
        'complete-uninstall-title': 'Tam Kaldırma Talimatları',
        'uninstall-success': '✅ Kaldırma işlemi başarıyla tamamlandı!',
        'uninstall-error': '❌ Kaldırma işlemi hatalarla tamamlandı.',
        'data-exported-to': '📦 Veriler dışa aktarıldı:',
        'errors-encountered': '⚠️ Karşılaşılan hatalar:',
        
        // Data Notifications
        'notif-data-refreshed': 'Veri bilgileri güncellendi',
        'notif-export-success': 'Veriler başarıyla dışa aktarıldı: {path}',
        'notif-export-failed': 'Dışa aktarma başarısız: {error}',
        'notif-import-success': 'Veriler başarıyla içe aktarıldı: {path}',
        'notif-import-failed': 'İçe aktarma başarısız: {error}',
        'notif-uninstall-complete': 'Kaldırma işlemi tamamlandı',
        'notif-uninstall-failed': 'Kaldırma başarısız: {error}',
        'notif-templates-imported': 'Şablonlar içe aktarıldı: {added} eklendi, {skipped} atlandı (tekrar)',
        'notif-templates-import-failed': 'Şablon içe aktarma başarısız: {error}',
        'notif-accounts-imported': 'Hesaplar içe aktarıldı: {added} eklendi, {skipped} atlandı (tekrar)',
        'notif-accounts-import-failed': 'Hesap içe aktarma başarısız: {error}',
        
        // Contacts
        'contacts-title': '👥 Kişiler',
        'data-source-label': 'Veri Kaynağı:',
        'select-source-option': 'Veri Kaynağı Seç',
        'sqlite-option': 'SQLite Veritabanı',
        'csv-option': 'CSV Dosyası',
        'excel-option': 'Excel Dosyası',
        'file-label': 'Dosya:',
        'select-file-btn': '📂 Dosya Seç',
        'table-sheet-label': 'Tablo/Sayfa:',
        'select-table-option': 'Tablo Seç',
        'email-column-label': 'E-posta Sütunu:',
        'select-email-column-option': 'E-posta Sütunu Seç',
        'back-contacts-btn': '⬅ Geri',
        'valid-emails-btn': '✅ Geçerli E-postalar',
        'invalid-records-btn': '❌ Geçersiz Kayıtlar',
        'continue-contacts-btn': '▶ Devam',
        'selected-count': 'seçili',
        'invalid-records-count': 'geçersiz kayıt',
        
        // Templates
        'templates-title': '📜 E-posta Şablonları',
        'template-name-header': 'Ad',
        'template-subject-header': 'Konu',
        'template-content-header': 'İçerik',
        'template-html-header': 'HTML',
        'template-language-header': 'Dil',
        'template-actions-header': 'İşlemler',
        'add-template-btn': '📝 Yeni Şablon Ekle',
        'template-add-title': '📝 Yeni Şablon Ekle',
        'template-edit-title': '✏️ Şablon Düzenle',
        'template-name-label': 'Şablon Adı:',
        'template-subject-label': 'Konu:',
        'template-content-label': 'İçerik:',
        'template-language-label': 'Şablon Dili:',
        'change-theme-template-btn': '🌙 Koyu Tema',
        'content-format-label': 'İçerik Formatı:',
        'html-format-label': '🌐 HTML',
        'text-format-label': '📝 Düz Metin',
        'preview-theme-label': 'Önizleme Teması:',
        'light-theme-label': '☀️ Açık Tema',
        'dark-theme-label': '🌙 Koyu Tema',
        'preview-label': 'Önizleme:',
        'fullscreen-template-btn': '🔍 Tam Ekran',
        'save-template-btn': '💾 Kaydet',
        'delete-template-btn': '🗑️ Sil',
        'cancel-template-btn': '❌ İptal',
        'continue-templates-btn': '▶ Devam',
        'edit-template-btn': '✏️ Düzenle',
        'template-language-all': 'Tüm Diller',
        'template-language-tr': 'Türkçe',
        'template-language-en': 'İngilizce',
        'templates-filter-all': 'Tüm Diller',
        'templates-filter-tr': 'Türkçe',
        'templates-filter-en': 'İngilizce',
        'template-filter-all': 'Tüm Diller',
        'template-filter-tr': 'Türkçe',
        'template-filter-en': 'İngilizce',
        
        // Send
        'send-title': '🚀 E-posta Gönder',
        'email-account-label': 'E-posta Hesabı:',
        'select-account-option': 'Hesap Seç',
        'template-select-label': 'Şablon:',
        'template-filter-label': 'Dil Filtresi:',
        'template-filter-all': 'Tüm Şablonlar',
        'template-filter-tr': 'Türkçe Şablonlar',
        'template-filter-en': 'İngilizce Şablonlar',
        'template-select-placeholder': 'Şablon seçin (isteğe bağlı)',
        'subject-label': 'Konu:',
        'content-label': 'İçerik:',
        'change-theme-send-btn': '🌙 Koyu Tema',
        'send-content-format-label': 'İçerik Formatı:',
        'send-html-format-label': '🌐 HTML',
        'send-text-format-label': '📝 Düz Metin',
        'send-theme-label': 'Gönderim Teması:',
        'send-light-theme-label': '☀️ Açık Tema',
        'send-dark-theme-label': '🌙 Koyu Tema',
        'cc-label': 'CC (İsteğe Bağlı):',
        'attachments-label': 'Ekler:',
        'select-file-send-btn': '📎 Dosya Seç',
        'clear-all-btn': '🗑️ Tümünü Temizle',
        'map-placeholders-btn': '🔗 Yer Tutucuları Eşle',
        'show-preview-btn': '👁️ Önizleme',
        'send-btn': '📤 Gönder',
        'send-preview-label': 'Önizleme:',
        'fullscreen-send-btn': '🔍 Tam Ekran',
        'status-text': 'Durum: Hazır',
        'status-sending': 'Durum: E-postalar gönderiliyor...',
        'status-completed': 'Durum: Gönderim tamamlandı',
        'placeholder-info': 'Yer tutucular {alan_adı} formatında olmalıdır',
        'theme-email-info': 'E-posta seçilen tema görünümüyle gönderilecektir',
        'no-placeholders-found': 'İçerikte yer tutucu bulunamadı',
        
        // Send Confirmation Modal
        'confirmation-title': 'E-postaları göndermek istediğinizden emin misiniz?',
        'yes-btn': 'Evet',
        'no-btn': 'Hayır',
        'send-from': 'Gönderen',
        'send-to-count': 'Alıcı Sayısı',
        'send-subject': 'Konu',
        'send-format': 'Format',
        'send-theme': 'Tema',
        'send-attachments': 'Ekler',
        'send-cc': 'CC',
        'send-html': 'HTML',
        'send-plain': 'Düz Metin',
        'send-dark': 'Koyu',
        'send-light': 'Açık',
        'send-files': 'dosya',
        'send-people': 'kişi',
        'send-none': 'Yok',
        
        // Sending Progress Modal
        'sending-title': '📧 E-posta Gönderimi',
        'sending-status': 'Durum',
        'sending-in-progress': '⏳ Gönderim devam ediyor...',
        'sending-completed': '✅ Gönderim tamamlandı!',
        'sending-failed': '❌ Gönderim başarısız!',
        'sending-partially': '⚠️ Kısmen başarılı',
        'sending-progress': 'İlerleme',
        'sending-details': 'Detaylar',
        'sending-successful': '✅ Başarılı',
        'sending-failed-count': '❌ Başarısız',
        'sending-current': '📨 Gönderiliyor',
        'sending-waiting': '⏰ Bekliyor',
        'sending-recipient': 'Alıcı',
        'sending-status-success': '✅ Gönderildi',
        'sending-status-failed': '❌ Hata',
        'sending-status-sending': '📤 Gönderiliyor...',
        'sending-close-btn': 'Kapat',
        'sending-stop-btn': 'Duraklat',
        'sending-pause-btn': 'Duraklat',
        'sending-resume-btn': 'Devam Ettir',
        'sending-cancel-btn': 'İptal',
        'sending-paused': '⏸️ Duraklatıldı',
        'sending-attachment-success': '📎 Ekler gönderildi',
        'sending-attachment-failed': '⚠️ Ek gönderilemedi',
        'sending-email-success': 'E-posta başarıyla gönderildi',
        'sending-email-failed': 'E-posta gönderilemedi',
        'sending-total': 'Toplam',
        'sending-elapsed': 'Geçen Süre',
        'sending-remaining': 'Kalan',
        'sending-speed': 'Hız',
        'sending-per-minute': 'e-posta/dakika',
        
        // Logs
        'logs-title': '📝 Loglar',
        'logs-main-title': '📊 Sistem Logları',
        'clear-logs-btn': '🗑️ Temizle',
        'scroll-bottom-btn': '⬇️ Alta Git',
        'selection-mode-btn': '🔘 Seçim Modunu Aç',
        'selection-mode-close-btn': '❌ Seçim Modunu Kapat',
        'delete-selected-btn': '🗑️ Seçilenleri Sil',
        'delete-all-logs-btn': '🗑️ Tümünü Sil',
        'refresh-logs-btn': '🔄 Yenile',
        'log-file-title': '📄 Log Dosyası',
        'back-logs-btn': '⬅️ Geri',
        'scroll-log-bottom-btn': '⬇️ Alta Git',
        'search-logs-btn': '🔍 Ara',
        'loading-text': 'Yükleniyor...',
        'log-content-cleared': 'Log içeriği temizlendi...',
        'search-no-results': 'için sonuç bulunamadı...',
        'log-load-error': 'Log dosyası yüklenemedi: ',
        'lines-label': 'satır',
        'lines-found': 'satır bulundu',
        'log-select-tooltip': 'Seç',
        'log-deselect-tooltip': 'Seçimi kaldır',
        'log-delete-tooltip': 'Bu log dosyasını sil',
'log-no-files-found': 'Hiç log dosyası bulunamadı',
        'notif-search-activated': 'Arama modu aktif',
        'notif-search-deactivated': 'Arama modu kapatıldı',
        'notif-selection-required': 'Önce seçim modunu açın',
        'notif-no-log-files': 'Silinecek log dosyası yok',
        'notif-no-selection': 'Silinecek log dosyası seçilmedi',
        'notif-selected-count': '{count} log dosyası seçildi',
        'notif-deleted-count': '{count} log dosyası silindi',
        'notif-delete-failed-count': '{count} log dosyası silinemedi',
        'selection-mode-activated': 'Seçim modu aktif',
        'selection-mode-deactivated': 'Seçim modu kapatıldı',
        'confirm-delete-single-log': '"{name}" log dosyasını silmek istediğinizden emin misiniz?',
        'confirm-delete-multiple-logs': '{count} log dosyasını silmek istediğinizden emin misiniz?',
        'backend-no-connection': '❌ Backend bağlantısı yok',
        'bulk-delete-unavailable': 'Toplu silme özelliği mevcut değil',
        'all-logs-deleted': 'Tüm log dosyaları silindi',
        
        // Modals
        'mapping-title': '🔗 Şablon Alanlarını Eşle',
        'save-mapping-btn': '💾 Kaydet',
        'cancel-mapping-btn': '❌ İptal',
        'mapping-select-field': 'Alan Seç',
        'confirmation-title': '⚠️ Onay',
        'yes-btn': '✅ Evet',
        'no-btn': '❌ Hayır',
        'account-delete-title': '🗑️ Hesap Silme',
        'delete-account-confirm-btn': '🗑️ Evet, Sil',
        'cancel-account-delete-btn': '❌ İptal',
        'template-delete-title': '🗑️ Şablon Silme',
        'delete-template-confirm-btn': '🗑️ Evet, Sil',
        'cancel-template-delete-btn': '❌ İptal',
        'account-delete-message': 'hesabını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
        'template-delete-message': 'şablonunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
        
        // Placeholders
        'account-name-placeholder': 'Hesap adı',
        'account-email-placeholder': 'E-posta adresi',
        'account-password-placeholder': 'Uygulama şifresi',
        'account-smtp-placeholder': 'SMTP sunucu adresi',
        'account-port-placeholder': 'SMTP portu',
        'template-name-placeholder': 'Şablon adı',
        'template-subject-placeholder': 'E-posta konusu',
        'send-subject-placeholder': 'E-posta konusu',
        'cc-placeholder': 'CC e-posta adresleri (virgülle ayırın)',
        'file-select-placeholder': 'Dosya seçin',
        'search-placeholder': 'Ara...',
        
        // Attachment
        'attachment-placeholder': '📎 Dosyaları buraya sürükleyin veya \'Dosya Seç\' butonunu kullanın',
        'no-files-added': 'Henüz dosya eklenmedi...',
        'remove-file': 'Dosyayı kaldır',
        'no-files-to-clear': 'Zaten hiç dosya yok',
        'removed': 'kaldırıldı',
        'selections-cleared': 'Tüm seçimler kaldırıldı',
        'remove-btn': '×',
        
        // Editor
        'global-label': 'Tümü:',
        'individual-label': 'Bu blok:',
        'light-theme-btn': '☀️ Açık',
        'dark-theme-btn': '🌙 Koyu',
        'editor-placeholder': 'Metin yazmaya başlayın...',
        'preview-subject': 'Konu:',
        
        // Language options
        'tr-option': 'Türkçe',
'en-option': 'English',
        
        // Attachments/messages
        'files-added-drag': '{count} dosya sürükleyerek eklendi',
        'file-input-missing': 'Dosya seçim bileşeni bulunamadı!',
        'files-added': '{count} dosya başarıyla eklendi',
        'file-too-large': '{name} çok büyük! Maksimum 50MB',
        'unsupported-file-type': '{name} desteklenmeyen dosya tipi olabilir',
        'file-already-added': '{name} zaten eklendi',
        'files-cleared': '{count} dosya temizlendi',
        'file-save-failed': 'Dosya kaydedilemedi: {name}',
        'files-synced': 'Dosyalar başarıyla senkronize edildi',
        'attachments-sync-error': 'Ekler senkronize edilemedi: {error}',
        
        // Templates/messages
        'template-content-missing': 'Lütfen şablon içeriğini girin (minimum 3 karakter)',
        'template-name-exists': 'Bu isimde bir şablon zaten var. Lütfen farklı bir isim seçin.',
        'template-updated': 'Şablon başarıyla güncellendi',
        'template-added': 'Şablon başarıyla eklendi',
        'error-saving-template': 'Şablon kaydedilirken hata oluştu: {error}',
        'no-template-selected': 'Silmek için şablon seçilmedi',
        'error-deleting-template': 'Şablon silinirken hata oluştu: {error}',
        
        // Accounts/messages
        'fill-all-fields': 'Lütfen tüm alanları doldurun',
        'enter-valid-email': 'Geçerli bir e-posta adresi girin',
        'enter-valid-port': 'Geçerli bir port numarası girin (1-65535)',
        'duplicate-account-name': 'Bu isimde bir hesap zaten mevcut. Lütfen farklı bir isim kullanın.',
        'account-save-error': 'Hesap kaydedilirken hata oluştu: {error}',
        'no-account-selected': 'Silinecek hesap seçilmedi',
        'account-delete-error': 'Hesap silinirken hata oluştu: {error}',
        
        // Contacts/messages
        'select-source-type-first': 'Önce veri kaynağı tipini seçin',
        'error-file-selection': 'Dosya seçiminde hata oluştu: {error}',
        'error-loading-data': 'Veri yüklenirken hata oluştu: {error}',
'error-loading-columns': 'Sütunlar yüklenirken hata oluştu: {error}',
        
        // Send/messages
        'template-not-found': 'Şablon bulunamadı: {name}',
        'load-contacts-first': 'Lütfen önce kişi verilerini yükleyin',
        'mapping-modal-missing': 'Eşleme penceresi bulunamadı',
        'field-select-option': 'Alan Seç',
        'please-select-account': 'Lütfen bir e-posta hesabı seçin',
        'please-enter-subject': 'Lütfen e-posta konusunu girin',
        'please-enter-content': 'Lütfen e-posta içeriğini girin (en az 3 karakter)',
        'please-select-contacts': 'Lütfen e-posta göndermek için kişileri seçin',
        'attachments-retrieve-failed': 'Ek bilgileri alınamadı',
        'email-send-error': 'E-posta gönderiminde hata oluştu: {error}',
        'preview-updated': 'Önizleme güncellendi',
        'fields-mapped': '{count} alan başarıyla eşlendi',
        
    },
    en: {
        // Navigation
        'accounts-tab': '📧 Accounts',
        'contacts-tab': '👥 Contacts',
        'templates-tab': '📜 Templates',
        'send-tab': '🚀 Send',
'logs-tab': '📊 Logs',
        'settings-tab': '⚙️ Settings',
        
        // Accounts
        'accounts-title': '📧 Email Accounts',
        'accounts-name-header': 'Name',
        'accounts-email-header': 'Email',
        'accounts-smtp-header': 'SMTP Server',
        'accounts-port-header': 'Port',
        'accounts-actions-header': 'Actions',
        'add-account-btn': '📧 Add New Account',
        'account-edit-title': 'Edit Account',
        'provider-label': 'Email Provider:',
        'select-provider-option': 'Select',
        'gmail-option': 'Gmail',
        'yandex-option': 'Yandex',
        'yahoo-option': 'Yahoo',
        'custom-option': 'Custom',
        'account-name-label': 'Account Name:',
        'account-email-label': 'Email:',
        'account-password-label': 'Password:',
        'account-smtp-label': 'SMTP Server:',
        'account-port-label': 'SMTP Port:',
        'tls-label': 'Use TLS',
        'save-account-btn': '💾 Save',
        'delete-account-btn': '🗑️ Delete',
        'cancel-account-btn': '❌ Cancel',
        'continue-accounts-btn': '▶ Continue',
        'edit-account-btn': '✏️ Edit',
        
        // Settings
'settings-title': '⚙️ Application Settings',
        'country-label': 'Country:',
        'timezone-label': 'Time Zone:',
        'dateformat-label': 'Date/Time Format:',
        'default-language-label': 'Default Language:',
        'logs-language-label': 'Logs Language:',
        'save-settings-btn': '💾 Save Settings',
        'reload-settings-btn': '🔄 Reload Settings',
        'continue-settings-btn': '▶ Continue',
        
        // Data Management
'data-management-title': '📁 Data Management',
        'data-location-label': 'App Data Location:',
        'data-size-label': 'Data Size:',
        'refresh-data-btn': '🔄 Refresh Info',
        'export-data-btn': '📤 Export Data',
        'import-data-btn': '📥 Import All Data',
        'import-templates-btn': '📝 Import Templates',
        'import-accounts-btn': '👤 Import Accounts',
        'uninstall-app-btn': '😑️ Uninstall Application',
        // Uninstall modal
        'uninstall-title': 'Uninstall Application',
        'uninstall-warning': '⚠️ This will permanently remove all application data!',
        'export-before-label': 'Export data before uninstalling',
        'export-path-label': 'Export Location:',
        'confirm-uninstall-btn': 'Uninstall Application',
        'cancel-uninstall-btn': 'Cancel',
        'uninstall-results-title': 'Uninstall Complete',
        'close-results-btn': 'Close',
'processing-text': 'Processing...',
        'simulate-uninstall-label': 'SIMULATION: Try without deleting (no files will be deleted, app will not close)',
        'removed-files-title': 'Files to be removed',
        'data-to-be-removed-title': 'Data to be removed',
        'removed-files-heading': 'Removed Files',
        'uninstall-confirm-title': 'Confirm Uninstall',
        'uninstall-confirm-warning': 'This will PERMANENTLY DELETE all application data!',
        'uninstall-export-message': 'Data will be exported to:',
        'uninstall-confirm-question': 'Are you absolutely sure you want to uninstall?',
        'uninstall-confirm-yes': 'YES, UNINSTALL',
        'uninstall-confirm-no': 'NO, CANCEL',
        'app-closing-in': 'Application will close in',
        'seconds': 'seconds',
        'complete-uninstall-title': 'Complete Uninstall Instructions',
        'uninstall-success': '✅ Uninstall completed successfully!',
        'uninstall-error': '❌ Uninstall completed with errors.',
        'data-exported-to': '📦 Data exported to:',
        'errors-encountered': '⚠️ Errors encountered:',
        
        // Data Notifications
        'notif-data-refreshed': 'Data information refreshed',
        'notif-export-success': 'Data exported successfully to: {path}',
        'notif-export-failed': 'Export failed: {error}',
        'notif-import-success': 'Data imported successfully from: {path}',
        'notif-import-failed': 'Import failed: {error}',
        'notif-uninstall-complete': 'Uninstall completed',
        'notif-uninstall-failed': 'Uninstall failed: {error}',
        'notif-templates-imported': 'Templates imported: {added} added, {skipped} skipped (duplicates)',
        'notif-templates-import-failed': 'Failed to import templates: {error}',
        'notif-accounts-imported': 'Accounts imported: {added} added, {skipped} skipped (duplicates)',
        'notif-accounts-import-failed': 'Failed to import accounts: {error}',
        
        // Contacts
        'contacts-title': '👥 Contacts',
        'data-source-label': 'Data Source:',
        'select-source-option': 'Select Data Source',
        'sqlite-option': 'SQLite Database',
        'csv-option': 'CSV File',
        'excel-option': 'Excel File',
        'file-label': 'File:',
        'select-file-btn': '📂 Select File',
        'table-sheet-label': 'Table/Sheet:',
        'select-table-option': 'Select Table',
        'email-column-label': 'Email Column:',
        'select-email-column-option': 'Select Email Column',
        'back-contacts-btn': '⬅ Back',
        'valid-emails-btn': '✅ Valid Emails',
        'invalid-records-btn': '❌ Invalid Records',
        'continue-contacts-btn': '▶ Continue',
        'selected-count': 'selected',
        'invalid-records-count': 'invalid records',
        
        // Templates
        'templates-title': '📜 Email Templates',
        'template-name-header': 'Name',
        'template-subject-header': 'Subject',
        'template-content-header': 'Content',
        'template-language-header': 'Language',
        'template-actions-header': 'Actions',
        'add-template-btn': '📝 Add New Template',
        'template-add-title': '📝 Add New Template',
        'template-edit-title': '✏️ Edit Template',
        'template-name-label': 'Template Name:',
        'template-subject-label': 'Subject:',
        'template-content-label': 'Content:',
        'template-language-label': 'Template Language:',
        'change-theme-template-btn': '🌙 Dark Theme',
        'content-format-label': 'Content Format:',
        'html-format-label': '🌐 HTML',
        'text-format-label': '📝 Plain Text',
        'preview-theme-label': 'Preview Theme:',
        'light-theme-label': '☀️ Light Theme',
        'dark-theme-label': '🌙 Dark Theme',
        'preview-label': 'Preview:',
        'fullscreen-template-btn': '🔍 Fullscreen',
        'save-template-btn': '💾 Save',
        'delete-template-btn': '🗑️ Delete',
        'cancel-template-btn': '❌ Cancel',
        'continue-templates-btn': '▶ Continue',
        'edit-template-btn': '✏️ Edit',
        'template-language-all': 'All Languages',
        'template-language-tr': 'Turkish',
        'template-language-en': 'English',
        'templates-filter-all': 'All Languages',
        'templates-filter-tr': 'Turkish',
        'templates-filter-en': 'English',
        'template-filter-all': 'All Languages',
        'template-filter-tr': 'Turkish',
        'template-filter-en': 'English',
        
        // Send
        'send-title': '🚀 Send Email',
        'email-account-label': 'Email Account:',
        'select-account-option': 'Select Account',
        'template-select-label': 'Template:',
        'template-filter-label': 'Language Filter:',
        'template-filter-all': 'All Templates',
        'template-filter-tr': 'Turkish Templates',
        'template-filter-en': 'English Templates',
        'template-select-placeholder': 'Select template (optional)',
        'subject-label': 'Subject:',
        'content-label': 'Content:',
        'change-theme-send-btn': '🌙 Dark Theme',
        'send-content-format-label': 'Content Format:',
        'send-html-format-label': '🌐 HTML',
        'send-text-format-label': '📝 Plain Text',
        'send-theme-label': 'Send Theme:',
        'send-light-theme-label': '☀️ Light Theme',
        'send-dark-theme-label': '🌙 Dark Theme',
        'cc-label': 'CC (Optional):',
        'attachments-label': 'Attachments:',
        'select-file-send-btn': '📎 Select File',
        'clear-all-btn': '🗑️ Clear All',
        'map-placeholders-btn': '🔗 Map Placeholders',
        'show-preview-btn': '👁️ Preview',
        'send-btn': '📤 Send',
        'send-preview-label': 'Preview:',
        'fullscreen-send-btn': '🔍 Fullscreen',
        'status-text': 'Status: Ready',
        'status-sending': 'Status: Sending emails...',
        'status-completed': 'Status: Sending completed',
        'placeholder-info': 'Placeholders must be in {field_name} format',
        'theme-email-info': 'Email will be sent with the selected theme appearance',
        'no-placeholders-found': 'No placeholders found in content',
        
        // Send Confirmation Modal
        'confirmation-title': 'Are you sure you want to send emails?',
        'yes-btn': 'Yes',
        'no-btn': 'No',
        'send-from': 'From',
        'send-to-count': 'Recipients',
        'send-subject': 'Subject',
        'send-format': 'Format',
        'send-theme': 'Theme',
        'send-attachments': 'Attachments',
        'send-cc': 'CC',
        'send-html': 'HTML',
        'send-plain': 'Plain Text',
        'send-dark': 'Dark',
        'send-light': 'Light',
        'send-files': 'files',
        'send-people': 'people',
        'send-none': 'None',
        
        // Sending Progress Modal
        'sending-title': '📧 Email Sending',
        'sending-status': 'Status',
        'sending-in-progress': '⏳ Sending in progress...',
        'sending-completed': '✅ Sending completed!',
        'sending-failed': '❌ Sending failed!',
        'sending-partially': '⚠️ Partially successful',
        'sending-progress': 'Progress',
        'sending-details': 'Details',
        'sending-successful': '✅ Successful',
        'sending-failed-count': '❌ Failed',
        'sending-current': '📨 Sending',
        'sending-waiting': '⏰ Waiting',
        'sending-recipient': 'Recipient',
        'sending-status-success': '✅ Sent',
        'sending-status-failed': '❌ Error',
        'sending-status-sending': '📤 Sending...',
        'sending-close-btn': 'Close',
        'sending-stop-btn': 'Pause',
        'sending-pause-btn': 'Pause',
        'sending-resume-btn': 'Resume',
        'sending-cancel-btn': 'Cancel',
        'sending-paused': '⏸️ Paused',
        'sending-attachment-success': '📎 Attachments sent',
        'sending-attachment-failed': '⚠️ Attachment failed',
        'sending-email-success': 'Email sent successfully',
        'sending-email-failed': 'Email sending failed',
        'sending-total': 'Total',
        'sending-elapsed': 'Elapsed Time',
        'sending-remaining': 'Remaining',
        'sending-speed': 'Speed',
        'sending-per-minute': 'emails/minute',
        
        // Logs
        'logs-title': '📝 Logs',
        'logs-main-title': '📊 System Logs',
        'clear-logs-btn': '🗑️ Clear',
        'scroll-bottom-btn': '⬇️ Go to Bottom',
        'selection-mode-btn': '🔘 Enable Selection Mode',
        'selection-mode-close-btn': '❌ Disable Selection Mode',
        'delete-selected-btn': '🗑️ Delete Selected',
        'delete-all-logs-btn': '🗑️ Delete All',
        'refresh-logs-btn': '🔄 Refresh',
        'log-file-title': '📄 Log File',
        'back-logs-btn': '⬅️ Back',
        'scroll-log-bottom-btn': '⬇️ Go to Bottom',
        'search-logs-btn': '🔍 Search',
        'loading-text': 'Loading...',
        'log-content-cleared': 'Log content cleared...',
        'search-no-results': 'no results found for...',
        'log-load-error': 'Log file could not be loaded: ',
        'lines-label': 'lines',
        'lines-found': 'lines found',
        'log-select-tooltip': 'Select',
        'log-deselect-tooltip': 'Deselect',
        'log-delete-tooltip': 'Delete this log file',
'log-no-files-found': 'No log files found',
        'notif-search-activated': 'Search mode activated',
        'notif-search-deactivated': 'Search mode deactivated',
        'notif-selection-required': 'Enable selection mode first',
        'notif-no-log-files': 'No log files to delete',
        'notif-no-selection': 'No log files selected to delete',
        'notif-selected-count': '{count} log files selected',
        'notif-deleted-count': '{count} log files deleted',
        'notif-delete-failed-count': '{count} log files could not be deleted',
        'selection-mode-activated': 'Selection mode enabled',
        'selection-mode-deactivated': 'Selection mode disabled',
        'confirm-delete-single-log': 'Are you sure you want to delete "{name}" log file?',
        'confirm-delete-multiple-logs': 'Are you sure you want to delete {count} log files?',
        'backend-no-connection': '❌ No backend connection',
        'bulk-delete-unavailable': 'Bulk delete feature not available',
        'all-logs-deleted': 'All log files deleted',
        
        // Modals
        'mapping-title': '🔗 Map Template Fields',
        'save-mapping-btn': '💾 Save',
        'cancel-mapping-btn': '❌ Cancel',
        'mapping-select-field': 'Select Field',
        'confirmation-title': '⚠️ Confirmation',
        'yes-btn': '✅ Yes',
        'no-btn': '❌ No',
        'account-delete-title': '🗑️ Delete Account',
        'delete-account-confirm-btn': '🗑️ Yes, Delete',
        'cancel-account-delete-btn': '❌ Cancel',
        'template-delete-title': '🗑️ Delete Template',
        'delete-template-confirm-btn': '🗑️ Yes, Delete',
        'cancel-template-delete-btn': '❌ Cancel',
        'account-delete-message': 'account? This action cannot be undone.',
        'template-delete-message': 'template? This action cannot be undone.',
        
        // Placeholders
        'account-name-placeholder': 'Account name',
        'account-email-placeholder': 'Email address',
        'account-password-placeholder': 'App password',
        'account-smtp-placeholder': 'SMTP server address',
        'account-port-placeholder': 'SMTP port',
        'template-name-placeholder': 'Template name',
        'template-subject-placeholder': 'Email subject',
        'send-subject-placeholder': 'Email subject',
        'cc-placeholder': 'CC email addresses (comma separated)',
        'file-select-placeholder': 'Select file',
        'search-placeholder': 'Search...',
        
        // Attachment
        'attachment-placeholder': '📎 Drag files here or use the \'Select File\' button',
        'no-files-added': 'No files added yet...',
        'remove-file': 'Remove file',
        'no-files-to-clear': 'No files to clear',
        'removed': 'removed',
        'selections-cleared': 'All selections cleared',
        'remove-btn': '×',
        
        // Editor
        'global-label': 'All:',
        'individual-label': 'This block:',
        'light-theme-btn': '☀️ Light',
        'dark-theme-btn': '🌙 Dark',
        'editor-placeholder': 'Start typing here...',
        'preview-subject': 'Subject:',
        
        // Language options
        'tr-option': 'Türkçe',
'en-option': 'English',
        
        // Attachments/messages
        'files-added-drag': '{count} files added by dragging',
        'file-input-missing': 'File selection element not found!',
        'files-added': '{count} files successfully added',
        'file-too-large': '{name} too large! Max 50MB',
        'unsupported-file-type': '{name} may be an unsupported file type',
        'file-already-added': '{name} already added',
        'files-cleared': '{count} files cleared',
        'file-save-failed': 'File could not be saved: {name}',
        'files-synced': 'Files successfully synchronized',
        'attachments-sync-error': 'Attachments could not be synchronized: {error}',
        
        // Templates/messages
        'template-content-missing': 'Please enter template content (minimum 3 characters)',
        'template-name-exists': 'A template with this name already exists. Please choose a different name.',
        'template-updated': 'Template successfully updated',
        'template-added': 'Template successfully added',
        'error-saving-template': 'Error occurred while saving template: {error}',
        'no-template-selected': 'No template selected for deletion',
        'error-deleting-template': 'Error occurred while deleting template: {error}',
        
        // Accounts/messages
        'fill-all-fields': 'Please fill in all fields',
        'enter-valid-email': 'Please enter a valid email address',
        'enter-valid-port': 'Please enter a valid port number (1-65535)',
        'duplicate-account-name': 'An account with this name already exists. Please use a different name.',
        'account-save-error': 'Error while saving account: {error}',
        'no-account-selected': 'No account selected for deletion',
        'account-delete-error': 'Error while deleting account: {error}',
        
        // Contacts/messages
        'select-source-type-first': 'Please select a data source type first',
        'error-file-selection': 'Error occurred in file selection: {error}',
        'error-loading-data': 'Error occurred while loading data: {error}',
'error-loading-columns': 'Error loading columns: {error}',
        
        // Send/messages
        'template-not-found': 'Template not found: {name}',
        'load-contacts-first': 'Please load contact data first',
        'mapping-modal-missing': 'Mapping modal not found',
        'field-select-option': 'Select Field',
        'please-select-account': 'Please select an email account',
        'please-enter-subject': 'Please enter email subject',
        'please-enter-content': 'Please enter email content (at least 3 characters)',
        'please-select-contacts': 'Please select contacts to send emails',
        'attachments-retrieve-failed': 'Could not retrieve attachment information',
        'email-send-error': 'An error occurred in email sending: {error}',
        'preview-updated': 'Preview updated',
        'fields-mapped': '{count} fields successfully mapped',
        
    }
};

// Get current language
export function getCurrentLanguage() {
    return currentLanguage;
}

// Get text for a specific key
export function getText(key) {
    const lang = translations[currentLanguage];
    return lang[key] || key;
}

// Change language
export function changeLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        localStorage.setItem('language', lang);
        updateAllTexts();
        updateThemeButtons();
        
        // Update language selectors with new language names
        if (window.updateLanguageSelectors) {
            window.updateLanguageSelectors();
        }
        
        // Update settings language dropdown
        if (window.populateLanguageDropdown) {
            window.populateLanguageDropdown();
            // Restore the selected value
            const dl = document.getElementById('settings-default-language');
            if (dl && window.state && window.state.settings) {
                dl.value = window.state.settings.defaultLanguage || 'en';
            }
        }
        
        // Re-init EditorJS instances so placeholders reflect the new language
        if (window.reinitEditorsForLanguage) {
            window.reinitEditorsForLanguage();
        }
    }
}

// Update all texts on the page
export function updateAllTexts() {
    // Update all elements by ID
    Object.keys(translations[currentLanguage]).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            element.textContent = getText(key);
        }
    });
    
    // Update placeholders
    updatePlaceholders();
    
    // Update CSS content
    updateCSSTexts();
    
    // Update dynamic content
    updateDynamicContent();
    
    // Update send account select placeholder
    const sendAccountSelect = document.getElementById('send-account');
    if (sendAccountSelect && sendAccountSelect.options.length > 0) {
        sendAccountSelect.options[0].textContent = getText('select-account-option');
    }
    
    // Update template select placeholder
    const templateSelect = document.getElementById('template-select');
    if (templateSelect && templateSelect.options.length > 0) {
        templateSelect.options[0].textContent = getText('template-select-placeholder');
    }
}

// Update placeholders
function updatePlaceholders() {
    const placeholderMap = {
        'account-name': 'account-name-placeholder',
        'account-email': 'account-email-placeholder',
        'account-password': 'account-password-placeholder',
        'account-smtp-server': 'account-smtp-placeholder',
        'account-smtp-port': 'account-port-placeholder',
        'template-name': 'template-name-placeholder',
        'template-subject': 'template-subject-placeholder',
        'send-subject': 'send-subject-placeholder',
        'cc-input': 'cc-placeholder',
        'source-input': 'file-select-placeholder',
        'search': 'search-placeholder',
        'log-search': 'search-placeholder'
    };
    
    Object.keys(placeholderMap).forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.placeholder = getText(placeholderMap[inputId]);
        }
    });
}

// Update CSS content texts
function updateCSSTexts() {
    // Update attachment placeholder
    const attachmentList = document.querySelector('.attachment-list');
    if (attachmentList) {
        attachmentList.setAttribute('data-placeholder-text', getText('attachment-placeholder'));
    }
    
    // Update loading text
    const logContent = document.querySelector('.log-content');
    if (logContent) {
        logContent.setAttribute('data-loading-text', getText('loading-text'));
    }
}

// Update dynamic content that might be created by JavaScript
function updateDynamicContent() {
    // Update theme buttons
    updateThemeButtons();

    // Update template form title based on current state
    updateTemplateFormTitle();

    // Update attachment empty state text without reload
    const attachmentList = document.getElementById('attachment-list');
    if (attachmentList) {
        // Update CSS placeholder attribute
        attachmentList.setAttribute('data-placeholder-text', getText('attachment-placeholder'));
        // Update inline empty message div if present
        const emptyEl = attachmentList.querySelector('.attachment-empty');
        if (emptyEl) {
            emptyEl.textContent = getText('no-files-added');
        }
    }
    
    // Update selection mode button
    const selectionModeBtn = document.getElementById('toggle-selection-mode');
    if (selectionModeBtn) {
        const isSelectionMode = selectionModeBtn.classList.contains('btn-warning');
        selectionModeBtn.textContent = isSelectionMode ? getText('selection-mode-close-btn') : getText('selection-mode-btn');
    }
    
    // Update delete selected button with count
    const deleteSelectedBtn = document.getElementById('delete-selected-logs');
    if (deleteSelectedBtn) {
        const selectedCount = document.querySelectorAll('.log-file-card.selected').length;
        if (selectedCount > 0) {
            deleteSelectedBtn.textContent = `${getText('delete-selected-btn')} (${selectedCount})`;
        } else {
            deleteSelectedBtn.textContent = getText('delete-selected-btn');
        }
    }
    
    // Update log cards dynamically
    updateLogCardsLanguage();
}

// Update template form title based on current state
function updateTemplateFormTitle() {
    const editTitle = document.getElementById('template-edit-title');
    if (editTitle) {
        // Check if we're editing an existing template or adding a new one
        const deleteBtn = document.getElementById('delete-template-btn');
        const isEditing = deleteBtn && deleteBtn.style.display !== 'none';
        
        if (isEditing) {
            // We're editing an existing template
            editTitle.textContent = getText('template-edit-title');
        } else {
            // We're adding a new template
            editTitle.textContent = getText('template-add-title');
        }
    }
}

// Update theme buttons based on current theme
function updateThemeButtons() {
    const templateThemeBtn = document.getElementById('change-theme-template-btn');
    const sendThemeBtn = document.getElementById('change-theme-send-btn');
    
    if (templateThemeBtn) {
        const wrapper = templateThemeBtn.closest('.editor-wrapper');
        const isDark = wrapper ? wrapper.classList.contains('dark-theme') : false;
        templateThemeBtn.textContent = isDark ? getText('light-theme-label') : getText('dark-theme-label');
    }
    
    if (sendThemeBtn) {
        const wrapper = sendThemeBtn.closest('.editor-wrapper');
        const isDark = wrapper ? wrapper.classList.contains('dark-theme') : false;
        sendThemeBtn.textContent = isDark ? getText('light-theme-label') : getText('dark-theme-label');
    }
}

// Update log cards language dynamically
function updateLogCardsLanguage() {
    // Update all log file cards
    const logCards = document.querySelectorAll('.log-file-card');
    logCards.forEach(card => {
        const fileName = card.dataset.filename;
        if (!fileName) return;
        
        // Update loading text in size and lines elements
        const sizeElement = card.querySelector(`[id^="size-"]`);
        const linesElement = card.querySelector(`[id^="lines-"]`);
        
        if (sizeElement && (sizeElement.textContent === 'Yükleniyor...' || sizeElement.textContent === 'Loading...')) {
            sizeElement.textContent = getText('loading-text');
        }
        if (linesElement && (linesElement.textContent === 'Yükleniyor...' || linesElement.textContent === 'Loading...')) {
            linesElement.textContent = getText('loading-text');
        }
        
        // Update tooltips on buttons
        const selectBtn = card.querySelector('.log-select-btn');
        const deleteBtn = card.querySelector('.log-delete-btn');
        
        if (selectBtn) {
            const isSelected = selectBtn.classList.contains('selected');
            selectBtn.title = isSelected ? getText('log-deselect-tooltip') : getText('log-select-tooltip');
        }
        
        if (deleteBtn) {
            deleteBtn.title = getText('log-delete-tooltip');
        }
        
        // Update lines label keeping the numeric count
        if (linesElement && /^\d+/.test(linesElement.textContent.trim())) {
            const num = linesElement.textContent.trim().match(/^(\d+)/);
            if (num) {
                linesElement.textContent = `${num[1]} ${getText('lines-label')}`;
            }
        }
    });
    
    // Update empty state message
    const grid = document.getElementById('log-files-grid');
    if (grid) {
        const emptyDiv = grid.querySelector('div[style*="grid-column: 1/-1"]');
        if (emptyDiv && (emptyDiv.textContent.includes('No log files found') || emptyDiv.textContent.includes('Hiç log dosyası bulunamadı'))) {
            emptyDiv.textContent = getText('log-no-files-found');
        }
    }
}

// Initialize language system
export function initLanguage() {
    const savedLang = localStorage.getItem('language') || 'en';  // Default to English for global app
    currentLanguage = savedLang;
    
    // Set language selector with dynamic language names
    const langSelect = document.getElementById('language-select');
    if (langSelect) {
        const langOptions = getLanguageOptionsForCurrentLang();
        langSelect.innerHTML = `
            <option value="tr">${langOptions.tr}</option>
            <option value="en">${langOptions.en}</option>
        `;
        langSelect.value = currentLanguage;
    }
    
    // Update all texts immediately
    updateAllTexts();
}

// Global function for HTML onclick
export function changeLanguageGlobal() {
    const langSelect = document.getElementById('language-select');
    if (langSelect) {
        changeLanguage(langSelect.value);
    }
}
