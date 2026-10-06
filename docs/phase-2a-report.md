# Faz 2A raporu

Doğrulama: 2026-10-06 Salı 21:43 (sistemden alınan Europe/Istanbul zamanı).

Faz 1 temizliği ayrı commit olarak tamamlandı: cache takibi kaldırıldı,
`.gitignore` düzeltildi, TypeScript sürüm gerekçesi eklendi, kökteki gereksiz
DevTools bağımlılığı kaldırıldı ve README ağ erişimi notu eklendi. npm sorguları
`typescript` latest `7.0.2` ve `typescript-eslint@8.71.1` peer tavanı `<6.1.0`
değerlerini doğruladı. Geliştirme sürümü `6.0.3` kaldı.

Çekirdek; framework bağımsız prose/satır/segment modelini, upstream saf palet ve
glif işlevlerini, sayı/etiket yardımcılarını ve bağımsız `paintRow` fixture'larını
içerir. Dokuz frame bileşeni ile `GraphStack` render işlevleriyle yazıldı. Vue
peer/external kaldı; `.d.ts` çıktıları üretildi. Üç CSS girişi export edildi,
`sideEffects` korundu; dağıtılan `graph.css` içindeki `@source './'` yolu paket
JavaScript çıktısını tarar. MIT lisansı paket içinde korunur; Svelte kaynak kodu
alınmadı.

## Kabul çıktısı

| Komut               | Sonuç                                                 |
| ------------------- | ----------------------------------------------------- |
| `pnpm install`      | `Already up to date`, çıkış 0                         |
| `pnpm -r build`     | İki paket ve VitePress production build, çıkış 0      |
| `pnpm -r test`      | 62 Vue + 1 Markdown iskeleti + 4 docs = 67 test geçti |
| `pnpm lint`         | Hata/uyarı yok, çıkış 0                               |
| `pnpm typecheck`    | Üç workspace projesi geçti, çıkış 0                   |
| `pnpm format:check` | `All matched files use Prettier code style!`, çıkış 0 |

`git ls-files apps/docs/.vitepress/cache` boş. Cache dosyaları yerelde korunur,
Git takibinden çıkarılmıştır. Commit ve push sonrası çalışma ağacı ayrıca kontrol
edilir; commit kimlikleri son kullanıcı raporunda verilir.

## Test listesi

| Dosya                                        | Test sayısı | Doğrulanan davranış                                                                                                                                                                                                       |
| -------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/mdxcn-vue/test/core.test.ts`       | 24          | Sayı dönüşümü (8), etiket ayırma (1), regex (5), prose dilimleme (1), dağıtım/legend (4), glif/palet/yoğunluk/track işlevleri (5)                                                                                         |
| `packages/mdxcn-vue/test/stack.test.ts`      | 16          | Adaptör (6), DOM/tick/erişilebilirlik (1), keyed rows/item/Markdown güncellemesi (3), mono metin kontrastı (1), üç girişli SSR (3), SSR→hydration (1), frame/prose (1)                                                    |
| `packages/mdxcn-vue/test/reveal.test.ts`     | 15          | Observer sırası, düşük kesişme oranı, opacity/stagger/transform, ilk viewport, reduced motion başlangıcı/değişimi/yeniden kontrolü, WAAPI iptali, unmount/bitiş temizliği, observer/animasyon hatası ve eksik API yolları |
| `packages/mdxcn-vue/test/styles.test.ts`     | 5           | Light/dark kontrastı (2), CSS export/host sınırı (1), altı utility ve çerçeve (1), 14 kapsayıcı accent ve gradient (1)                                                                                                    |
| `packages/mdxcn-vue/test/smoke.test.ts`      | 2           | Mevcut smoke varsayılan/özel metni                                                                                                                                                                                        |
| `packages/mdxcn-markdown/test/index.test.ts` | 1           | Mevcut iskelet işareti; Markdown derlemesi değildir                                                                                                                                                                       |
| `apps/docs/test/config.test.mjs`             | 2           | Development DevTools birlikte, production DevTools yok                                                                                                                                                                    |
| `apps/docs/test/stack-build.test.mjs`        | 2           | Beş gerçek VitePress örneğinin HTML çıktısı, üç girişin aynı değerleri/tick sayısı, SSR görünürlüğü ve paket kaynak taramasından üretilen CSS                                                                             |

SSR→hydration testi jsdom içinde gerçek `renderToString` ve `createSSRApp.mount`
kullanır; HTML ve caption kimliklerinin eşitliğini, hydration uyarısı olmadığını
doğrular. Gerçek tarayıcı ölçümü yerine geçmez. WAAPI ve observer davranışı
kontrollü taklitlerle sınandı; canlı animasyon ölçülmedi.

## Kararlar ve sınırlar

- Item adaptörü yalnız kayıtlı `Bar`/`Segment` türlerini kabul eder. `Fragment`
  açılır; `Comment` elenir; ham string/number girdileri Text VNode biçimine alınır.
  Kendi prop şeması kebab→camel dönüşümü, boolean boş değer ve varsayılanları
  uygular. Slotlar her render sırasında okunur; `computed` kullanılmaz. Özel
  wrapper bileşenlerin render ağacı açılmaz.
- Markdown okuyucusu yalnız slot kökündeki `ul > li` yapısını kabul eder;
  `p`/`span` ve text/strong/em/code/link içeriğini korur. Zengin satır etiketi
  `labelContent` alanında, düz etiket `label` alanında taşınır. Düz Markdown
  etiketine fazladan `labelContent` eklenmez; üç giriş biçimi model alanları
  ayıklanmadan birebir eşitlikle sınanır. İç içe listeler ve genel VNode ağaçları
  yorumlanmaz. Veri girdisinde Vue `children` yerine tipli
  `segments` kullanılır. Aynı satır etiketlerinin benzersiz olması gerekir.
- Girdi önceliği truthy `rows` (boş dizi dahil) → boş olmayan Markdown liste →
  item satırları. Segment dizisi (boş olsa da) item segmentlerini bastırır.
  `48 js, 22 css, 30 images` ve `1,200 js` düzeltildi. Negatif/yerel sayı biçimleri
  ve çok kelimeli segment etiketleri bu regex için destek sözleşmesi değildir.
- `v-reveal` SSR sırasında gizleyen stil üretmez. Observer başarıyla kurulunca
  yalnız viewport dışındaki öğe gizlenir; ilk viewport içeriği yeniden gizlenmez.
  `threshold: 0`, `rootMargin: 0px 0px -24px 0px`, 220ms, 8px ve
  `cubic-bezier(.215,.61,.355,1)` kullanılır. `delay` milisaniyedir; satır stagger
  değeri 50ms'dir. Hedef opacity ve mevcut transform korunur. Tercih değişimi
  bekleyenleri açar ve aktif animasyonu iptal eder.
- Normal metin için `--graph-muted` light `oklch(0.48 0 0)`, dark
  `oklch(0.68 0 0)` seçildi. Nötr OKLCH için luminance `L³` üzerinden, arka plan
  `0.985`/`0.11` ile kontrast **6.262:1 / 7.100:1** hesaplandı ve test edildi.
  Lejant satırındaki `0.4` opacity metinden dekoratif glife taşındı; upstream'e
  karşı bilinçli erişilebilirlik farkıdır. Özel host arka planı ayrıca ölçülmeli.
- İnceleme, `text-graph-accent` utility sınıfının gradient başlığın transparent
  rengini ezebildiğini gösterdi; birleşik seçiciyle öncelik düzeltildi ve production
  CSS testine eklendi. Gradient preset'leri kapsayıcıda kendi değerlerini kurar;
  solid preset'ler gradient değerini sıfırlar. Temanın varsayılan accent rengi
  ocean; gradient başlık için ilgili `data-accent` preset'i kullanılır.
- Mevcut İngilizce README/docs dili korundu; yeni faz raporu ve mimari sözleşme
  Türkçe. ESLint yalnız bilinen upstream tek sözcüklü adları kabul eder;
  render işlevi modülleri için SFC dosya/prop varsayılan kuralları uygulanmaz.

## Tarayıcı ölçümü

Dev sunucusu başlatılmadı. Sayfa: `/components/graph-stack`.

1. 375/768/1280 genişliklerinde light/dark ölçümü: ilk üç BUNDLE örneği aynı
   görünmeli; marketing 12/5/7, docs 7/4/13 tick; çerçeve 2px çizgi + 5px boşluk,
   1px kalınlık, dört 16×16 köşe. Başlık/padding/taşma referansla karşılaştırılmalı.
2. TOKENS: 28 tick için 17/8/3 dağıtımı; mono glifleri kısmen soluk, metin tam
   opacity; scoped sunset örneğinde duo renk ve gradient başlık görülmeli.
3. İlk viewport içeriği hydration sırasında gizlenmemeli; aşağıdaki satırlar
   scroll ile 220ms/50ms animasyon yapmalı. Uzun öğe, JS yüklenme hatası, tercih
   değişimi ve unmount sonrası aktif animasyon/dinleyici kontrol edilmeli.
4. Kapsayıcı accent seçimi komşu örneğe taşmamalı. Geist Mono yüklenince font ve
   glif ölçüsü referansla karşılaştırılmalı. Ekran okuyucuda caption ilişkisi ve
   satır özetleri, dekoratif gliflerin okunmadığı doğrulanmalı.

## Faz 2B önerileri

`docs/markdown-contract.md` sözleşmesine göre `markdown-it` token → tipli props
derlemesi; kaynak konumlu tanılar ve sayı grammar kararı; zengin prose ve güvenli
link davranışı; temiz npm/registry tüketim fixture'ları; gerçek tarayıcı
hydration/animasyon/görsel matris kapısı. Diğer bileşenler ve Comark bu fazda
uygulanmadı.
