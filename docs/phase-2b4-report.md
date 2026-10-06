# Faz 2B-4 raporu

Doğrulama: 2026-10-06 Salı 23:55; bu turda sistemden alınan Europe/Istanbul zamanı.
Ortam: Windows, Node `24.21.0`, pnpm `12.4.1`.

## Yapılanlar

1. **Adım 1, B1/B2:** Fence meta bilgisi dil etiketinden ayrılır; `js{1,3}`,
   `ts:line-numbers`, `cpp{1}`, `c++` ve dilsiz fence iki yolda sınandı.
   VitePress highlighter işlevinin `c++` değerini `c` olarak kısaltması gerçek DOM
   fixture'ında bulundu; özgün etiket `data-mdxcn-language` alanında korunur.
2. **Adım 1, B3/B4:** Frontmatter satır farkı kaynak uyarılarına eklenir.
   `@include` sınırı belgelendi. Model üretimi host inline/emoji/typographer
   kurallarından sonra, anchor işleminden önce çalışır. `text_special` metin
   sayılır; `:tada:`, `&amp;`, `&nbsp;` ve iç içe entity değerleri sınandı.
   Sonradan tanımlanan reference link artık derlenebilir.
3. **Adım 1, B5/B6:** Eksik kapanış, açılışla aynı satırdaki gövde ve boş satırsız
   listeler konumlu uyarı verir. VitePress'in boş satırsız listeyi ham HTML sayan
   davranışı iki yolda korunur; README ve sözleşme bunu açıklar.
4. **Adım 1, B7:** Başlık, gövde ve footer hücreleri ortak boşluk normalizasyonunu
   kullanır. Endpoint kod bölgelerinin erişilebilir adı caption ve etiket
   referanslarından oluşur. Son incelemede başlık hücrelerindeki eksik
   normalizasyon da düzeltildi ve production parite fixture'ına eklendi.
5. **Adım 1, B8/B9:** `markdown-it ^14` peer ve VitePress
   `2.0.0-alpha.20` host sözleşmesi belgelendi. Ana/core girişlerinin tam
   runtime/tip listeleri, manifest export hedefleri ve üretilen `.d.ts` dosyaları
   sınanır. Eksik docs build için uygulanabilir hata mesajı verilir.
   Node alt sınırı `>=22.18` oldu. B1/B2/B4/B6 sınırları iki yolun gerçek
   production DOM çıktılarıyla karşılaştırılır.
6. **Adım 2:** `pnpm consumer:check` iki tarball üretir; repo dışında Vite/Vue/
   Tailwind v4 ve VitePress tüketicileri kurar. Ana/core tip çözümü, üç CSS girişi,
   `@source` pozitif/negatif kontrolü, typecheck, production build, Vue peer/
   external ve tree-shake ölçümü geçer. Markdown paketinin kütüphane bağımlılığı
   host peer sözleşmesine taşındı; yayımlanmamış paketi registry'den arayan temiz
   kurulum sorunu giderildi. Her iki npm paketine README eklendi. CI tüketici işi
   aynı script'i çalıştırır.
7. **Adım 3:** Kaynaklardan `registry.json` ve yedi `public/r/mdxcn-*.json`
   öğesi üretildi: dört bileşen, frame, core, CSS. Her dosya/payload tam MIT
   bildirimini taşır. `registry:check` güncel kaynakla eşleşmeyi kontrol eder.
   Gerçek `shadcn-vue 2.8.2 add` komutu yedi yerel JSON'dan **21 dosya** kurdu;
   dosya içeriği/lisansı, typecheck ve Vite build doğrulandı. Elle kurulum
   simülasyonuna veya sunucuya gerek kalmadı.
8. **Adım 4:** Ayrı `withMdxcn` plugin'i GitHub/Obsidian alert, quote byline,
   console/shell session ve host footnote dönüşümlerini sağlar. Host'un
   `components` listesinde bulunan hedef için Vue etiketi; eksik hedef için
   kaynak uyarısı ve HTML fallback üretilir. Alias, prompt, feature seçenekleri,
   zengin metin, kod boşlukları, attribution ve footnote ID/backlink değerleri
   bağımsız fixture'larla sınandı. Paketlenmiş plugin temiz VitePress build'inde
   üç derlenmiş graph ve dört beklenen HTML fallback ile doğrulandı.

## Kabul çıktısı

İstenen zincir tek komutta tamamlandı; çıkış kodu **0**:

```sh
pnpm install && pnpm -r build && pnpm -r test && pnpm lint && pnpm typecheck && pnpm format:check && pnpm consumer:check
```

| Kontrol | Çıktı |
| --- | --- |
| `pnpm install` | `Already up to date` |
| `pnpm -r build` | İki paket başarılı; VitePress `build complete in 1.17s` |
| `pnpm -r test` | **156 Vue + 84 Markdown + 15 docs = 255 geçti**; 0 başarısız/atlanan |
| `pnpm lint` | `eslint .`, çıkış 0 |
| `pnpm typecheck` | Üç workspace projesi, çıkış 0 |
| `pnpm format:check` | `All matched files use Prettier code style!` |
| `pnpm consumer:check` | `CONSUMER CHECK PASSED`; typecheck/build ve gerçek registry kurulumu geçti |
| Peer kontrolü | `No peer dependency issues found` |
| `pnpm registry:check` | `REGISTRY CHECK PASSED: 7 items from library sources` |
| `git diff --check` | Çıktı yok; çıkış 0 |

**70 yeni test**: 7 Vue + 62 Markdown + 1 docs; toplam **185 → 255**.
Tüketici build/typecheck ve registry kontrolleri bu runtime test sayısına dahil değildir.
Docs çıktısındaki uyarılar kasıtlı runtime/fallback fixture'larına aittir.

Kabul kaydı: `C:/Users/zahid/source/github/tmp/mdxcn-vue/f2b4-check.log`.
Son tüketici sonuçları ve tarball'lar:
`C:/Users/zahid/source/github/tmp/mdxcn-vue/consumer-HEWbgF/`.
Brifingdeki `os.tmpdir()` yerine global dizin kuralının gerektirdiği
`source/github/tmp` kullanıldı.

## Tree-shake ve paket içeriği

```text
TREE-SHAKE full=180652 bytes GraphStack=166153 bytes removed=14499 bytes; Vue runtime entries=1
VITEPRESS CONSUMER PASSED: 3 compiled figures, 4 warned native upgrade fallbacks
REGISTRY INSTALL PASSED: shadcn-vue 2.8.2, 7 items, 21 source files; typecheck and build passed
```

Ölçüm `minify: false` production JS çıktısıdır; Vue dahil uygulama toplamını
gösterir. Yalnız `GraphStack` girdisinde `GraphTable`, `Endpoint` ve Markdown/
Comark/Shiki/knap kodu bulunmaz; Vue runtime giriş sayısı birdir.
`npm pack --dry-run` Vue için **29**, Markdown için **13** dosya doğruladı:
LICENSE, upstream telif satırı içeren README, JS, `.d.ts` ve Vue CSS girişleri.
Kaynak/test/workspace dosyaları paketlere girmez.

## Commit'ler

| Commit | Kapsam |
| --- | --- |
| `b280958` | B1 fence etiketi |
| `33301f3` | B2 dilsiz fence |
| `63623a2` | B3 frontmatter konumu |
| `1b00026` | B4 host core dönüşümleri |
| `e42f0b3` | B5/B6 uyarılar ve liste sınırı |
| `3ea1e46` | B7 ortak normalizasyon ve erişilebilir kod adı |
| `2fcc681` | B8 peer/host sözleşmesi |
| `3a38394` | B9 tam export/tip kontrolleri ve sınır DOM fixture'ı |
| `5ce7f6a` | Adım 2 tarball tüketicileri ve CI |
| `d98e4d2` | Adım 3 registry ve gerçek CLI kurulumu |
| `cb312fa` | Adım 4 `withMdxcn` ve entity/açılış sınırı düzeltmeleri |
| `78b656c` | Başlık hücresi paritesi ve platforma uygun pnpm çalıştırıcısı |

Her commit sonrası normal push yapıldı. B3 push işlemindeki geçici
`getaddrinfo() thread failed to start` hatası yeniden denemede giderildi.
Son uygulama push işlemi sonrası `git status --short` boş ve
`git rev-list --left-right --count origin/main...HEAD` çıktısı **`0 0`** idi.
Bu rapor ayrı commit ile gönderilir; onun son Git sonucu kullanıcı raporundadır.
Force, hook atlama veya AI co-author trailer kullanılmadı; npm yayını yapılmadı.

## Sınırlar ve tarayıcıda ölçülecekler

- `Callout`, `Quote`, `Terminal`, `Footnotes` portları Faz 5 kapsamındadır.
  `components` listesi gerçek host kaydını beyan eder; plugin Vue kaydını kendi
  başına keşfetmez. Terminal için geçici `prompt`/`text` prop sözleşmesi belgelidir.
- Footnote parser host'a aittir. `@include` konumu genişletilmiş host belgeye
  aittir. VitePress highlighter işlevinin sildiği fence sonu boş satırları runtime
  okuyucusu geri getiremez. Dinamik/özel slotlar belgelenmiş fallback kullanır.
- Registry, `~/src/components/mdxcn/` hedeflerini ve `.txt` taşıma yollarını
  kullanır; CLI aksi halde `src/` önekini siler ve CSS dosyalarını JavaScript
  olarak ayrıştırır. Windows'ta göreli yerel JSON yolu gerekir; mutlak drive yolu
  URL sayılır. CSS için host import ve Tailwind v4 işleme gerekir.
- Paketler `0.0.0`; ilk yayın öncesi `mdxcn-vue` peer sürüm aralığı sabitlenmelidir.
  Kabul Node `24.21.0` ile çalıştı; `22.18` için ayrı ortam koşumu yapılmadı.
  CI işi eklendi; uzak GitHub Actions sonucu bu yerel raporun ölçümü değildir.
- Dev sunucusu ve gerçek tarayıcı başlatılmadı. Production sayfalarda
  375/768/1280 × light/dark görsel parite, hydration, reaktif güncelleme,
  klavye kaydırması/odak, caption + kod adı, reveal/reduced-motion, GraphTimer
  yerel saat, JavaScript hata durumunda SSR görünürlüğü ve font yüklenmesinin CLS
  etkisi tarayıcıda ölçülmelidir.
