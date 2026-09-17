# Task Management App

Trello benzeri, mobil cihazlar için geliştirilmiş bir görev ve pano yönetim uygulamasıdır. Kullanıcıların panolar, kolonlar ve görevler oluşturmasına; görevleri sürükle-bırak ile düzenlemesine; görev ataması, öncelik, son tarih, yorum, profil ve tema gibi özellikleri kullanmasına olanak sağlar.

## Özellikler

- Kullanıcı kayıt ve giriş sistemi
- JWT tabanlı kimlik doğrulama
- Pano oluşturma, görüntüleme, düzenleme ve silme
- Kolon oluşturma, görüntüleme, düzenleme ve silme
- Görev oluşturma, görüntüleme, düzenleme ve silme
- Görevleri kolonlar arasında sürükle-bırak ile taşıma
- Görevlerin aynı kolon içerisinde yeniden sıralanması
- Görev önceliği: Düşük, Orta, Yüksek
- Görevlere son tarih ekleme
- Görevlere kullanıcı atama
- Görev adına göre arama
- Önceliğe göre görev filtreleme
- Görevlere yorum ekleme ve kendi yorumunu silme
- Profil bilgilerini görüntüleme
- Açık, koyu ve sistem teması
- Form doğrulama ve hata kontrolleri
- Android APK oluşturma ve cihaza kurma
- Render üzerinde çalışan online backend

## Teknolojiler

### Mobil Uygulama

- React Native
- Expo
- Expo Router
- TypeScript
- React Native Reanimated
- React Native Gesture Handler
- Expo Secure Store
- Expo UI
- Expo Vector Icons

### Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- JWT
- bcryptjs
- PostgreSQL

### Dağıtım ve Build

- Render
- Expo EAS Build
- Android APK

## Proje Yapısı

```text
mobile/
├── src/
│   ├── app/
│   │   ├── (tabs)/
│   │   │   ├── boards.tsx
│   │   │   ├── profile.tsx
│   │   │   └── settings.tsx
│   │   ├── board-detail.tsx
│   │   ├── create-board.tsx
│   │   ├── create-list.tsx
│   │   ├── create-task.tsx
│   │   ├── edit-board.tsx
│   │   ├── edit-list.tsx
│   │   ├── edit-task.tsx
│   │   ├── task-details.tsx
│   │   ├── index.tsx
│   │   └── register.tsx
│   ├── components/
│   └── context/
│
├── backend/
│   ├── src/
│   │   ├── lib/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── server.ts
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   └── package.json
│
├── assets/
├── app.json
├── eas.json
├── package.json
└── README.md
```

## Veritabanı Yapısı

Temel ilişkiler:

```text
User
 ├── Board
 ├── Task
 └── Comment

Board
 ├── List
 └── Task

List
 └── Task

Task
 └── Comment
```

Görev yapısında kullanılan başlıca alanlar:

- Başlık
- Açıklama
- Durum
- Öncelik
- Son tarih
- Sıra
- Pano
- Kolon
- Atanan kullanıcı

## Backend API

### Authentication

```text
POST /auth/register
POST /auth/login
GET  /auth/users
```

### Boards

```text
GET    /boards
POST   /boards
PUT    /boards/:id
DELETE /boards/:id
```

### Lists

```text
GET    /lists/board/:boardId
GET    /lists/:id
POST   /lists/board/:boardId
PUT    /lists/:id
DELETE /lists/:id
```

### Tasks

```text
GET    /tasks/board/:boardId
GET    /tasks/:id
POST   /tasks
PUT    /tasks/:id
DELETE /tasks/:id
PATCH  /tasks/:id/move
```

### Comments

```text
GET    /comments/task/:taskId
POST   /comments/task/:taskId
DELETE /comments/:commentId
```

### Profile

```text
GET /profile
GET /test-db
```

## Kurulum

### Mobil uygulama

Proje kök dizininde:

```bash
npm install
npx expo start
```

Geliştirme sırasında Android cihazda Expo Go ile çalıştırılabilir.

### Backend

Backend klasörüne geç:

```bash
cd backend
npm install
npm run dev
```

Backend ortam değişkenleri `.env` dosyasında tutulmalıdır.

Örnek:

```env
LOCAL_DATABASE_URL=...
JWT_SECRET=...
```

> Gerçek veritabanı bağlantı bilgileri, şifreler ve JWT secret gibi gizli bilgiler GitHub'a gönderilmemelidir.

## Online Backend

Mobil uygulama Render üzerinde çalışan backend API'sini kullanmaktadır:

```text
https://task-management-app-xc7f.onrender.com
```

Backend PostgreSQL veritabanına Render üzerinden bağlanmaktadır.

## Android APK

Doğrudan Android cihaza kurulabilir APK, Expo EAS Build ile oluşturulabilir.

EAS hesabına giriş:

```bash
eas login
```

APK oluşturma:

```bash
eas build -p android --profile preview
```

`eas.json` içerisindeki `preview` profili Android APK üretmek üzere yapılandırılmıştır.

## Uygulama Ekranları

- Giriş
- Kayıt
- Panolarım
- Pano detay / Kanban görünümü
- Yeni pano
- Pano düzenleme
- Yeni kolon
- Kolon düzenleme
- Yeni görev
- Görev detayı
- Görev düzenleme
- Profil
- Ayarlar

## Öne Çıkan Teknik Özellikler

### Sürükle-Bırak

Görev kartları React Native Gesture Handler ve Reanimated kullanılarak sürüklenebilir. Görevler aynı kolon içerisinde yeniden sıralanabilir veya farklı kolonlara taşınabilir. Taşıma işlemi sonrasında yeni kolon ve sıra bilgisi backend'e gönderilir.

### Görev Arama ve Filtreleme

Pano detay ekranında görevler başlıklarına göre aranabilir ve önceliklerine göre filtrelenebilir. Arama ve filtreleme birlikte kullanılabilir.

### Tema Sistemi

Ayarlar ekranından açık, koyu veya sistem teması seçilebilir. Seçilen tema uygulama içerisinde kullanılır ve tercih Secure Store ile saklanır.

### Yorum Sistemi

Her görev için yorum eklenebilir. Yorumlarda kullanıcı adı/e-posta ve oluşturulma tarihi gösterilir. Kullanıcı kendi yorumunu silebilir.

### Form Doğrulama

Görev, pano, kolon, kullanıcı kayıt ve giriş işlemlerinde gerekli alan kontrolleri uygulanır. Görevlerde başlık ve açıklama uzunluğu, son tarih ve diğer alanlar için doğrulamalar bulunmaktadır.

## Geliştirme Durumu

Proje; kullanıcı yönetimi, pano/kolon/görev CRUD işlemleri, sürükle-bırak, görev atama, öncelik, son tarih, arama ve filtreleme, yorumlar, profil ve tema özelliklerini içeren çalışan bir MVP olarak geliştirilmiştir.

## Lisans

Bu proje eğitim ve staj çalışması kapsamında geliştirilmiştir.
