# Faz 5B — review düzeltmeleri, Chat ve Keys

Başlangıç `main`, `23a9cd4`; çalışma ağacı temizdi. Salt okunur upstream
checkout `16d817ad5ec54d89142e4c1cf26027b60d6df853`, envanter referansıyla
eşleşti. `Chat`, `Keys`, ilgili liste/önek yardımcıları ve session/support/shortcuts
örnekleri dosyalardan doğrulandı. `GraphTimeline` ve `GraphSpec` değiştirilmedi.

## Review düzeltmeleri

- R1: `TerminalTypes.vue` içine eklenen kasıtlı sayı prop hatası başlangıçta
  `pnpm typecheck` ile çıkış 0 verdi. `test/**/*.vue` kapsamı eklenince gerçek
  `null` hatası çıktı. `Terminal.text` runtime prop bildirimi
  `String as PropType<TerminalProps['text']>` biçiminde düzeltildi.
  Tüm Vue fixture dosyaları artık kapsamda; 5A ve yeni 5B fixture'ları da
  ayrı negatif kontrollerle doğrulandı.
- R2: `Annotate` ve `Env` için 60 öğelik listede yalnız son öğenin görünmesi
  observer/WAAPI mock ile sınandı; gecikmeler 250 ve 200 ms.
- R3: Env değerlerinin maskelenmeden gösterildiği, gerçek sır/parola/token
  yazılmaması gerektiği docs sayfasına eklendi. Mevcut sayfanın İngilizcesi korundu.
- R5: gerçek paket üzerinden çok satırlı `Terminal` açılışı çalıştırıldı;
  paragraph/blockquote ve ayrıca otomatik dönüştürülmüş iç fence çıktısı görüldü.
  `markdown-contract.md` sınırı açıklar. Önceki 33 satırlık açılış desteğinin
  yalnız model derleyicisindeki bileşenlere ait olduğu da netleştirildi.

Bu düzeltmeler ayrı imzasız commit ve normal push ile teslim edildi:
`19a484a` (R1), `d5c3ded` (R2), `0f37458` (R3), `7c2e0fd` (R5).
Terminal registry payload'ı son uygulama commit'inde yeniden üretildi.

## Chat ve Keys

- `Chat`: `turns` veri önceliği, boş dizinin slotu bastırması, `null`/`undefined`
  fallback, 1–24 karakter konuşmacı öneki, zengin önekin kırpılması, loose
  listelerde ayrı gövde paragrafları, nested listelerin dışlanması, yalnız tek
  italic öğede aside, asker için büyük/küçük harf duyarsız eşleşme ve tekrar
  gruplaması için duyarlı eşleşme korundu. Repeated speaker için `.sr-only`
  metni ve mobil sınıflar kaynakla eşleşir.
- `Keys`: `bindings` veri önceliği, boş/null davranışları, liste metni ve bold
  accent, modifier glyph'leri, `+`/whitespace ayrımı ve `then` chord ayrımı
  korundu. `dl`/`dt`/`dd`, tek erişilebilir kısayol metni ve dekoratif cap'ler
  upstream yapısını kullanır; klavye event bağlamaz.
- Upstream bu iki bileşende item API sunmaz; yeni item bileşeni eklenmedi.
  `ChatTurn.children` Vue `VNodeChild` taşır. `Chat.list`, Steps kalıbındaki gibi
  yalnız derleyici girdisidir; `turns` bunun önüne geçer.
- Keys, mevcut `stateList` okuyucusunu kullanır. Chat, aynı `readerListItems`
  host seçimini ve paragraph yardımcılarını kullanır; konuşmacı/başlık/gövde
  grammar'ı durum listesinden ayrıdır. Vue bağımsız grammar ve chord işlevleri
  `core/chat-keys.ts` içindedir; derleyici aynı grammar'a veri sağlar.
- Markdown dönüşümleri, public API/declaration snapshot'ları, gerçek Vue tip
  fixture'ı, docs/sidebar kayıtları, ESLint bileşen adları, registry ve tarball/CLI
  tüketicisi güncellendi. README'deki eski yedi registry öğesi bilgisi de gerçek
  üretimle doğrulanıp on yedi olarak düzeltildi.

## Kabul çıktısı

İlk tam zincir tüm adımlarda çıkış 0 verdi:

```sh
pnpm install && pnpm -r build && pnpm -r test && pnpm lint && pnpm typecheck && pnpm format:check && pnpm consumer:check
```

| Kontrol | Çıktı / sonuç |
| --- | --- |
| `pnpm install` | `Already up to date` |
| `pnpm -r build` | İki paket ve VitePress client/server/statik render geçti |
| Son `pnpm -r test` | Vue 271, Markdown 151, docs 36; toplam **458**, atlanan yok |
| `pnpm lint` | `eslint .`, çıkış 0 |
| `pnpm typecheck` | Üç workspace, çıkış 0 |
| `pnpm format:check` | `All matched files use Prettier code style!` |
| `pnpm consumer:check` | `CONSUMER CHECK PASSED` |
| Registry | `17 items, 42 source files; typecheck and build passed` |
| Kayıtlı tarball host'u | `13 figures`; Chat/Keys içeriği ve aside ayrıca doğrulandı |
| Paket tipleri | Bundler/NodeNext, `skipLibCheck=false`; yanlış alan türleri reddedildi |
| Tree shaking | Tek Vue runtime; full 204719 byte, GraphStack 166384 byte |
| Yalnız kütüphane | Source-map ölçümü, Vue hariç: full 44198 byte, GraphStack 12537 byte |

Başlangıç 404 testti: **54 yeni test** (Vue 34, Markdown 15, docs 5).
Tam zincir 457 testle geçti; incelemede eklenen dinamik compiled host güncelleme
testi sonrasında test/lint/typecheck/format kontrolleri tekrar geçti ve sayı 458
oldu. Ürün kodu ve tüketici akışı bu son test ilavesinde değişmedi.

Negatif kontrol çıktıları:

```text
test/fixtures/TerminalTypes.vue(12,14): error TS2322: Type 'number' is not assignable to type 'string'.
test/fixtures/CodeReaderTypes.vue(18,14): error TS2322: Type 'number' is not assignable to type 'string'.
test/fixtures/StateListTypes.vue(24,14): error TS2322: Type 'number' is not assignable to type 'string'.
test/fixtures/ChatKeysTypes.vue(18,20): error TS2322: Type 'number' is not assignable to type 'string'.
```

Her kasıtlı hatada kök komut çıkışı 1, fixture geri alındıktan sonra typecheck
çıkışı 0. Kanıt dosyaları `C:/Users/zahid/source/github/tmp/mdxcn-vue/` altında:
`f5b-acceptance.log`, `f5b-negative.log`, `f5b-final-tests.log`,
`consumer-results.json`.

Testlerde önce bağımsız upstream session/support/shortcuts değerleri, sınıfları
ve erişilebilirlik yapısı sınanır. Production fixture'ındaki sekiz figure için
derlenmiş Markdown, host ve desteklenen veri yolları DOM eşitliğiyle karşılaştırılır.
Yalnız Vue yorumları ve caption kimlikleri normalize edilir; kimlik benzersizliği
ve figure bağlantıları ayrıca doğrulanır. jsdom SSR/hydration testleri görünür
içeriği ve mismatch uyarısı yokluğunu; slot güncelleme testleri reaktiviteyi sınar.

İlk test denemesinde `mono` palette için birincil rengin `text-foreground`
olacağına ilişkin iki yanlış beklenti, mevcut `toneClass` kaynağına göre
`text-graph-accent` olarak düzeltildi. Parametrik `mount` testindeki union
çıkarımı bir render wrapper ile düzeltildi. Son format kontrolünden önce yeni
Chat kaynak dosyası formatlandı ve registry yeniden üretildi. Kabul zincirinde
kırmızı kalan kontrol yoktur. DNS sorunu veya geçici git ayarı gerekmedi.

## Bilinçli farklar ve tarayıcı ölçümleri

React Motion yerine mevcut `vReveal` kullanılır; SSR görünürdür. Chat gecikmesi
60 ms artış/300 ms tavan, Keys 40 ms artış/200 ms tavan kullanır. Her ikisi için
60 satırda yalnız son satırın görünmesi mock ile doğrulandı. VNode Fragment
şeffaftır; özel bileşen sınırları opaktır. Ham HTML, nested listeler, dinamik
Vue ve açık veri props derleyicide konumlu uyarıyla runtime yolunda kalır.

Dev sunucusu başlatılmadı, npm yayını ve tarayıcı/E2E oturumu yapılmadı.
`/components/chat` ve `/components/keys` için light/dark, dar ekran konuşmacı
gizleme ve satır kırılması, uzun mesaj/kısayol yerleşimi, font/glyph fallback,
link odakları, ekran okuyucu sırası, JS kapalı görünürlük, reduced motion, CLS
ve gerçek observer/WAAPI gecikmesi tarayıcıda ölçülecek.

Son uygulama/rapor commit'i imzasız, hook atlamadan ve normal push ile teslim
edilir; commit kimliği, temiz `git status` ve `origin/main` eşitliği son mesajda
commit sonrası komut çıktılarıyla bildirilir.
