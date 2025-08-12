# Bulk Mailer Go 

![Bulk Mailer Go Icon](https://raw.githubusercontent.com/shayhowler/bulk-mailer-go/main/build/icon.ico)

[![Go Version](https://img.shields.io/badge/Go-1.23.0+-blue.svg)](https://golang.org/)
[![Wails](https://img.shields.io/badge/Wails-2.10.2+-green.svg)](https://wails.io/)
[![TinyMCE](https://img.shields.io/badge/TinyMCE-8.0.1+-blue.svg)](https://wails.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Simple Bulk Email Sender** - Basit toplu e-posta gönderme uygulaması

This application is a desktop tool designed for sending personalized emails to multiple recipients using templates. It's not a professional marketing tool, but a practical solution for personal or small-scale use. By matching placeholders in templates with contact data, you can send the same message tailored to each recipient (e.g., addressing by name).

**Note:** Outlook app password support is not provided and this feature will be removed in the future. Currently tested only with Gmail.

---

## English

### What is Bulk Mailer Go?

Bulk Mailer Go is a simple desktop application for sending bulk emails using templates, built with Go and Wails. It allows matching templates to individual contacts for personalized messages (e.g., addressing by name).

**Note:** Outlook app passwords are not supported and will be removed in future. Tested only with Gmail.

[Türkçe README için buraya tıklayın](#türkçe)

### 🚀 Features

- **📧 Email Account Support**: Gmail (others limited, no Outlook app password)
- **👥 Contact Management**: Import from SQLite, CSV, Excel
- **📝 Template System**: Rich text editor (TinyMCE) for templates; placeholders (`{name}` etc.); add images/GIFs; live preview
- **🎨 Theme Support**: Light/dark (editor only, email color changes based on selected theme)
- **🌍 Multi-language**: Turkish and English
- **📎 File Attachments**: Add files, images, GIFs to emails
- **📊 Detailed Logs**: Track sending, filter, delete
- **⚙️ Advanced Settings**: Country, timezone, date format
- **📤 Bulk Sending**: Send thousands at once; pause/continue/cancel; 90% accurate (tables not guaranteed)
- **🔍 Search and Filtering**: Filter contacts and templates
- **🔄 Data Management**: Import/export data, templates/accounts
- **🗑️ Self-Uninstall**: Remove app (full on macOS/Windows; partial on Linux)

### 📋 System Requirements

- **Go**: 1.23.0 or higher
- **Node.js**: 24.5.0 or higher
- **npm**: 11.5.1 or higher
- **Operating System**: Windows, macOS, Linux (some issues on Linux, see Known Issues)

### 🛠️ Installation

#### 1. Clone the Project
```bash
git clone https://github.com/shayhowler/bulk-mailer-go.git
cd bulk-mailer-go
```

#### 2. Install Go Dependencies
```bash
go mod download
```

#### 3. Install Frontend Dependencies
```bash
cd frontend
npm install
```

#### 4. Run the Application
```bash
# Development mode
wails dev

# Production build
wails build
```

### 📖 User Guide (Step-by-Step)

The app is tab-based. The "Contacts" tab stays inactive until you add at least one account and press "Continue" in the Accounts tab for the first time. After that, you can freely navigate between all tabs without restrictions.

#### 1. Settings
- Start here on first launch.
- **Country**: Select your country.
- **Timezone**: Set local timezone.
- **Date Format**: 12 or 24 hour.
- **Default Language**: Set app language (Turkish/English).
- Save changes and press "Continue" to proceed.
- **Data Management**: View data location and size; export/import data; import templates or accounts; uninstall the app (self-uninstall).

#### 2. Account Management
- Click "Add Account".
- Select provider (Gmail is tested and recommended).
- For Gmail: Use an App Password instead of your regular password (required if 2-Step Verification is enabled). See instructions below on how to create one.
- Enter account name, email, password (or App Password), SMTP server (smtp.gmail.com), port (587 or 465).
- Enable TLS.
- Save the account.
- After adding at least one account, the "Continue" button activates; press it to enable the "Contacts" tab for the first time.

**How to Enable 2-Step Verification (2FA) for Google Account:**
1. Open your Google Account (myaccount.google.com).
2. In the navigation panel, select Security.
3. Under “How you sign in to Google,” select 2-Step Verification > Get started.
4. Follow the on-screen steps to set it up (e.g., using your phone for verification codes).

**How to Create an App Password for Gmail:**
(Note: 2-Step Verification must be enabled first.)
1. Go to your Google Account (myaccount.google.com).
2. Select Security.
3. Under "How you sign in to Google," select App Passwords (you may need to sign in again).
4. At the bottom, choose Select app and pick "Mail" or "Other" (custom name).
5. Choose Select device and pick the device (e.g., your computer).
6. Choose Generate.
7. Copy the 16-character App Password and use it in the app (instead of your regular password).
8. Tap Done.

#### 3. Contact Management
- Select data source (SQLite, CSV, Excel).
- Choose file (for CSV/Excel), table/sheet, email column.
- Filter valid/invalid emails.
- Select contacts (checkbox for bulk).
- Press "Continue" to proceed to "Templates" (optional after initial setup).

#### 4. Template Management
- "Add Template" to create.
- Enter name, subject, language.
- Edit content: Use placeholders (`{name}`, `{surname}`); add images/GIFs; change theme (light/dark, affects email color).
- Live preview.
- Save.
- Press "Continue" to proceed to "Send" (optional).

#### 5. Email Sending
- Select account from dropdown (required).
- Choose template from dropdown; subject/content loads.
- Edit if needed; map placeholders.
- Add CC, attachments (files/images/GIFs).
- Live preview.
- "Send Emails" to start.
- During sending: Pause, continue, cancel.
- Progress bar, stats, logs shown (90% accurate, tables may vary).

#### 6. Log Management
- View sending logs.
- Filter by date range.
- Delete selected or all.

### 🔧 Advanced Features

#### Placeholder System
Use `{name}`, `{surname}`, `{company}` in templates for personalization. Map automatically during send.

#### Theme System
- Editor only: Light (day) / Dark (night).
- Email color changes based on selected theme.

#### Data Management
- **Export**: Backup all data.
- **Import**: Restore from backup; import templates/accounts.
- **Self-Uninstall**: From settings (full on macOS/Windows; leaves .cache/.local/share/BulkMailerGo on Linux).

### 🚨 Security Notes

- Keep email passwords secure.
- Enter SMTP info correctly.
- Watch for spam filters in bulk sending.

### 🐛 Known Issues and Troubleshooting

#### Known Issues
- Dropdowns appear white on Linux (fix incoming).
- Uninstall on Linux leaves .cache and .local/share/BulkMailerGo (resolved on macOS/Windows).
- Sending 90% realistic; tables not guaranteed.

#### Common Issues
1. **Emails Not Sending**:
   - Check SMTP settings.
   - Verify password/username.
   - Check port.
2. **Contacts Not Importing**:
   - Check file format.
   - Select email column correctly.
   - Check permissions.
3. **App Not Opening**:
   - Check Go/Node.js versions.
   - Reinstall dependencies.

### 📞 Support

- **GitHub Issues**: Report on [project page](https://github.com/shayhowler/bulk-mailer-go/issues)


---

## Türkçe

### Bulk Mailer Go Nedir?

Bulk Mailer Go, Go programlama dili ve Wails framework kullanılarak geliştirilmiş basit bir toplu e-posta gönderme uygulamasıdır. Kişiselleştirilmiş şablonlar ile birden fazla alıcıya e-posta göndermeyi kolaylaştırır.

**Not:** Outlook app password desteği verilmiyor ve bu özellik ileride kaldırılacak. Şu an sadece Gmail ile test edildi.

[Click here for the English README](#english)

### 🚀 Özellikler

- **📧 E-posta Hesabı Desteği**: Gmail (diğerleri sınırlı, Outlook app password desteklenmiyor)
- **👥 Kişi Yönetimi**: SQLite, CSV ve Excel dosyalarından kişi içe aktarma
- **📝 Şablon Sistemi**: Zengin metin editörü (TinyMCE) ile şablon oluşturma; yer tutucular (`{ad}` gibi) kullanarak kişiselleştirme; resim, GIF ekleme; canlı önizleme
- **🎨 Tema Desteği**: Açık/koyu tema (sadece editörde mevcut, seçili temaya göre e-posta rengi değişir)
- **🌍 Çoklu Dil**: Türkçe ve İngilizce dil desteği
- **📎 Dosya Eki**: E-postalara dosya, resim, GIF ekleme
- **📊 Detaylı Loglar**: Gönderim işlemlerini takip etme, filtreleme, silme
- **⚙️ Gelişmiş Ayarlar**: Ülke, saat dilimi, tarih formatı ayarları
- **📤 Toplu Gönderim**: Binlerce e-postayı tek seferde gönderme; duraklatma, devam etme, iptal etme; %90 gerçeğe yakın gönderim (tablolar garanti edilmez)
- **🔍 Arama ve Filtreleme**: Kişileri ve şablonları filtreleme
- **🔄 Veri Yönetimi**: Veri içe/dışa aktarma, şablon/hesap içe aktarma
- **🗑️ Kendini Silme**: Uygulama kaldırma (macOS ve Windows'ta tam silme; Linux'ta .cache ve .local/share/BulkMailerGo kalır)

---

## 🇹🇷 Türkçe

### Bulk Mailer Go Nedir?

Bulk Mailer Go, profesyonel e-posta pazarlama kampanyaları için tasarlanmış güçlü bir masaüstü uygulamasıdır. Go programlama dili ve Wails framework kullanılarak geliştirilmiştir.

### 🚀 Özellikler

- **📧 Çoklu E-posta Hesabı Desteği**: Gmail, Yandex, Yahoo, Outlook ve özel SMTP sunucuları
- **👥 Kişi Yönetimi**: SQLite, CSV ve Excel dosyalarından kişi içe aktarma
- **📝 Şablon Sistemi**: Zengin metin editörü ile e-posta şablonları oluşturma
- **🎨 Tema Desteği**: Açık/koyu tema seçenekleri
- **🌍 Çoklu Dil**: Türkçe ve İngilizce dil desteği
- **📎 Dosya Eki**: E-postalara dosya ekleme özelliği
- **📊 Detaylı Loglar**: Gönderim işlemlerini takip etme
- **⚙️ Gelişmiş Ayarlar**: Ülke, saat dilimi ve tarih formatı ayarları
- **📤 Toplu Gönderim**: Binlerce e-postayı tek seferde gönderme
- **🔍 Arama ve Filtreleme**: Kişileri ve şablonları filtreleme

### 📋 Sistem Gereksinimleri

- **Go**: 1.23.0 veya üzeri
- **Node.js**: 24.5.0 veya üzeri
- **npm**: 11.5.1 veya üzeri
- **İşletim Sistemi**: Windows, macOS, Linux (Linux'ta bazı sorunlar mevcut, bkz. Bilinen Sorunlar)

### 🛠️ Kurulum

#### 1. Projeyi Klonlayın
```bash
git clone https://github.com/shayhowler/bulk-mailer-go.git
cd bulk-mailer-go
```

#### 2. Go Bağımlılıklarını Yükleyin
```bash
go mod download
```

#### 3. Frontend Bağımlılıklarını Yükleyin
```bash
cd frontend
npm install
```

#### 4. Uygulamayı Çalıştırın
```bash
# Geliştirme modunda
wails dev

# Üretim build'i
wails build
```

### 📖 Kullanım Kılavuzu (Adım Adım)

Uygulama sekme tabanlıdır. "Kişiler" sekmesi, en az bir hesap ekleyip "Hesaplar" sekmesinde "Continue" butonuna basana kadar aktif olmaz (yalnızca ilk seferlik). Sonrasında tüm sekmeler arasında serbestçe gezinebilirsiniz.

#### 1. Ayarlar (Settings)
- Uygulamayı ilk açtığınızda buradan başlayın.
- **Ülke**: Bulunduğunuz ülkeyi seçin.
- **Saat Dilimi**: Yerel saat diliminizi ayarlayın.
- **Tarih Formatı**: 12 veya 24 saat formatını seçin.
- **Varsayılan Dil**: Uygulama dilini belirleyin (Türkçe/İngilizce).
- Değişiklikleri kaydedin ve "Continue" ile devam edin.
- **Veri Yönetimi**: Veri konumunu ve boyutunu görüntüleyin; verileri dışa/içe aktarın; şablonları veya hesapları içe aktarın; uygulamayı kaldırın (self-uninstall).

#### 2. Hesap Yönetimi (Accounts)
- "Add Account" butonu ile yeni hesap ekleyin.
- Sağlayıcı seçin (Gmail test edildi ve önerilir).
- Gmail için: Normal şifre yerine App Password kullanın (2 Adımlı Doğrulama etkinse zorunlu). Aşağıdaki talimatlara bakın.
- Hesap adı, e-posta, şifre (veya App Password), SMTP sunucu (smtp.gmail.com), port (587 veya 465) girin.
- TLS'i etkinleştirin.
- Hesabı kaydedin.
- En az bir hesap ekledikten sonra "Continue" butonu aktif olur; basın ve "Kişiler" sekmesine geçin (yalnızca ilk sefer).

**Google Hesabı için 2 Adımlı Doğrulama (2FA) Nasıl Etkinleştirilir:**
1. Google Hesabınızı açın (myaccount.google.com).
2. Sol navigasyon panelinde Güvenlik'i seçin.
3. “Google'a giriş yapma yöntemi” altında 2 Adımlı Doğrulama > Başlayın'ı seçin.
4. Ekran talimatlarını izleyin (örneğin, telefonunuzla doğrulama kodları ayarlayın).

**Gmail için App Password Nasıl Oluşturulur:**
(Not: Önce 2 Adımlı Doğrulama etkinleştirilmiş olmalı.)
1. Google Hesabınıza gidin (myaccount.google.com).
2. Güvenlik'i seçin.
3. "Google'a giriş yapma yöntemi" altında App Passwords'ı seçin (tekrar giriş yapmanız gerekebilir).
4. Alt kısımda Uygulama seçin ve "Mail" veya "Diğer" (özel isim) seçin.
5. Cihaz seçin ve kullandığınız cihazı seçin (örneğin, bilgisayarınız).
6. Oluştur'u seçin.
7. 16 karakterli App Password'ü kopyalayın ve uygulamada kullanın (normal şifreniz yerine).
8. Tamam'ı seçin.

#### 3. Kişi Yönetimi (Contacts)
- Veri kaynağı seçin (SQLite, CSV, Excel).
- Dosya seçin (CSV/Excel için), tablo/sayfa ve e-posta sütununu belirleyin.
- Geçerli/geçersiz e-postaları filtreleyin.
- Kişileri seçin (checkbox ile toplu seçim).
- "Continue" ile "Şablonlar" sekmesine geçin (isteğe bağlı).

#### 4. Şablon Yönetimi (Templates)
- "Add Template" ile yeni şablon oluşturun.
- Şablon adı, konu ve dil girin.
- Editörde içerik oluşturun: Yer tutucular (`{ad}`, `{soyad}` vb.) kullanın; resim/GIF ekleyin; tema değiştirin (açık/koyu, e-posta rengi buna göre değişir).
- Canlı önizleme ile kontrol edin.
- Şablonu kaydedin.
- "Continue" ile "Gönder" sekmesine geçin (isteğe bağlı).

#### 5. E-posta Gönderimi (Send)
- Hesap dropdown'undan bir hesap seçin (zorunlu).
- Şablon dropdown'undan şablon seçin; konu ve içerik otomatik yüklenir.
- İsterseniz düzenleyin; yer tutucuları eşleştirin (map placeholders).
- CC ekleyin, dosya/resim/GIF ekleyin.
- Canlı önizleme ile kontrol edin.
- "Send Emails" ile gönderime başlayın.
- Gönderim sırasında: Duraklat (pause), devam et (continue), iptal et (cancel).
- İlerleme çubuğu, istatistikler ve loglar gösterilir (%90 doğru gönderim, tablolar değişebilir).

#### 6. Log Yönetimi (Logs)
- Gönderim loglarını görüntüleyin.
- Tarih aralığı ile filtreleyin.
- Seçili logları veya tümünü silin.

### 🔧 Gelişmiş Özellikler

#### Yer Tutucu Sistemi
Şablonlarda `{ad}`, `{soyad}`, `{şirket}` gibi değişkenler kullanarak kişiselleştirilmiş e-postalar oluşturun. Gönderimde otomatik eşleştirin.

#### Tema Sistemi
- Sadece editörde mevcut: Açık (gündüz) / Koyu (gece).
- Seçili temaya göre e-posta rengi değişir.

#### Veri Yönetimi
- **Dışa Aktarma**: Tüm verileri yedekleyin.
- **İçe Aktarma**: Yedekten geri yükleyin; şablon/hesap içe aktarın.
- **Kendini Silme**: Ayarlar'dan kaldırın (macOS/Windows tam; Linux kısmi).

### 🚨 Güvenlik Notları

- E-posta şifrelerinizi güvenli tutun.
- SMTP bilgilerini doğru girin.
- Toplu gönderimde spam filtrelerine dikkat edin.

### 🐛 Bilinen Sorunlar ve Sorun Giderme

#### Bilinen Sorunlar
- Linux'ta dropdown'lar beyaz görünebiliyor (düzeltiliyor).
- Linux'ta kaldırma tam değil: .cache ve .local/share/BulkMailerGo kalır (macOS/Windows çözüldü).
- Gönderim %90 gerçeğe yakın; tablolar garanti edilmez.

#### Yaygın Sorunlar
1. **E-posta Gönderilemiyor**:
   - SMTP ayarlarını kontrol edin.
   - Şifre ve kullanıcı adını doğrulayın.
   - Port numarasını kontrol edin.
2. **Kişi İçe Aktarılmıyor**:
   - Dosya formatını kontrol edin.
   - E-posta sütununu doğru seçin.
   - Dosya izinlerini kontrol edin.
3. **Uygulama Açılmıyor**:
   - Go ve Node.js sürümlerini kontrol edin.
   - Bağımlılıkları yeniden yükleyin.

### 📞 Destek

- **GitHub Issues**: [Proje sayfasında](https://github.com/shayhowler/bulk-mailer-go/issues) sorun bildirin

### 📖 Kullanım Kılavuzu

#### 1. Ayarlar (Settings)
- **Ülke**: Bulunduğunuz ülkeyi seçin
- **Saat Dilimi**: Yerel saat diliminizi ayarlayın
- **Tarih Formatı**: 12 veya 24 saat formatını seçin
- **Varsayılan Dil**: Uygulama dilini belirleyin

#### 2. Hesap Yönetimi (Accounts)
- **E-posta Hesabı Ekleme**:
  - Sağlayıcı seçin (Gmail, Yandex, Yahoo, Outlook, Özel)
  - Hesap adı, e-posta, şifre girin
  - SMTP sunucu ve port bilgilerini girin
  - TLS güvenliği için onay kutusunu işaretleyin

#### 3. Kişi Yönetimi (Contacts)
- **Veri Kaynağı Seçimi**:
  - SQLite veritabanı
  - CSV dosyası
  - Excel dosyası
- **Tablo/Sayfa Seçimi**: Veri kaynağındaki tabloyu seçin
- **E-posta Sütunu**: E-posta adreslerinin bulunduğu sütunu belirleyin
- **Kişi Filtreleme**: Geçerli ve geçersiz e-postaları görüntüleme

#### 4. Şablon Yönetimi (Templates)
- **Şablon Oluşturma**:
  - Şablon adı ve konu girin
  - Dil seçin (Türkçe/İngilizce)
  - TinyMCE editör ile içerik oluşturun
  - Placeholder'lar için `{değişken_adı}` formatını kullanın
- **Şablon Önizleme**: Gönderim öncesi şablonu önizleyin
- **Tema Değiştirme**: Açık/koyu tema arasında geçiş yapın

#### 5. E-posta Gönderimi (Send)
- **Gönderim Hesabı**: Kullanılacak e-posta hesabını seçin
- **Şablon Seçimi**: Gönderilecek şablonu seçin
- **Konu ve İçerik**: E-posta konusu ve içeriğini düzenleyin
- **Dosya Eki**: Gerekli dosyaları ekleyin
- **Placeholder Eşleştirme**: Şablon değişkenlerini kişi verileriyle eşleştirin
- **Toplu Gönderim**: Seçili kişilere e-postaları gönderin

#### 6. Log Yönetimi (Logs)
- **Gönderim Logları**: Tüm e-posta gönderim işlemlerini takip edin
- **Log Filtreleme**: Belirli tarih aralıklarında arama yapın
- **Log Temizleme**: Eski logları silin

### 🔧 Gelişmiş Özellikler

#### Placeholder Sistemi
Şablonlarda `{ad}`, `{soyad}`, `{şirket}` gibi değişkenler kullanarak kişiselleştirilmiş e-postalar oluşturun.

#### Tema Sistemi
- **Açık Tema**: Gündüz kullanımı için
- **Koyu Tema**: Gece kullanımı için

#### Veri Yönetimi
- **Veri Dışa Aktarma**: Tüm verileri yedekleyin
- **Veri İçe Aktarma**: Yedekten veri geri yükleyin
- **Şablon İçe Aktarma**: Mevcut şablonları içe aktarın

### 🚨 Güvenlik Notları

- E-posta şifrelerinizi güvenli tutun
- SMTP sunucu bilgilerinizi doğru girin
- TLS güvenliği için onay kutusunu işaretleyin
- Toplu e-posta gönderiminde spam filtrelerine dikkat edin

### 🐛 Sorun Giderme

#### Yaygın Sorunlar

1. **E-posta Gönderilemiyor**:
   - SMTP ayarlarını kontrol edin
   - Şifre ve kullanıcı adını doğrulayın
   - Port numarasını kontrol edin

2. **Kişi İçe Aktarılamıyor**:
   - Dosya formatını kontrol edin
   - E-posta sütununu doğru seçin
   - Dosya izinlerini kontrol edin

3. **Uygulama Açılmıyor**:
   - Go ve Node.js sürümlerini kontrol edin
   - Bağımlılıkları yeniden yükleyin

### 📞 Destek

- **GitHub Issues**: [Proje sayfasında](https://github.com/yourusername/bulk-mailer-go/issues) sorun bildirin
- **E-posta**: 146424623+shayhowler@users.noreply.github.com

---

## 🇺🇸 English

### What is Bulk Mailer Go?

Bulk Mailer Go is a powerful desktop application designed for professional email marketing campaigns. It's built using the Go programming language and Wails framework.

### 🚀 Features

- **📧 Multiple Email Account Support**: Gmail, Yandex, Yahoo, Outlook and custom SMTP servers
- **👥 Contact Management**: Import contacts from SQLite, CSV and Excel files
- **📝 Template System**: Create email templates with rich text editor
- **🎨 Theme Support**: Light/dark theme options
- **🌍 Multi-language**: Turkish and English language support
- **📎 File Attachments**: Add files to emails
- **📊 Detailed Logs**: Track sending operations
- **⚙️ Advanced Settings**: Country, timezone and date format settings
- **📤 Bulk Sending**: Send thousands of emails at once
- **🔍 Search and Filtering**: Filter contacts and templates

### 📋 System Requirements

- **Go**: 1.23.0 or higher
- **Node.js**: 24.5.0 or higher
- **npm**: 11.5.1 or higher
- **Operating System**: Windows, macOS, Linux

### 🛠️ Installation

#### 1. Clone the Project
```bash
git clone https://github.com/yourusername/bulk-mailer-go.git
cd bulk-mailer-go
```

#### 2. Install Go Dependencies
```bash
go mod download
```

#### 3. Install Frontend Dependencies
```bash
cd frontend
npm install
```

#### 4. Run the Application
```bash
# Development mode
wails dev

# Production build
wails build
```

### 📖 User Guide

#### 1. Settings
- **Country**: Select your country
- **Timezone**: Set your local timezone
- **Date Format**: Choose 12 or 24 hour format
- **Default Language**: Set application language

#### 2. Account Management
- **Adding Email Account**:
  - Select provider (Gmail, Yandex, Yahoo, Outlook, Custom)
  - Enter account name, email, password
  - Enter SMTP server and port information
  - Check TLS security checkbox

#### 3. Contact Management
- **Data Source Selection**:
  - SQLite database
  - CSV file
  - Excel file
- **Table/Sheet Selection**: Select table from data source
- **Email Column**: Specify column containing email addresses
- **Contact Filtering**: View valid and invalid emails

#### 4. Template Management
- **Creating Templates**:
  - Enter template name and subject
  - Select language (Turkish/English)
  - Create content with TinyMCE editor
  - Use `{variable_name}` format for placeholders
- **Template Preview**: Preview template before sending
- **Theme Switching**: Switch between light/dark themes

#### 5. Email Sending
- **Sending Account**: Select email account to use
- **Template Selection**: Choose template to send
- **Subject and Content**: Edit email subject and content
- **File Attachments**: Add necessary files
- **Placeholder Mapping**: Map template variables with contact data
- **Bulk Sending**: Send emails to selected contacts

#### 6. Log Management
- **Sending Logs**: Track all email sending operations
- **Log Filtering**: Search within specific date ranges
- **Log Cleaning**: Delete old logs

### 🔧 Advanced Features

#### Placeholder System
Use variables like `{name}`, `{surname}`, `{company}` in templates to create personalized emails.

#### Theme System
- **Light Theme**: For daytime use
- **Dark Theme**: For nighttime use

#### Data Management
- **Data Export**: Backup all data
- **Data Import**: Restore data from backup
- **Template Import**: Import existing templates

### 🚨 Security Notes

- Keep your email passwords secure
- Enter SMTP server information correctly
- Check TLS security checkbox
- Be careful with spam filters when sending bulk emails

### 🐛 Troubleshooting

#### Common Issues

1. **Emails Not Sending**:
   - Check SMTP settings
   - Verify password and username
   - Check port number

2. **Contacts Not Importing**:
   - Check file format
   - Select email column correctly
   - Check file permissions

3. **Application Not Opening**:
   - Check Go and Node.js versions
   - Reinstall dependencies

### 📞 Support

- **GitHub Issues**: Report issues on [project page](https://github.com/shayhowler/bulk-mailer-go/issues)
- **Email**: 146424623+shayhowler@users.noreply.github.com

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Bu proje MIT Lisansı altında lisanslanmıştır - detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

## 👨‍💻 Author / Yazar

**Burak Aksoy** - [GitHub](https://github.com/shayhowler)

© 2025 Burak Aksoy. All rights reserved. / Tüm hakları saklıdır.
