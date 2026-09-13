# Hızlı başlangıç

Bu paket Arapça eğitim platformunun çalışan Next.js kaynak kodudur. Ana sayfa, kurslar, kayıt, yönetim paneli, veritabanı şeması, e-posta şablonları ve kullanım belgeleri dahildir.

## Bilgisayarınızda açma

Node.js 22 veya üzeri ve pnpm ile proje klasöründe:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Ardından `http://127.0.0.1:3000` adresini açın. Bu masaüstü ortamında gerekirse `pnpm dev:desktop` kullanın.

## Gerçek kayıtları açma

1. `.env.example` dosyasını `.env.local` olarak kopyalayın.
2. Kendi Supabase projenizin sunucu bilgilerini ekleyin ve iki SQL migration dosyasını sırasıyla çalıştırın.
3. Supabase üzerinden gerçek yönetici hesabınızı oluşturun, UUID'sine `admin` rolünü verin.
4. E-posta sağlayıcısını ve gönderim zamanlayıcısını yapılandırın.
5. `/admin/course` ekranından gerçek tarih, ücret ve kontenjanı girip kayıtları açın.
6. Vercel'de alan adınızı `NEXT_PUBLIC_SITE_URL` olarak tanımlayıp projeyi derleyin.

Anahtarları sohbetten paylaşmanız gerekmez; yerel ortam dosyasına veya barındırma hizmetinin güvenli ortam değişkenlerine girin. Ayrıntılı komutlar ve SQL örneği `README.md` içindedir.

## Yerel demo/test

```sh
node scripts/fixture-server.mjs
```

`http://127.0.0.1:3001` üzerinde sarı test etiketiyle çalışır. Yönetici: `admin@example.test`, parola: `Local-test-only-2026!`. Bunlar yalnızca yerel, geçici test sunucusuna aittir. Gerçek sitede çalışmaz; gerçek e-posta göndermez. Sunucu yeniden başladığında test verileri silinir.

`QA.md` tamamlanan testleri ve gerçek hizmetlere bağlandıktan sonra yapılması gereken kontrolleri açıklar. Site henüz herkese açık bir hesaba yayımlanmamıştır.
