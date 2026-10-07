# Faz 9C — GraphUptime ve GraphCountdown

Başlangıç `main`, `77f1491`; çalışma ağacı temizdi. Upstream checkout komutla
`16d817ad5ec54d89142e4c1cf26027b60d6df853` olarak doğrulandı. Sistemden alınan
zaman: 2026-10-07 Çarşamba 04:33 (Europe/Istanbul).

## Okuyucu kararı ve doğrulanan sözleşme

9B `dated-calendar` okuyucusu UTC gün dizileri ve ay grid'i içindir. Uptime'ın
`from`/`to` alanları yalnız sunum metnidir; countdown ise milisaniye anı kullanır.
Bu nedenle 9B okuyucusuna ilgisiz API eklenmedi. Mevcut `clock.parseInstant`,
`formatHms` ve `useGraphNow` yeniden kullanıldı. `parseInstant` ikinci, varsayılanı
false olan `utc` parametresiyle geriye uyumlu genişletildi. Eski `GraphTimer`
çağrıları değişmedi. Registry'deki timer payload değişikliği yalnız ortak
yardımcının yeniden üretilmesidir.

Ortak `uptime-countdown` core modülü status tekrarlarını ve yazılı countdown
modelini okur; mevcut `words`, `splitDash` ve `visibleText` yeniden kullanılır.
Upstream'de özel item bileşeni yoktur; yeni item API'si eklenmedi. Host adaptörleri
Fragment içeriğini okur, custom component içeriğine girmez, `header-anchor`
metnini dışlar. VNode klonlama veya değiştirme yoktur.

Uptime önceliği `days` (boş dizi dahil) → Markdown kaynak metni. `*`/`×` tekrarları,
5000 tekrar tavanı ve emphasis işaretlerinin geri konması upstream ile aynıdır.
`empty` günler paydadan çıkarılır; yüzde en yakın tam sayıya yuvarlanır.
Glifler, durum tonları, satırlar, legend, tarih etiketleri ve ekran okuyucu özeti
korunur. `columns` statik numeric string de kabul eder.

Countdown önceliği `to` → yazılı tarih; `caption` → yazılı açıklama, `to` prop
verilmiş olsa da. `written` taşınabilir compiler modelidir. Upstream tek
`formatHms` metni gösterir; ayrı birim kutuları ve `aria-live` yoktur. Bu DOM ve
ekran okuyucu özeti korundu. SSR ve ilk hydration render'ında `00:00:00`
görünür; mount sonrası saat başlar, saniyede bir güncellenir, unmount sırasında
interval kaldırılır. Geçmiş hedef için mount sonrası `done` gösterilir.

Compiler aynı core modellerini üretir. Explicit `days`/`written` ve desteklenmeyen
fence içeriği açık runtime fallback verir. Countdown `to`/`caption` prop değerleri
compiler'ın bağımsız yazılı açıklama okumasını engellemez. Production VitePress
fixture'ındaki 21 figure, yedi senaryoda compiler/runtime/doğrudan props yollarını
karşılaştırır; softbreak, çoklu boşluk ve emphasis tekrarları dahildir.

## Testler ve düzeltilen beklentiler

Beş upstream örneği `components/docs/examples.tsx` içinden doğrulandı: ninety
days, incident window, written, freeze ve closed. Bağımsız JSON fixture'da
beklenen durumlar, glifler, yüzdeler ve sabit saate göre countdown değerleri
üretim okuyucularından türetilmeden tutulur. Runtime/model DOM eşitliği, attrs,
görünür SSR, hydration uyarıları, interval temizliği ve prop güncellemesi sınandı.

**60 yeni test**: Vue 47, Markdown 10, docs 3. Toplam **1186**; önceki toplam
1126 idi. Public/core export sözleşmeleri yeni API için genişledi; tüketici
figure beklentisi 43 → 45, registry öğe sayısı 47 → 49, kaynak dosya sayısı
96 → 100 oldu. Mevcut `public/r/**` ESLint ignore kuralı yeni payload dosyalarını
da kapsar; yeni kaynaklar lint kapsamındadır.

İlk test turunda countdown'ın mount sonrası render'ını beklemeyen testler
`nextTick` ile düzeltildi. Uptime seçicisi `GraphTrack` metnini de topluyordu;
seçici yalnız tick span'larına daraltıldı. `it.each` dizilerini tuple olarak
açtığı için boş aralık testi nesne girdisine çevrildi. Custom tone testindeki
varsayılan `text-graph-accent-1` beklentisi, kaynakta doğrulanan
`text-graph-accent` sınıfına düzeltildi. Üretim çıktıları bu test hatalarına göre
değiştirilmedi. Declaration kontrolü build sonrasında çalıştırıldı.

`UptimeCountdownTypes.vue` negatif kontrolünde kök `pnpm typecheck` çıktısı:

```text
Type '"bad"' is not assignable to type 'UptimeStatus'.
Type 'never[]' is not assignable to type 'string | number | Date | null | undefined'.
NEGATIVE_EXIT=1
```

Fixture byte içeriği `finally` ile geri yüklendi; son typecheck geçti.
NodeNext/Bundler tüketici kontrolü yanlış yeni prop tiplerini ayrıca reddeder.
Log: `C:/Users/zahid/source/github/tmp/mdxcn-vue/f9c-negative.log`.

UTC, Europe/Istanbul ve America/Los_Angeles süreçlerinde ICU locale'i `tr-TR`,
offset değerleri 0/-180/420 olarak doğrulandı. Built SSR ve ISO an hesapları
süreçler arasında eşit çıktı verdi. Artık yıl, geçersiz tarih, ay sınırı, DST,
boş aralık, non-finite değerler ve epoch sıfır sınandı. UTC ve Los Angeles
altında hydration dahil 47 Vue testi ayrı ayrı geçti.
Log: `C:/Users/zahid/source/github/tmp/mdxcn-vue/f9c-final-timezone-hydration.log`.

## Bilinçli farklar

- Countdown ISO tarih/saat string girdilerini UTC okur; timezone-free ISO saatine
  `Z` eklenir. Explicit offset korunur. Locale veya timezone'a bağlı olabilecek
  non-ISO string girdileri placeholder üretir. `Date` ve finite epoch değerleri
  korunur. Upstream'in `Date.parse` normalizasyonu korunur:
  `2023-02-29` → `2023-03-01`. Sayı metinleri locale'den bağımsızdır; ay adı
  biçimleme gerekmemektedir.
- Upstream `to ?` kontrolünün yok saydığı epoch sıfır countdown'da geçerli hedeftir.
- Upstream `status in STATUSES` kontrolünün yanlışlıkla kabul ettiği
  `constructor`, `toString`, `__proto__` girdileri elenir.
- Uptime `columns` finite tam sayıya normalize edilir, minimum 1; non-finite
  değerler varsayılan 30 olur. Fractional satır çakışmaları önlenir.
- React Motion yerine ortak `vReveal`: uptime satırı başına 50 ms, 240 ms tavan;
  countdown 0 ms. Her iki gecikme için test vardır. SSR görünürlüğü ve ortak
  reduced motion desteği korunur.

## Kabul ve kalan tarayıcı ölçümleri

Son kabul zinciri `pnpm install --offline --frozen-lockfile`, `pnpm -r build`,
`pnpm -r test`, `pnpm lint`, `pnpm typecheck`, `pnpm format:check`,
`pnpm consumer:check` komutlarını sıralı çalıştırır. Mevcut bağımlılıklar
kullanılır; lockfile değişmedi. Tam log:
`C:/Users/zahid/source/github/tmp/mdxcn-vue/f9c-final-acceptance.log`.

| Kontrol | Son çıktı |
| --- | --- |
| Install | `Lockfile is up to date, resolution step is skipped`; çıkış 0 |
| Build | Vue, Markdown, VitePress production build; çıkış 0 |
| Test | Vue **752 passed**, Markdown **360 passed**, docs **74 pass** |
| Lint/typecheck | ESLint ve üç workspace; çıkış 0 |
| Format | `All matched files use Prettier code style!` |
| Registry build/check | `49 items from library sources` |
| Registry CLI/kurulum | `49 items, 100 source files; typecheck and build passed` |
| Tüketici | `CONSUMER CHECK PASSED`; VitePress tüketicisinde 45 figure |

Son zincirde başarısız veya atlanan kontrol yoktur. Production build'in
beklenen explicit-prop/runtime-fallback uyarıları ve tüketici kurulumunun
mevcut deprecated bağımlılık uyarıları korunur.

Dev sunucusu, canlı tarayıcı/E2E ve npm yayını yapılmadı. Tarayıcıda dar
container yatay scroll, glif fontları, light/dark kontrastı, ekran okuyucunun
güncellenen summary davranışı, JS kapalı/reduced motion görünürlüğü, CLS ve
gerçek observer/WAAPI gecikmesi ölçülecek. SSR/hydration testleri bu ölçümlerin
yerine geçmez.

Commit açık izinle imzasız, hook atlamadan ve kalıcı git config değişikliği
olmadan atılır; ardından normal push yapılır. Son Git durumu ve kabul
çıktıları son mesajda bildirilir.
