# Faz 2B-3 raporu

Doğrulama: 2026-10-06 Salı 23:01 (bu turda sistemden alınan Europe/Istanbul zamanı).

## Yapılanlar

1. **Adım 1.1:** Boş/yalnız whitespace içeren Endpoint açıklamaları `undefined`
   olur; boş span/GraphProse üretilmediği testle doğrulandı.
2. **Adım 1.2:** Başlık yokken `Graph` slotuna `captionId` verilmez. Başlıksız
   tablo bölgesi `aria-label="Table"` kullanır; geçersiz caption referansı yoktur.
3. **Adım 1.3:** Fence class değerleri `normalizeClass` ile okunur. Bir seviyelik
   `div.language-* > pre` açılır; etiket sarmalayıcıdan alınır, copy/lang düğümleri
   yok sayılır. Kodda başka class olsa da sarmalayıcı dili korunur.
4. **Adım 1.4:** Endpoint kod bölgeleri `tabindex="0"`, `role="region"` ve caption
   adı taşır; başlıksız durumda dil/`Code` adı kullanılır. Tablo ve kod bölgelerinde
   `outline-offset: 3px` eklendi; bilinçli fark envantere yazıldı.
5. **Adım 1.5:** Ayrı Node process içinde `TZ=Europe/Istanbul` ile UTC → yerel
   saat ve gün sınırı dönüşümü sınandı: `-180`, `15:34:56`, `03:34:56`.
6. **Adım 1.6:** Tablo CSS `toContain` testi kaldırıldı. Gerçek VitePress kuralları,
   production CSS ve DOM üzerinde `th`/`td` border/background/font/padding,
   hizalama ve dekoratif satır kurallarının cascade kazananları doğrulandı.
7. **Adım 1.7:** Ana giriş açık export listesine geçti; elle yazılmış runtime
   export snapshot testi eklendi. `words`, `numbers`, `splitDash`, `pad2` yalnız
   `mdxcn-vue/core` üzerinden sunulur. `rowsIn`/`hostCells` iç yardımcı kalır.
8. **Adım 2:** `mdxcnMarkdown` plugin'i `GraphStack`, `GraphTable`, `Endpoint`
   ham token'larını tipli props değerlerine dönüştürür; heading anchor/highlighter
   öncesinde çalışır, VNode üretmez. Inline strong/em/code/link korunur. Endpoint
   paragrafları için `about` alanı eklendi. VitePress bağlantı dönüşümleri ve link
   `title`/`target`/`rel` alanları korunur. Desteklenmeyen bloklar dosya:satır
   uyarısıyla runtime slot yolunda kalır. Üç docs sayfasında derleme yolu aktiftir.
   README ve Markdown sözleşmesi güncellendi; güvenilir repo girdisi şartı yazıldı.

## Kabul çıktısı

İstenen zincir tek komutta çalıştırıldı; çıkış kodu **0**:

`pnpm install && pnpm -r build && pnpm -r test && pnpm lint && pnpm typecheck && pnpm format:check`

| Kontrol | Çıktı |
| --- | --- |
| `pnpm install` | `Already up to date`; pnpm 12.4.1 |
| `pnpm -r build` | Vue ve Markdown paketleri başarılı; VitePress `build complete in 1.08s` |
| `pnpm -r test` | **149 Vue + 22 Markdown + 14 docs = 185 geçti**, 0 başarısız/atlanan |
| `pnpm lint` | `eslint .`; hata yok |
| `pnpm typecheck` | Üç workspace projesi çıkış 0 |
| `pnpm format:check` | `All matched files use Prettier code style!` |
| `git diff --check` | Çıktı yok; çıkış 0 |

**35 yeni runtime test**: 8 Vue + 22 Markdown + 5 docs. Eski CSS ve Markdown
iskelet testleri kaldırıldı; net **+33**, toplam **152 → 185**. Derleme/typecheck
kontrolleri runtime test sayısına dahil değildir. Tam kabul kaydı:
`C:/Users/zahid/source/github/tmp/mdxcn-vue/f2b3-check.log`.

Production fixture'ı iki yolu önce bağımsız beklenen hücre, prose, glyph ve kod
değerleriyle doğrular, sonra DOM eşitliğini sınar. Caption kimlikleri normalize
edilir, Vue yorumları çıkarılır; gerçek kimlik/ad ilişkileri ayrıca doğrulanır.
Kod boşlukları sıkıştırılmaz. Docs config testi gerçek sayfalardaki derleme
sayısını kontrol eder: 3 GraphStack, 2 GraphTable, 1 Endpoint.

## Commit'ler

| Commit | Kapsam |
| --- | --- |
| `6069e87` | Adım 1.1 |
| `81a6993` | Adım 1.2 |
| `ef98883` | Adım 1.3 |
| `cae2550` | Adım 1.4 |
| `24397ad` | Adım 1.5 |
| `206c6b5` | Adım 1.6 |
| `90781d1` | Adım 1.7 |
| `5ef3ca0` | Adım 2, docs/fixture ve son inceleme düzeltmeleri |

Her commit sonrası normal push çalıştırıldı. İlk push geçici
`getaddrinfo() thread failed to start` hatası verdi; sonraki push ilk iki commit'i
birlikte gönderdi. Son uygulama commit'i sonrası `git status --short` boş,
`git rev-list --left-right --count origin/main...HEAD` çıktısı **`0 0`** idi.
Bu rapor ayrı commit ile gönderilir; onun sonrası Git sonucu kullanıcı raporundadır.
Force, hook atlama, imzasız commit seçeneği veya AI co-author trailer kullanılmadı.

## Sınırlar ve düzeltilen bulgular

- Destek yalnız bu üç bileşenin belgelenmiş grammar kapsamındadır. Explicit data
  props, Vue direktifleri/interpolasyon, item/özel bileşenler, ham HTML, iç içe/sıralı
  listeler, desteklenmeyen token'lar ve henüz çözülmemiş reference link fallback
  kullanır. Bu, kaynağı korur; runtime okuyucunun destek kapsamını genişletmez.
- Bileşen bloğunun açılış/kapanışı kendi satırlarında olmalıdır. Dış HTML wrapper
  ile bileşen arasına boş satır gerekir; docs scoped accent örneği düzeltildi.
  Host core dönüşümleri (örneğin typographer) model derlemesine dahil değildir.
- VitePress highlighter fence sonundaki boş satırları silebilir. Derleme ham kodu
  korur; runtime parite fixture'ında anlamlı son newline için doğrudan `pre > code`
  kullanılır. Bir diğer fence gerçek VitePress wrapper yolunu sınar.
- İlk denemelerde Node process için Vitest `import.meta.url` değerinin HTTP olması,
  VitePress link URL dönüşümü, multiline tag başlangıcı ve config callback dönüş
  tipi sorunları giderildi. Son kabul zinciri tamamen yeşildir.
- Yeni yazılım kurulmadı; mevcut VitePress parser ve mevcut tip paketleri workspace
  bağımlılığı olarak bağlandı. Plugin için ayrıca Vite transform gerekmedi.
- Kaynak/diff incelemesi yapıldı; ayrı agent ve tarayıcı ölçümü kullanılmadı.
  `GraphTimer` derlemesi gerekli görülmedi. Comark, alert/footnote/`withMdxcn`,
  temiz npm/registry tüketimi ve yayın kapsam dışında tutuldu.

## Tarayıcıda ölçülecekler

Dev sunucusu başlatılmadı. 375/768/1280 × light/dark matrisiyle production HTML
üzerinde hydration uyarıları, reaktif güncelleme, derleme/runtime görsel paritesi,
tablo/kod klavye kaydırması ve odak halkası, erişilebilir caption ilişkileri,
Endpoint dar ekran parametre yapısı ve kod girintisi, reveal/reduced-motion
davranışı ve GraphTimer yerel saat görüntüsü ölçülmelidir. JS hata durumunda
SSR görünürlüğü ve font yüklenmesinin yerleşime etkisi de tarayıcıda doğrulanmalıdır.
