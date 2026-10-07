# Faz 8A — GraphTree, GraphCheck ve GraphFlow

Başlangıç `main`, `ab968b2`; çalışma ağacı temizdi. Upstream checkout
`16d817ad5ec54d89142e4c1cf26027b60d6df853` komutla doğrulandı.
Sistem zamanı `Get-Date` çıktısından: 2026-10-07 Çarşamba 03:40
(Europe/Istanbul).

## Okuyucu kararı ve doğrulanan davranış

Upstream Tree ve Check, `listItems`, `nestedList` ve `itemText` yardımcılarını
paylaşır. Vue ve Markdown adapter'ları aynı core `nestedList` işlevine doğrudan
host/token bilgisi verir; liste seçimi ve derinlik okuması tek yerde yapılır.
`treesFromList` ve `checksFromList` taşınabilir modeli üretir. Paragraf sınırında
boşluk eklenir; Vue derlemesinin düşürdüğü MDX boşluğu kelimeleri birleştirmez.
Mevcut state-list ve bölüm okuyucularının davranışı değiştirilmedi.

Flow, upstream gibi her metin düğümünü ayrı böler. Core `flowNodes`, `→`, `->`,
`—>` ve `=>` oklarını, kalın/italik düğümlerin tonlarını korur. Bütün metni tek
string yapıp vurguyu kaybetmez. Tree/Check liste okuyucusu Flow'a zorlanmadı.

- Tree önceliği `nodes` → boş olmayan liste → `Node`; marker içinde her derinlikte
  yeniden liste seçilir. Label yalnız yaprakta gövde metninden tamamlanır. Tek
  kök dal glifi taşımaz; diğer satırlarda upstream dal/prefix düzeni korunur.
  Kalın alt düğüm üst düğümü de vurgular. Meta yalnız ilk spaced em/en dash
  segmentinden gelir. Yinelenen label'lar ayrı anahtarlar alır.
- Check önceliği `items` → boş olmayan liste → `Task`. Markdown alt listeleri
  tekrar okunur; marker alt görevleri yalnız `items` alanından gelir. İç içe
  `Task` slotları alt görev kaynağı değildir. `[x]` büyük/küçük harf kabul eder;
  doğrudan checkbox da tamamlanma bilgisi verir. Paragraf içindeki checkbox
  doğrudan değildir: VitePress loose task list durumunda `done: false` kalır.
  Bu şaşırtıcı upstream davranışı değiştirilmedi. Erişilebilir sayı tüm
  derinlikleri kapsar; glifler dekoratiftir.
- Flow önceliği `rows` → `Path` → liste → paragraf → ham metin satırlarıdır.
  Boş `Path` bir boş akış satırı üretir. Nested liste içeriği aynı akış satırına
  katılır. `stretch` ve dashed bağlantı veri yolunda desteklenir. Oklar dekoratif;
  accent ok rengi upstream gibi paletten bağımsız `text-graph-accent` kalır.
- Üç bileşende açık boş veri dizisi kazanır; null slot fallback sağlar.
  Custom Vue component gövdeleri diğer adapter'lar gibi opaktır; fragment'ler
  açılır. VNode klonlanmaz veya değiştirilmez. Runtime `header-anchor` bağlantısı
  liste, ham metin ve marker label yollarında atılır.

Tipli props/modeller, `Node`/`Task`/`Path` marker adaptörleri, public/core
export'ları, compiler/plugin, üç docs sayfası/sidebar, ESLint ad istisnaları,
registry ve paket/registry tüketicisi eklendi. Sayı biçimlendirme gerekmiyor:
Tree ve Check yalnız düğüm/görev sayısını string olarak basar.

## Çalışırken düzeltilenler

- Ortak inline okuyucu literal `[x]` işaretini çözümlenmemiş referans sanıyordu.
  Yalnız `GraphCheck` için baştaki task marker muaf tutuldu; gerçek referans
  bağlantılarının runtime fallback davranışı ayrı testle korundu.
- Gerçek VitePress, görev listelerinde `checkbox_input`, `label_open` ve
  `label_close` token'ları üretir. Bunlar label metninden ayrıldı; checked bilgisi
  yalnız görünür host derinliği üzerinden okundu. Yedi upstream örneğinin
  compiler yolunu kullandığı, yalnız DOM eşitliğiyle yetinmeden, uyarısız
  `v-bind` üretimiyle doğrulandı.
- Yeni testteki fazladan parantez düzeltildi. Runtime Boolean attribute testleri
  için `Component` tipi kullanıldı; tüketici/SFC Boolean sözleşmesi sıkı kaldı.
  VitePress config callback dönüşü `void` olacak şekilde düzeltildi.
- Son incelemede permalink filtresi `Node` ve `Task` label fallback yollarına
  da uygulandı; mevcut testler bu yolları kapsayacak şekilde genişletildi.
- Mevcut docs dosyalarının satır sonları korundu; gereksiz tüm-dosya diff'i
  kaldırıldı. Registry belgesindeki güncel sayı 35 → 38 oldu.
- Başlangıç test sayısı Faz 7C raporundaki 789 değildir. Aradaki `a10b664`
  commit'i Vue ve Markdown tarafına birer regresyon testi ekler; `git show`
  ile doğrulanan başlangıç **791**. Son toplamdan yeni testler çıkarılınca da
  aynı sayı bulunur.

## Doğrulama

Yedi upstream örneğinin Markdown kaynağı yerel `components/docs/examples.tsx`
dosyasından alındı. Beklenen modeller elle kaydedildi; parser çıktısından
üretilmedi. Vue testlerindeki React host karşılıkları da modellerden
üretilmeyen bağımsız girdilerdir. Runtime model/data DOM eşitliği, görünür
SSR, uyarısız hydration, attrs aktarımı ve reaktif slot/prop değişimleri
sınandı. Boş, tek kök, yinelenen label, 12 seviye, ordered/karışık işaret,
loose paragraf, checkbox ve `stretch` kenar durumları kapsandı.

Gerçek VitePress çıktısında yedi örnek ve dört ek kenar fixture için
compiler/runtime/data DOM eşitliği doğrulandı. Yeni Tree/Check listeleri mevcut
host CSS cascade kontrolüne eklendi. Üç bileşende 60. satırın `vReveal` gecikmesi
**240 ms** olarak test edildi; Check alt görevleri upstream gibi ayrı reveal
almaz. VNode klonlama çağrısı olmadığı kaynak taramasıyla da kontrol edildi.

`NestedFlowTypes.vue` negatif kontrolünde geçici olarak `tone: 'bright'` ve
`done: 'true'` kullanıldı. Kök `pnpm typecheck` çıkış 1 verdi:

```text
test/fixtures/NestedFlowTypes.vue(10,53): error TS2322: Type 'string' is not assignable to type 'boolean | undefined'.
test/fixtures/NestedFlowTypes.vue(14,57): error TS2322: Type '"bright"' is not assignable to type 'FlowTone | undefined'.
test/fixtures/NestedFlowTypes.vue(22,42): error TS2322: Type 'string' is not assignable to type 'boolean | undefined'.
```

Fixture özgün byte içeriğine `finally` ile geri yüklendi; sonraki kök typecheck
geçti. Kanıt `C:/Users/zahid/source/github/tmp/mdxcn-vue/f8a-negative.log`.

Tam kabul zinciri:

```sh
pnpm install && pnpm -r build && pnpm -r test && pnpm lint && pnpm typecheck && pnpm format:check && pnpm consumer:check
```

| Kontrol | Çıktı |
| --- | --- |
| Install | `Already up to date`; lockfile değişmedi |
| Build | Vue, Markdown, VitePress client/server ve statik sayfalar başarılı |
| Test | Vue `521 passed`, Markdown `280 passed`, docs `62 pass`; toplam **863** |
| Yeni test | **72**: Vue 41 (40 yeni aile + 1 Funnel), Markdown 28, docs 3; başlangıç 791 |
| Lint/typecheck | ESLint ve üç workspace çıkış 0 |
| Format | `All matched files use Prettier code style!` |
| Registry build/check | `38 items from library sources` |
| Registry CLI/kurulum | `38 items, 80 source files; typecheck and build passed`; gerçek CLI payload eşitliği |
| Tüketici | `CONSUMER CHECK PASSED`; kayıtlı VitePress tüketicisinde 34 figure |
| Paket tipleri | Bundler/NodeNext, `skipLibCheck=false`; yanlış `tone`/`done` reddedildi |
| Tree shaking | Tek Vue runtime; full 268182 byte, GraphStack 168374 byte |
| Yalnız kütüphane | Vue hariç full 95671 byte, GraphStack 14362 byte |

Tam log `C:/Users/zahid/source/github/tmp/mdxcn-vue/f8a-acceptance.log`, tüketici
ölçümleri aynı dizindeki `consumer-results.json` dosyasındadır. Runtime yolunu
zorlayan fixture'larda açık prop fallback uyarıları beklenir; yedi normal
upstream örneğinin docs derlemesinde fallback yoktur. Başarısız veya atlanan
test yoktur. Public/core export listeleri genişledi; tüketici figure sayısı
31 → 34, registry öğe sayısı 35 → 38 oldu. Eski test beklentileri gevşetilmedi.

## Ayrı ek iş ve bilinçli farklar

`87b63fb` commit'i display'siz Funnel `steps` girdisini (`12400.5` → `12,400.5`)
varsayılan locale `tr-TR` olarak taklit edilirken sınar. İlgili dosyada 34 test
geçti; commit hemen normal push ile gönderildi. Sabit `en-US` uygulaması zaten
`ab968b2` başlangıcında vardı; yeniden değiştirilmedi.

Docs'a Funnel sabit `en-US` locale farkı ve reveal sırasında çalışan `stage`
soluklaştırması; Faq fence/tablo yanıtının uyarılı runtime yolu; Heatmap/Matrix
`Total` veya ilk hücresi tamamen kalın son satırın footer'a ayrılıp görünmemesi
notları eklendi. Sonuncusu upstream ile aynı davranıştır, Vue'ya özgü fark
değildir. Footer ayrımı birden fazla veri satırında geçerlidir.

Yeni ailede Motion yerine ortak `vReveal` kullanılır: 40 ms artış, 240 ms tavan;
SSR görünürdür, reduced motion ortak directive davranışını kullanır. Tree
soluk satır opacity değeri de reveal sırasında korunur; upstream `fadeUp`
animasyonundaki `opacity: 1` bunu ezer. Ortak Vue figure/caption ilişkilendirmesi
korundu. Bunlar bilinçli animasyon ve host entegrasyonu farklarıdır.

Dev sunucusu, canlı tarayıcı/E2E oturumu ve npm yayını yapılmadı. Tarayıcıda
Tree uzun dal/meta metni ve yatay kaydırma; Check alt görev girintisi, çok satırlı
notlar ve ekran okuyucu listeleri; Flow dar ekranda sarma, dashed `stretch`
bağlantıları ve palet kontrastı; light/dark tema, JS kapalı/reduced motion,
CLS ve observer/WAAPI gecikmesi ölçülecek. Otomatik testler bu ölçümlerin
yerine geçmez.

Teslimat açık izinle imzasız commit ve hemen normal push kullanır; hook bypass
ve kalıcı git config değişikliği yoktur. Ana commit kimliği, temiz çalışma
ağacı ve `origin/main` eşitliği son mesajdan önce komutla doğrulanır.
