# Faz 9B — GraphActivity ve GraphCalendar

Başlangıç `main`, `079ed1c`; çalışma ağacı temizdi. Upstream checkout komutla
`16d817ad5ec54d89142e4c1cf26027b60d6df853` olarak doğrulandı. Sistemden alınan
zaman: 2026-10-07 Çarşamba 04:28 (Europe/Istanbul).

## Okuyucu kararı ve doğrulanan sözleşme

Brifingde tarih işleme örneği olarak gösterilen `core/gantt-diff-waterfall.ts`
ISO tarih işlemez; sayısal aralıkları okur. Bu okuyucu genişletilmedi.
Upstream Activity ve Calendar, kendi dosyalarında ayrı UTC hesapları kullanır.
Yeni `core/dated-calendar.ts` içinde tarih, hafta ve ay hesapları birlikte
konumlandırıldı; ortak `numbers` ve `splitLabel` okuyucuları yeniden kullanıldı.
`Date.UTC`, UTC getter işlevleri ve sabit İngilizce ay adları kullanılır.
Upstream de bunları ve katkı sayısı için sabit `en-US` kullanır; bu alanda locale
veya timezone farkı getirilmedi. Clock okuyucusu değişmedi.

Upstream'de iki bileşenin de özel item bileşeni yoktur. Bu nedenle yeni bir
item API'si icat edilmedi: doğrudan liste adaptörü, `ActivityDay`,
`CalendarMark` ve taşınabilir `CalendarWrittenMark` modeli kullanıldı.
Tipli props, runtime adaptörleri, Markdown compiler, export sözleşmeleri,
registry ve tüketici yolları tamamlandı. `year`, `month`, `today` ve `max`
alanları Vue template kullanımında statik numeric string de kabul eder.
`weekStartsOn` upstream gibi `0 | 1` değeridir.

Activity önceliği: `days` (boş dizi dahil) → boş olmayan doğrudan liste → ham
metin satırları. `numbers` tekrarları genişletir. Upstream `sourceText` gibi
Markdown emphasis işaretleri geri konur ve paragraph sınırları newline
üretir. Mevcut seri adaptörünün `visibleText` işlevi yalnız dışa açıldı;
mevcut davranışı değişmedi. Eksik günler sıfır, sınır dışı padding şeffaftır.
Aynı tarih tekrarlandığında ızgarada son count kazanır; toplam ve gün sayısı
ham dizideki tüm girdileri sayar. Ay adı yalnız aralıktaki ayın ilk günü için
çıkar. `caption === false` ve `legend === false` birlikte footer'ı kaldırır.

Calendar önceliği: string `marks` → `marks` prop (boş dizi dahil) → liste.
`today` prop verilmezse ilk bold liste günü seçilir; `marks` prop bu okumayı
engellemez. Compiler yalnız `written` taşır; bu yüzden `marks` ve `today`
prop verilmiş içerik de derlenebilir. Notlar gün sırasına konur, false accent
ve ay dışı notlar korunur. Summary, false accent taşıyanlar dahil Map
anahtarlarını upstream gibi sayar. Gün label'ı `parseInt` ile okunur.

VNode klonlama/değiştirme yoktur. Fragment şeffaf, custom component opaktır;
`header-anchor` metni dışlanır. İç içe listeler üst satırın metnine katılmaz;
bu, mevcut Vue okuyucu yaklaşımıyla tutarlı sınırdır. Compiler'ın mevcut inline
whitespace okuyucusu geriye uyumlu source seçeneğiyle genişletildi. Softbreak,
çoklu boşluk ve inline elementler arasındaki newline, runtime ile aynı sonucu
verir. Fence içeriği sessizce atılmaz; açık runtime fallback üretir.

## Testler ve düzeltilen beklentiler

Altı upstream örneği bağımsız JSON fixture ile kapsanır: written/year/quarter
Activity ve notes/marked days/Sunday start Calendar. Tarih dizileri ve beklenen
glifler fixture'da sabittir; üretim okuyucularından türetilmez. Runtime/model/
doğrudan props DOM eşitliği, görünür SSR, attrs ve uyarısız hydration sınandı.
Production VitePress fixture'ındaki 27 figure dokuz senaryoda üç yolu karşılaştırır.
Run token'ının Markdown emphasis'e dönüşmesi, softbreak, çoklu boşluk ve
`marks` prop verilirken listedeki bold günün today olarak kalması dahildir.

Artık yıl, ay/yıl sınırı, DST günleri, boş aralık, malformed ISO, tekrar eden
tarih, ay taşması ve non-finite ay girdileri sınandı. Upstream `Date.UTC`
normalizasyonu korunur: `2023-02-29` → `2023-03-01`, ay 13 sonraki yıl ve
0001 yılı 1901 olur. Activity için biçimi geçersiz ISO girdileri atlanır;
geçersiz girdiler upstream'deki olası `RangeError` yerine boş grid üretir.
Bu bilinçli güvenilirlik farkıdır; ham day toplamı ve sayısı korunur.
Calendar geçersiz ayın grid hesabında UTC taşmasını korur; month adı summary'de
upstream gibi boş, varsayılan title'da `undefined` kalır.

İlk test turunda Vue'nun absent Boolean cast işlemi yüzünden caption'ın false
olması bulundu; `default: undefined` ile varsayılan katkı özeti düzeltildi.
Calendar compiler'ın liste dışı fence'i atlaması da düzeltildi. İlk test
selector'ı Graph frame köşelerinin `leading-none` sınıfını da topluyordu;
selector aktivite grid'iyle sınırlandı, glif beklentisi değiştirilmedi.
VitePress config callback'i void döndürecek biçimde düzeltildi. Son incelemede
ay taşması summary'si düzeltildi ve ayrı test eklendi. Bu sırada çalışan ilk
tüketici kontrolü eski registry payload nedeniyle kırmızı oldu; registry
tekrar üretildi ve son kabul zinciri değişiklik yapılmadan yeniden çalıştırıldı.
Mevcut dosyaların satır sonları korundu.

**61 yeni test**: Vue 47, Markdown 11, docs 3. Güncel toplam **1126**;
başlangıç toplamı 1065'tir. Mevcut beklentiler public/core export listeleri ve
tüketici figure sayısı (41 → 43) için genişledi. Registry öğe sayısı 45 → 47,
source closure sayısı 92 → 96 oldu. Yeni registry JSON çıktıları ESLint ignore
listesine alındı; kaynak kod lint kapsamındadır.

`DatedCalendarTypes.vue` negatif kontrolü kök `pnpm typecheck` ile çalıştırıldı:

```text
Activity.count: Type 'string' is not assignable to type 'number'.
Calendar.year: Type 'never[]' is not assignable to type 'string | number'.
Calendar.accent: Type 'string' is not assignable to type 'boolean | undefined'.
NEGATIVE_EXIT=1
```

Fixture byte içeriği `finally` ile geri yüklendi; sonraki typecheck geçti.
Tüketici Bundler/NodeNext kontrollerinde yanlış yeni prop tipleri ayrıca reddedilir.
Negatif kontrol log'u: `C:/Users/zahid/source/github/tmp/mdxcn-vue/f9b-negative.log`.

`tr-TR` process locale'i ICU'dan doğrulandı. UTC, Europe/Istanbul ve
America/Los_Angeles süreçlerinde yerel offset'ler 0/-180/420 olarak doğrulandı;
built SSR çıktıları byte düzeyinde aynıydı. UTC ve America/Los_Angeles altında
46 bileşen testi ayrıca çalıştırıldı; hydration dahil tümü geçti. Bu koşul
log'u: `C:/Users/zahid/source/github/tmp/mdxcn-vue/f9b-timezone-hydration.log`.

## Kabul çıktısı

Son zincir sıralı çalıştırıldı. `pnpm install --offline --frozen-lockfile`
mevcut lockfile ve yerel bağımlılıkları kullandı; lockfile değişmedi.

| Kontrol | Çıktı |
| --- | --- |
| Install | `Lockfile is up to date, resolution step is skipped`; çıkış 0 |
| Build | Vue, Markdown ve VitePress production build; çıkış 0 |
| Test | Vue **705 passed**, Markdown **350 passed**, docs **71 pass** |
| Lint/typecheck | ESLint ve üç workspace; çıkış 0 |
| Format | `All matched files use Prettier code style!` |
| Registry build/check | `47 items from library sources` |
| Registry CLI/kurulum | `47 items, 96 source files; typecheck and build passed` |
| Tüketici | `CONSUMER CHECK PASSED`; kayıtlı VitePress tüketicisinde 43 figure |

Tam log: `C:/Users/zahid/source/github/tmp/mdxcn-vue/f9b-acceptance.log`.
Son kabul zincirinde başarısız veya atlanan kontrol yoktur. Son Git durumu
son mesajda komut çıktısıyla bildirilir.
Mevcut fallback uyarıları ve registry CLI bağımlılıklarının deprecated uyarıları
beklentileri gevşetmeden korunur.

## Bilinçli farklar ve tarayıcıda kalan ölçümler

React Motion yerine ortak `vReveal` kullanılır: Activity hafta başına 10 ms,
Calendar hafta/not başına 40 ms, her ikisinde 240 ms tavan ve ayrı tavan testleri.
SSR görünür; reduced motion ortak directive tarafından desteklenir. Motion'ın
geçici transform/opacity sınıfları yerine Vue directive yaşam döngüsü kullanılır.
Vue figure/caption ilişkisi korunur. `written` compiler modelidir; static numeric
string props ve malformed ISO davranışı yukarıda açıklanan ek uyarlamalardır.

Dev sunucusu, canlı tarayıcı/E2E oturumu ve npm yayını yapılmadı.
Tarayıcıda dar container/yıl ızgarası yatay scroll, ay adlarının çakışması,
uzun takvim notları, glif fontları, light/dark kontrastı, ekran okuyucu sırası,
JS kapalı/reduced motion görünürlüğü, CLS ve gerçek observer/WAAPI gecikmesi
ölçülecek. SSR/hydration testleri bu ölçümlerin yerine geçmez.

Commit açık izinle imzasız, hook atlamadan ve kalıcı git config değişikliği
olmadan atılır; ardından normal push yapılır. `GraphUptime` ve `GraphCountdown`
kapsam dışı bırakıldı. Diff, gerçek çağıranlar ve kabul sonuçları üzerinden
kod incelemesi yapıldı; açık kalan bir kod bulgusu yoktur.
