# Canlı yayınlama rehberi

Bu uygulama Vercel üzerinde çalışan Next.js sunucusu, Supabase veritabanı ve kimlik doğrulaması, Resend e-posta servisi için hazırlanmıştır. GitHub kaynak kodunu ve otomatik kontrolleri barındırır; kayıt API'leri ve yönetim paneli nedeniyle GitHub Pages bu uygulamanın yayınlama hedefi değildir.

Bu rehberde hesap, alan adı, anahtar veya canlı bağlantı uydurulmamıştır. Depoya kod göndermek, veritabanını kurmak veya siteyi internette görmek tek başına canlı kayıt akışının tamamlandığı anlamına gelmez. Son bölümdeki kabul kontrolleri gerçek hizmetlerle yapılmalıdır.

## 1. Hesaplar ve hizmet planı

- Kaynak kod için kullanıcıya ait özel GitHub deposu.
- Uygulamayı çalıştırmak için Vercel hesabı.
- Kayıtlar ve yönetici hesabı için Supabase projesi.
- Gerçek öğrencilere e-posta için Resend hesabı ve sahibinin DNS kayıtlarını yönetebildiği bir alan adı.

Vercel Hobby, kişisel ve ticari olmayan kullanım içindir. Ücretli eğitim programı için ticari kullanıma uygun bir plan seçilmelidir. Bu proje hiçbir ücretli planı, alan adı satın alımını veya aboneliği kendiliğinden etkinleştirmez. Güncel koşullar için [Vercel plan açıklamasını](https://vercel.com/docs/plans/hobby) inceleyin.

## 2. Supabase veritabanı ve yönetici

1. Yeni bir Supabase projesi oluşturun. Bölgeyi öğrencilerin erişimi ve veri saklama gereksinimleriniz için seçin; veritabanı parolasını güvenli parola yöneticinize kaydedin.
2. SQL Editor içinde önce `supabase/migrations/001_academy.sql`, ardından `supabase/migrations/002_management.sql` dosyasını çalıştırın. Bunlar yeni proje içindir; mevcut üretim veritabanında tekrar tekrar çalıştırmayın.
3. Authentication bölümünde kendi gerçek e-posta adresiniz ve güçlü bir parola ile yönetici kullanıcısını oluşturun. Gerekmiyorsa genel kullanıcı kaydını kapatın. Öğrenci başvuru formu Supabase Auth hesabı oluşturmaz.
4. Oluşturduğunuz kullanıcının UUID değerini aşağıdaki SQL'e yazıp çalıştırın:

```sql
insert into public.profiles (id, role)
values ('GERCEK_AUTH_KULLANICI_UUID', 'admin');
```

5. Projenin URL'sini ve uygulama anahtarlarını alın. Supabase güncel olarak `sb_publishable_...` ve `sb_secret_...` anahtarlarını önerir. Uygulamanın mevcut ortam değişkeni adları eski terimleri kullanır: publishable anahtarı `SUPABASE_ANON_KEY`, secret anahtarı `SUPABASE_SERVICE_ROLE_KEY` değerine girilir. Bunlar anahtarı Supabase SDK'ya aktaran değişken adlarıdır. Eski `anon` ve `service_role` anahtarlarıyla yapılandırılmış mevcut projelerde geçiş ayrı yürütülebilir. [Supabase anahtar türleri](https://supabase.com/docs/guides/getting-started/api-keys)

`secret` / `service_role` anahtarı veritabanı erişim sınırlarını aşabilen sunucu yetkisi taşır. Yalnızca sunucunun ortam değişkenine girin; GitHub dosyalarına veya `NEXT_PUBLIC_` değişkenlerine koymayın. Anahtarları sohbet mesajında paylaşmak gerekmez.

İlk kurs ve dönem migration ile oluşturulur. Gerçek tarih, ücret veya kontenjan varsayılmaz; başlangıçta kayıt kapalıdır.

## 3. Vercel ortam değişkenleri

Vercel projesinin Production ortamına `.env.example` içindeki değişkenleri girin. Yerel geliştirmede aynı değerler git tarafından dışlanan `.env.local` dosyasında tutulabilir.

| Değişken | Değer / kullanım |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Öğrencilerin açacağı kesin HTTPS origin; yol içermeden, örneğin kendi alan adınız veya Vercel'in size atadığı proje adresi |
| `SUPABASE_URL` | Kendi Supabase proje URL'niz |
| `SUPABASE_ANON_KEY` | Projenin publishable anahtarı; eski projelerde anon anahtarı |
| `SUPABASE_SERVICE_ROLE_KEY` | Projenin sunucu secret anahtarı; eski projelerde service_role anahtarı |
| `RATE_LIMIT_SECRET` | Sadece bu amaç için üretilen rastgele 32 baytlık gizli değer |
| `EMAIL_PROVIDER` | `resend` |
| `RESEND_API_KEY` | Kendi Resend gönderim API anahtarınız |
| `EMAIL_FROM` | Doğrulanmış alan adındaki gönderen adresiniz; görünen ad eklenebilir |
| `ADMIN_NOTIFICATION_EMAIL` | Başvuru bildirimlerini alacak gerçek e-posta adresiniz |
| `CRON_SECRET` | E-posta kuyruğu zamanlayıcısı için farklı bir rastgele 32 baytlık gizli değer |
| `CONTACT_EMAIL` | Sitede görünmesini istediğiniz gerçek iletişim adresi; isteğe bağlı |
| `CONTACT_WHATSAPP` | Ülke koduyla birlikte gerçek WhatsApp numarası; isteğe bağlı |
| `CONTACT_LINKEDIN` | Gerçek LinkedIn profil URL'niz; isteğe bağlı |

İki bağımsız rastgele değer üretmek için aşağıdaki komutu kendi terminalinizde iki kez çalıştırın. Çıktıyı yalnızca ilgili gizli değişkene kopyalayın:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

`NEXT_PUBLIC_SITE_URL` özellikle önemlidir: uygulama form isteklerinin origin değerini bununla karşılaştırır ve SEO bağlantılarını bundan üretir. `www` ile kök alan adı, `localhost` ile `127.0.0.1` farklıdır. Birincil adresi belirleyip diğer adresi ona yönlendirin. Adres değişince ortam değişkenini değiştirin ve yeniden deploy edin.

Yayından önce yerel `.env.local` veya terminal ortamıyla `pnpm deploy:check` çalıştırın. Bu komut yapılandırmanın biçimini, zorunlu değişkenleri, HTTPS origin'i ve gizli değer gereksinimlerini kontrol eder; anahtar değerlerini yazdırmaz. Eksik yapılandırmada başarısız olması beklenir. Gerçek Supabase bağlantısını veya e-posta teslimini doğrulamaz; bunlar son kabul kontrollerinde ayrıca test edilir.

Önizleme dağıtımlarına üretim veritabanı ve e-posta anahtarlarını otomatik kopyalamayın. Görsel önizleme hizmet anahtarları olmadan çalışır; kayıt ve giriş açıkça kullanılamaz görünür. Tam önizleme testleri için ayrı Supabase projesi, ayrı alıcılar ve o önizlemeye ait kesin origin kullanın.

## 4. GitHub'dan Vercel'e yayın

1. GitHub deposunda `package.json`, `pnpm-lock.yaml`, `app/` ve `vercel.json` aynı kökte olacak şekilde bu uygulama klasörünü kullanın. `.env.local`, `.vercel`, `node_modules`, `.next` ve test çıktıları depoya girmez.
2. GitHub Actions altında **Application checks** çalışmasının başarılı olduğunu kontrol edin. İş akışı kilitli bağımlılıkları kurar, SQL/form/e-posta testlerini, üretim derlemesini ve TypeScript kontrolünü çalıştırır. Üretim anahtarı istemez ve kendi başına yayın yapmaz.
3. Vercel'de yeni proje oluşturup bu özel GitHub deposunu içe aktarın. GitHub uygulamasına mümkünse yalnızca bu depo için erişim verin.
4. Root Directory, `package.json` bulunan dizin olmalıdır. Uygulama deponun köküne yüklenmişse boş bırakın. Daha büyük bir depo içinde duruyorsa gerçek alt dizini seçin.
5. Framework **Next.js**; Node.js **22.x** seçin. `vercel.json`, kurulum komutunu `pnpm install --frozen-lockfile`, derlemeyi `pnpm build` olarak belirler. Output Directory ve Function Runtime ayarlarını Next.js varsayılanlarında bırakın.
6. Önceki bölümdeki ortam değişkenlerini girip deploy edin. Henüz kesin proje URL'si bilinmiyorsa ilk dağıtım adresini aldıktan sonra `NEXT_PUBLIC_SITE_URL` değerini düzeltip yeniden deploy edin; bu aşamada kayıtları açmayın.
7. Vercel Domains bölümünde kendi alan adınızı ekleyin; yalnızca panelin sizin alan adınız için gösterdiği DNS kayıtlarını uygulayın. HTTPS ve birincil alan adı yönlendirmesini kontrol edin.

Vercel proje ayarları ve ortam değişkenleri yeni derlemelerde etkili olur. [Vercel yapılandırma](https://vercel.com/docs/project-configuration/vercel-json), [ortam değişkenleri](https://vercel.com/docs/environment-variables).

Depo yeni değişiklikler aldığında Vercel yeniden dağıtım oluşturabilir. GitHub CI ve Vercel derlemesi ayrı kontrollerdir; GitHub testleri başarısızken üretime geçişi engellemek istiyorsanız `main` dalında başarılı **Test and production build** kontrolünü zorunlu kılan branch ruleset ayarlayın ve değişiklikleri pull request ile birleştirin.

## 5. Gerçek e-posta gönderimi

1. Resend'de sahibi olduğunuz bir alan adını veya gönderim alt alan adını ekleyin.
2. Resend panelinin gösterdiği SPF ve DKIM DNS kayıtlarını alan adı sağlayıcınızda tanımlayın. Var olan e-posta kayıtlarını rastgele değiştirmeyin; panelde verilen tam ad/değeri kullanın.
3. Alan adı doğrulandıktan sonra aynı alan adıyla `EMAIL_FROM` tanımlayın ve API anahtarını Vercel'e girin. Test gönderen adresinin gerçek öğrencilere gönderim için hazır olduğunu varsaymayın.
4. Kendi kontrolünüzdeki bir e-posta adresiyle başvuru yapın. Öğrenci onayı ve yönetici bildiriminin gerçekten ulaştığını, Arapça RTL görünümünü ve kayıt numarasını kontrol edin. [Resend alan adı doğrulama](https://resend.com/docs/dashboard/domains/introduction)

E-postalar veritabanındaki `email_outbox` kuyruğuna yazılır. Kayıt sonrası ilk gönderim denenir; kesinti veya hata sonrasında kuyruğu tekrar çalıştıran zamanlayıcı gerekir. `/admin/emails` gönderim durumlarını gösterir. İletişim formu mesajları `/admin/messages` içinde saklanır; bu form kendiliğinden kişilere yanıt göndermez.

## 6. E-posta kuyruğu zamanlayıcısı

Çalıştırılacak istek:

```text
GET https://GERCEK-SITE-ADRESINIZ/api/cron/email
Authorization: Bearer CRON_SECRET_DEGERINIZ
```

Gizli değeri URL sorgu parametresine yazmayın. Zamanlayıcının güvenli başlık ayarını kullanın. Yetkisiz istek `401` döndürmelidir; doğru yapılandırılmış çalışmada `configured: true` beklenir. `sent: 0`, kuyruğun boş olabileceğini gösterir; tek başına hata değildir.

İki seçenek vardır:

- Dakikalık çalışmaya uygun mevcut Vercel planınız varsa, `vercel.json` dosyasına `crons` ayarı ekleyebilirsiniz. Vercel, `CRON_SECRET` değerini Authorization başlığıyla gönderir. Beş dakikada bir deneme bu uygulama için uygun başlangıç sıklığıdır.
- Kendi güvenilir zamanlayıcınız veya ayrı bir zamanlama hizmeti aynı URL'yi beş dakikada bir güvenli başlıkla çağırabilir. Bu hizmete verilen secret sadece bu görev için olmalıdır.

Hazır `vercel.json` dosyasında cron etkin değildir; böylece bilinmeyen bir hizmet planına ücretli veya uyumsuz zamanlama dayatılmaz. Resmî belgelerde Vercel Hobby cron sıklığı günde bir kezle sınırlıdır; bu gecikme normal e-posta tekrarları için uygun değildir. [Cron plan sınırları](https://vercel.com/docs/cron-jobs/usage-and-pricing), [cron kimlik doğrulaması](https://vercel.com/docs/cron-jobs/manage-cron-jobs).

## 7. Kayıtları açmadan önce kabul kontrolleri

- [ ] Gerçek alan adında HTTPS, Arapça sayfalar, mobil/tablet/masaüstü RTL ve klavye odakları doğru.
- [ ] `/admin/login` gerçek yöneticiyle açılıyor; giriş yapmadan yönetim API'leri ve CSV dışa aktarma reddediliyor.
- [ ] `/admin/course` içinde gerçek tarihler, saat dilimi, kontenjan, ücret/para birimi, son başvuru tarihi ve iletişim bilgileri girildi. Belirlenmemiş burs, sertifika veya iş birliği vaadi eklenmedi.
- [ ] Kontrollü bir başvuru kaydoluyor; onay sayfasındaki UUID ile yönetim panelindeki kayıt eşleşiyor.
- [ ] Hatalı form ve yinelenen e-posta doğru hata gösteriyor. Başka bir origin'den gönderim kabul edilmiyor.
- [ ] Gerçek e-posta gelen kutusuna öğrenci onayı ve yönetici bildirimi ulaştı; e-posta kuyruğu tekrar görevi çalışıyor.
- [ ] Onaylama, bekleme listesi, iptal/red, not, ödeme durumu, arama/filtre ve Türkçe/Arapça karakterleri koruyan CSV doğru çalışıyor.
- [ ] Ayrı test döneminde veya test projesinde dolu kontenjan, bekleme listesi ve kapalı kayıt durumları doğrulandı; test kayıtları gerçek öğrenci başvurusu gibi gösterilmiyor.
- [ ] `/privacy`, `/terms`, `/sitemap.xml`, `/robots.txt` ve paylaşım kartı doğru alan adını kullanıyor. Gizlilik metni gerçek operasyonu yansıtıyor.
- [ ] Üretim anahtarları GitHub'a girmedi; Supabase yedekleme ve veri silme taleplerini işleme sorumlusu belirlendi.
- [ ] Bu kontrollerden sonra kayıt durumu açık seçilip kayıt anahtarı etkinleştirildi.

`QA.md` yerelde hangi kontrollerin yapıldığını açıklar. Canlı hizmet ve gerçek cihaz testleri yapılmadan tamamlandı olarak işaretlenmemelidir. Kayıtları durdurmak gerektiğinde `/admin/course` üzerinden kaydı kapatın; mevcut başvurular veritabanında korunur.
