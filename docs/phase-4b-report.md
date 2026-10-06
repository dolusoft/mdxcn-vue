# Faz 4B — 4A düzeltmeleri, Annotate ve Env

Başlangıç `main`, `4fcc486`; çalışma ağacı temiz ve `HEAD`, `origin/main` ile
aynıydı. Kaynaklar yerel `mdxcn-src/registry/default/{annotate,env}` dizinleri,
`graph-frame/graph-markdown.ts` okuyucuları ve dört upstream docs örneğidir.

## Yapılanlar ve doğrulanan düzeltmeler

- B1: Faz 4A raporundaki imza/Git engeli gerçek commit ve remote referanslarıyla
  düzeltildi. `4fcc486` zaten imzasız oluşturulmuş ve push edilmişti.
- B2: Terminal satır gecikmesi 40 ms artar, en fazla 200 ms olur. 60 satırlık
  blokta son satır tek başına görünürlüğe girdiğinde observer/WAAPI mock testi
  200 ms değerini ve görünürlüğün geri gelmesini doğrular.
- B3: Fence sahipliği HTML yorumlarını atlar, yalnız eşleşen okuyucu etiketlerinin
  aralığını korur. Kapanışsız veya eşleşmeyen etiketler sonraki fence dönüşümünü
  engellemez. Eşleşen dış kapanış bozuk iç etiketten kurtarılır. Alert işlemleri
  token dizisini değiştirse bile sahiplik token kimliğiyle korunur. Yeni
  `Annotate`/`Env` okuyucuları da bu korumaya dahil edildi; koruma `Terminal`
  kaydına bağlı değildir. Kaydı olmayan hedef için gereksiz uyarı üretilmez.
- B4: Terminal wrapper sınıfı gerçek class sınırında eşleşir;
  `not-language-console` sıradan metni artık yanlışlıkla atılmaz.
- B5–B7: Hydration kapsamı jsdom ve `IntersectionObserver` olmayan ortam olarak
  netleştirildi. `Terminal` için gerçek Vue şablonunda geçerli/yanlış `text`
  girdileri sınandı. Çerçeve içindeki `blockquote` dönüşümü sözleşmeye yazıldı.
- `Annotate`: tipli `code`/`notes` props, bağımsız alan önceliği, marker grammar,
  zengin notlar, varsayılan dil başlığı, upstream DOM/class/dekoratif ARIA.
- `Env`: tipli `vars`, boş fence dahil upstream öncelik, yorum ve required
  ayrıştırması, boş değer gösterimi, screen-reader metni, upstream responsive grid.
- İki bileşen için core model, dahili VNode adaptörleri, Markdown token → props
  derlemesi, public export listesi, Vue şablon tip kontrolleri, SSR/hydration,
  bağımsız production DOM fixture'ları, docs sayfaları ve sidebar eklendi.
- Registry kaynaklarından yeniden üretildi; gerçek CLI kurulumuna ve tarball
  tüketicisine iki bileşen ve yanlış tip kontrolleri dahil edildi.

Brifingdeki “VNode item adaptörü” ifadesi kaynakta item API olduğu anlamına
gelmez: iki bileşende de item API yoktur; adaptör doğrudan host gövdesini okur.
Başlangıç README metinleri Faz 3 ve port edilmemiş prose durumunda kalmıştı;
yalnız bu teslimata ilişkin durum ve giriş açıklamaları güncellendi.

Kontroller sırasında B3 uygulamasındaki `findLastIndex` mevcut TypeScript
hedefinde tanımlı değildi; hedef değiştirilmeden geriye yürüyen döngü kullanıldı.
Yeni VitePress testinin `config` callback dönüşü de `Awaitable<void>` sözleşmesine
uyduruldu. İlk palette test beklentisi kaynakla uyuşmuyordu: `primary` rolü
`mono` dahil `text-graph-accent` döndürür; beklenti gerçek kaynakla düzeltildi.

## Bilinçli farklar ve sınırlar

React Motion yerine mevcut `vReveal` kullanılır. SSR görünürdür; Terminal/Env
gecikmesi 200 ms, Annotate notları 250 ms ile sınırlıdır. Observer ve easing
ayrıntıları Vue direktifine aittir; React Motion birebirliği iddia edilmez.
Hydration testleri jsdom'da, `IntersectionObserver` olmadan DOM eşitliğini ve
mismatch uyarısının yokluğunu ölçer. Observer/WAAPI mock testi ayrı kontroldür.

VNode okuyucuları Fragment açar ve özel Vue bileşenlerini opak tutar. VitePress
fence sarmalayıcısı tek seviyede açılır; copy ve dil kontrolleri atılır. Veri
notları VNode veya `ProseNode[]` kabul eder. Karmaşık notlar, ham HTML, dinamik
Vue ve açık veri props derlenmez; konumlu uyarıyla runtime okuyucusuna bırakılır.
Annotate iç içe not listelerini upstream gibi çizmez. Env gösterim grammar
davranışını korur; tırnak içindeki ` #` de yorum başlatır. dotenv parser iddiası yoktur.

DOM paritesinde yalnız caption kimlikleri ve Vue yorum düğümleri normalize
edilir; kod boşlukları korunur. Kimliklerin benzersizliği ve ARIA ilişkisi
ayrıca doğrulanır. Npm yayını veya dev sunucusu başlatılmadı.

## Kabul çıktısı

Tek zincir sıfır çıkış koduyla tamamlandı:

```sh
pnpm install && pnpm -r build && pnpm -r test && pnpm lint && pnpm typecheck && pnpm format:check && pnpm consumer:check
```

| Kontrol | Sonuç |
| --- | --- |
| `pnpm install` | `Already up to date` |
| `pnpm -r build` | İki paket ve VitePress client/server/statik render geçti |
| `pnpm -r test` | Vue 205, Markdown 117, docs 25; toplam 347 geçti, atlanan test yok |
| `pnpm lint` | `eslint .`, çıkış 0 |
| `pnpm typecheck` | Üç workspace typecheck, çıkış 0 |
| `pnpm format:check` | `All matched files use Prettier code style!` |
| `pnpm consumer:check` | `CONSUMER CHECK PASSED` |
| Registry | `REGISTRY INSTALL PASSED: shadcn-vue 2.8.2, 12 items, 33 source files; typecheck and build passed` |
| Kayıtlı tarball host'u | `REGISTERED VITEPRESS CONSUMER PASSED: 8 figures, Callout/Quote/Terminal/Annotate/Env rendered; Footnotes fallback preserved` |
| Kayıtsız tarball host'u | Üç derlenmiş figure ve dört native upgrade fallback geçti |
| Paket tipleri | Bundler/NodeNext, `skipLibCheck=false`; yeni props için yanlış tipler reddedildi |
| Tree shaking | Tek Vue runtime; full 191484 byte, GraphStack 166184 byte |
| Yalnız kütüphane | Source-map ölçümü, Vue hariç: full 33088 byte, GraphStack 12363 byte |

Başlangıç 295 testti: **52 yeni test** (Vue 27, Markdown 20, docs 5).
Tam komut çıktısı `C:/Users/zahid/source/github/tmp/mdxcn-vue/f4b-acceptance.log`,
tüketici ölçümleri aynı dizindeki `consumer-results.json` dosyasındadır.
Bağımsız beklentiler ardından DOM eşitliği sınandı; yeni production fixture
sekiz figure ile üç Annotate yolunu, üç Env fence yolunu ve iki Env liste yolunu kapsar.
Git teslimatı her commit sonrası push akışıyla yapılır; son temiz durum ve
`HEAD`/`origin/main` eşitliği commit sonrası ayrıca kontrol edilir.

Build içindeki fallback fixture uyarıları beklenendir; yeni fixture'daki açık
`notes`/`vars` alanları runtime yolunu bilinçli kullanır. Registry CLI kurulumunda
altı deprecated transitive dependency uyarısı sürer; bağımlılıklar değiştirilmedi.

## Commit ayrımı

- `3723b45`: Faz 4A Git teslimat raporu.
- `24ca7ed`: Terminal gecikme tavanı ve observer/WAAPI testi.
- `a1dff7e`: HTML yorumları, eşleşmeyen etiketler ve token kimliği testleri.
- `341691c`: Terminal class sınırı ve regresyon testi.
- `8f21043`: Terminal şablon tipleri, hydration kapsamı, blockquote sözleşmesi.
- Son uygulama commit'i: Annotate/Env, gerekli compiler/registry/docs bağlantıları,
  B3 TypeScript uyumluluk düzeltmesi ve bu rapor. Commit kimliği teslimat mesajında verilir.

## Tarayıcıda ölçülecekler

`/components/annotate`, `/components/env`, `/components/terminal`: light/dark,
mobil grid, uzun kod ve değer kaydırma/satır kırılması, font fallback, JS kapalı
görünürlük, reduced motion, CLS ve uzun blokta gerçek observer/WAAPI gecikmesi.
Bu teslimatta tarayıcı/E2E oturumu çalıştırılmadı. Önceki 960–1279 px VitePress
nav kayması ve kapsam dışı bileşenler değiştirilmedi.
