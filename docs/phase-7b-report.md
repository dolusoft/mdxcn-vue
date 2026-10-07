# Faz 7B — Faq ve GraphBoard

Başlangıç `main`, `fe62bd3`; çalışma ağacı temiz, upstream checkout
`16d817ad5ec54d89142e4c1cf26027b60d6df853` komutla doğrulandı.
Sistem zamanı `Get-Date` çıktısından: 2026-10-07 Çarşamba 03:14
(Europe/Istanbul).

## Brifingden düzeltilen varsayımlar

- Upstream `Faq` accordion değildir: `ol`, `li`, soru paragrafı ve sürekli
  görünür `GraphProse` yanıtı kullanır. Açılır içerik, düğme, `aria-expanded`
  veya ek klavye etkileşimi eklenmedi. Yanıtlardaki native bağlantılar normal
  klavye davranışını korur; dekoratif soru işareti `aria-hidden` taşır.
- Upstream `GraphBoard` tablo okumaz: `headingSections` ve `listItems`
  kullanır. Inventory satırındaki doğru biçim `sections` olduğundan
  brifingdeki `sections-table`, `th scope` ve kaydırma bölgesi talepleri
  uygulanmadı. Responsive grid, adlandırılmış `section`, `ul role=list`,
  dekoratif gizli işaretler, yatay/dikey ayraçlar ve sayım özeti korundu.
- İkisinin de upstream item bileşeni yoktur. Yeni marker API icat edilmedi;
  adaptör başlıkları ve Board liste öğelerini okur.
- Faz 7A raporundaki 702 sayısına başlangıç commit'inin bir Waterfall
  regresyon testi eklediği `git show` ile doğrulandı: başlangıç **703**.

## Okuyucu kararı ve uygulama

Framework bağımsız generic `headingSections` işlevi core'da tek yerde
başlık, accent ve takip eden gövdeyi toplar. Vue adaptörü ve Markdown token
okuyucusu aynı işlevi kullanır. Upstream Faq ayrı bir okuyucu kullanmasına
rağmen başlık/gövde sınırları Board ile aynıdır. Başlıksız gövde ve raw text
atlanır; boş bölümler tutulur. İç içe başlıklar yeni bölüm açmaz.

`tableOf`, `resolveTable`, `resolveLabeledTable` ve 7A okuyucuları değişmedi:
Board tablo girdisi tüketmediği için yeniden kullanım veya genişletme
gerekmiyor. Boş tablo hücreleri Board öğesi üretmez; FAQ tabloları runtime
yolunda özgün gövde olarak korunur. `GraphSheet` ve `GraphInvoice` kapsam
dışında kaldı.

`Faq`, `GraphBoard`, tipli props, `FaqEntry`, `ProseBlock`, `BoardColumn`,
`BoardItem`, `BoardState`, public/core export'ları, Markdown compiler,
docs/sidebar, eslint tek kelimeli bileşen istisnası ve registry eklendi.
Açık `entries`/`columns` (boş dizi dahil) → Markdown bölümleri önceliği;
null fallback verir. Board string öğeleri literal label kalır, Markdown
ayrıştırılmaz. Bold `now`, italic `next`, diğerleri `done`; bold üstün gelir.
Not em dash ile ayrılır. İlk dört sütuna kırpma sayımdan önce yapılır.

FAQ veri yanıtları literal string, Vue VNode veya taşınabilir prose blokları
olabilir. Compiler paragraflar, nested listeler, ordered start, blockquote
ve desteklenen inline prose/link alanlarını korur. Fence, tablo, özel
bileşen ve diğer desteklenmeyen girdiler uyarıyla mevcut runtime yoluna
döner; highlighter/copy kontrolü gibi host çıktısı korunur. VNode klonlama
ve değiştirme yoktur; slotlar her render sırasında yeniden okunur.

DOM/class yapısı upstream kalıbını izler; ortak Vue `Graph` caption kimliği
ve figure adlandırması korunur. Motion yerine mevcut `vReveal` kullanılır:
FAQ artışı 60 ms, tavanı 300 ms; Board başlığı 0 ms, öğeleri 40 ms artışla
200 ms tavanlıdır. SSR görünür, hydration uyarısızdır; reduced motion
mevcut directive davranışını kullanır. Bu motion farkı bilinçlidir.

Üç upstream örneği (`install`, `roadmap`, `sprint`), yerel
`components/docs/examples.tsx` dosyasından bağımsız beklenen modellerle
fixture olarak kaydedildi. Docs üzerinde compiler, runtime host ve veri
yollarındaki dokuz figure aynı DOM'u üretir. Reaktif derlenmiş slotlar ve
prop güncellemeleri yeni mount ile karşılaştırılır; üç palette, boş bölüm,
girdi önceliği, rich/literal yanıt, nested list ve 60. öğe gecikmesi test edilir.

## Çalışırken düzeltilen sorunlar

- Yeni FAQ örneği testinde `code` sayısı 7 yazılmıştı; kaynakta 6 olduğu
  doğrulandı. Yeni parser testinde boş inline text token'ları ve Board not
  ayracı beklentileri kaynak davranışına göre düzeltildi.
- Örnek çıkarma betiği kaçışlı inline backtick ardından gelen virgülde
  duruyordu; gerçek kapanış backtick'ini arayacak biçimde düzeltildi.
- Sıkı listelerde compiler'ın gizli paragraf token'ları fazladan `p`
  üretiyordu. Taşınabilir `inline` blok bu paragrafı kaldırır; veri/runtime
  DOM eşitliği regresyon testi eklendi. Vue `h(Fragment)` overload ayrımı
  açık dal ile yapıldı.
- Yeni JSON fixture union çıkarımı ve tüketici betiğindeki otomatik import
  düzenlemesinin yanlış tip adları/alıntı sınırı düzeltildi. Son typecheck,
  format, gerçek registry CLI payload eşitliği ve tüketici kontrolü geçti.

## Kabul

Tam zincir **çıkış 0**:

```sh
pnpm install && pnpm -r build && pnpm -r test && pnpm lint && pnpm typecheck && pnpm format:check && pnpm consumer:check
```

| Kontrol | Çıktı |
| --- | --- |
| Install | `Already up to date`; lockfile değişmedi |
| Build | Vue, Markdown, VitePress client/server ve statik sayfalar başarılı |
| Test | Vue `443 passed`, Markdown `238 passed`, docs `57 pass`; **738**, başarısız/atlanan yok |
| Yeni test | **35**: Vue 22, Markdown 10, docs 3; başlangıç 703 |
| Lint/typecheck | ESLint ve üç workspace çıkış 0 |
| Format | `All matched files use Prettier code style!` |
| Registry build/check | `33 items from library sources` |
| Registry CLI | `33 items, 71 source files; typecheck and build passed`; payload eşitliği korunur |
| Tüketici | `CONSUMER CHECK PASSED`; kayıtlı VitePress tüketicisinde 29 figure |
| Paket tipleri | Bundler/NodeNext, `skipLibCheck=false`; yanlış FAQ accent ve Board state reddedildi |
| Tree shaking | Tek Vue runtime; full 249811 byte, GraphStack 167460 byte |
| Yalnız kütüphane | Vue hariç full 80547 byte, GraphStack 13667 byte |

`SectionsTypes.vue` fixture içindeki `state: 'now'` geçici olarak
`state: 'later'` yapıldı. Kök `pnpm typecheck` çıkış 1 verdi:

```text
test/fixtures/SectionsTypes.vue(7,77): error TS2322: Type '"later"' is not assignable to type 'BoardState | undefined'.
```

Fixture özgün byte içeriğine `finally` ile geri yüklendi; takip eden
typecheck ve son tam zincir geçti. Kanıtlar
`C:/Users/zahid/source/github/tmp/mdxcn-vue/` altında `f7b-acceptance.log`,
`f7b-negative.log` ve `consumer-results.json` dosyalarındadır.

## Beklentiler ve sınırlar

Mevcut public/core export listeleri yeni export'larla genişledi;
tüketici figure sayısı 27 → 29, registry öğeleri 31 → 33 oldu.
Cascade slug listesine `faq`, `graph-board`, `chat` eklendi. Yeni Chat
dallarında gerçek `mt-4`/`mt-1` utility margin değerleri beklenir;
önceki slug'ların sıfır margin beklentisi değiştirilmedi. Mevcut bileşen
davranış testlerinin beklentileri gevşetilmedi.

Dev sunucusu, canlı tarayıcı/E2E oturumu ve npm yayını yapılmadı. Tarayıcıda
Board sütun kırılması, dört sütun yerleşimi, uzun label/note kırpılması,
FAQ prose/fence görünümü, light/dark kontrastı, native bağlantı focus
göstergesi, ekran okuyucu bölüm/soru sırası, JS kapalı/reduced motion,
CLS ve observer/WAAPI gecikmesi ölçülecek. Otomatik SSR/hydration/cascade
bu ölçümlerin yerine geçmez.

Teslimat açık izinle imzasız commit ve normal push kullanır; hook atlanmaz,
kalıcı git config değiştirilmez. Commit kimliği, temiz çalışma ağacı ve
`origin/main` eşitliği son mesajdan önce komutla doğrulanır.
