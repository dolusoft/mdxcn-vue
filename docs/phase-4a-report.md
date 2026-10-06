# Faz 4A — Callout, Quote, Terminal

Kapsam yalnız `Callout`, `Quote`, `Terminal` portları ve gerekli Markdown,
docs, export, registry bağlantılarıdır. `Annotate` ve `Env` değiştirilmedi.
Başlangıç `main`, `cb7cfbf`; çalışma ağacı temizdi.

## Doğrulanan kaynak ve brifing düzeltmeleri

- Upstream yerel `mdxcn-src/registry/default/{callout,quote,terminal}` kaynakları
  ve `components/docs/examples.tsx` içindeki altı örnek okundu. Girdi öncelikleri
  inventory satırlarıyla doğrulandı; prose bileşenlerinde item şeması yoktur.
- Brifingdeki `GraphStack.vue` yolu yanlış: gerçek örnek `graph-stack.ts`.
- Upstream `Terminal` yalnız gövde metni okur; Markdown sözleşmesi `text` alanı
  üretir. Vue portu bu alanı açıkça destekler. `text` → slot sırası, boş string
  ile bastırma ve `null`/`undefined` fallback test edildi.
- `withMdxcn` kaydı açılınca açık `Terminal` fence içinde iç içe bileşen,
  `Endpoint` içinde ise mevcut kod okuyucusunu bozan dönüşüm oluşabiliyordu.
  Bu iki okuyucunun fence blokları korundu; dışarıdaki fence yine yükseltilir.
  `prompt=">"` içeren self-closing etiket için de regresyon testi vardır.
- Ortak `GraphBody` upstream `cn` gibi çakışan sınıfları elemez. `Callout`
  padding override yerel DOM üzerinde çözüldü; ortak bileşene refactor yapılmadı.
- Gerçek VitePress CSS kaynağı `blockquote` için kenarlık, margin, padding ve
  renk dayatır. Graph içindeki alıntıya sınırlı reset eklendi; host en son
  yüklendiğinde de upstream geometriyi koruduğu cascade testiyle doğrulandı.
- Markdown sözleşmesindeki “henüz port edilmedi” ve registry öğe sayısı güncellendi.

## Teslimat ve bilinçli farklar

Tipli public props, upstream glyph/tone/DOM yapıları, `Graph` çerçevesi,
dekoratif öğelerin `aria-hidden` alanları ve semantik `blockquote`/`cite` korundu.
Vue `class` ve attrs mevcut repo kalıbıyla figure üzerine aktarılır.
`parseTerminal` ve `TerminalLine` yalnız `mdxcn-vue/core` üzerinden sunulur;
VNode fence okuyucusu iç adaptör olarak kalır.

React Motion yerine mevcut `vReveal` kullanılır: SSR gizlenmez; hydration
sonrasında mevcut reduced motion ve görünürlük davranışı sürer. Terminal satır
gecikmesi 40 ms artar ve Faz 4B düzeltmesiyle 200 ms'de sınırlanır; uzun blokta
son satırın tek başına görünürlüğe girmesi observer/WAAPI mock testiyle doğrulanır.
Observer/easing ayrıntıları mevcut Vue
direktifinin sözleşmesidir, React Motion ile animasyon birebirliği iddia edilmez.
`text` prop'u ve VitePress fence kontrollerini dışarıda bırakma Vue host uyarlamasıdır.
Mevcut `Graph` caption kimlikleri/ARIA ilişkileri korunur.

Docs config üç bileşeni kaydeder ve `withMdxcn` dönüşümlerini açar. Kayıtsız
hostlarda mevcut fallback fixture'ları değişmedi; `Footnotes` fallback kalır.
Registry üç yeni öğe içerir; core ve CSS payload dosyaları da kaynaklarından
yeniden üretildi. npm yayını ve dev sunucusu başlatılmadı.

## Kabul çıktısı

Tek zincir sıfır çıkış koduyla tamamlandı:

```sh
pnpm install && pnpm -r build && pnpm -r test && pnpm lint && pnpm typecheck && pnpm format:check && pnpm consumer:check
```

| Kontrol | Sonuç |
| --- | --- |
| `pnpm install` | `Already up to date` |
| `pnpm -r build` | İki paket ve VitePress production client/server/statik render geçti |
| `pnpm -r test` | Vue 178, Markdown 97, docs 20; toplam 295 geçti, atlanan test yok |
| `pnpm lint` | `eslint .`, çıkış 0 |
| `pnpm typecheck` | Üç workspace typecheck, çıkış 0 |
| `pnpm format:check` | `All matched files use Prettier code style!` |
| `pnpm consumer:check` | `CONSUMER CHECK PASSED` |
| Registry | `REGISTRY INSTALL PASSED: shadcn-vue 2.8.2, 10 items, 26 source files; typecheck and build passed` |
| Kayıtlı tarball host'u | `REGISTERED VITEPRESS CONSUMER PASSED: 6 figures, Callout/Quote/Terminal rendered; Footnotes fallback preserved` |
| Kayıtsız tarball host'u | Üç mevcut figure ve dört native upgrade fallback geçti |
| Paket tipleri | Bundler/NodeNext, `skipLibCheck=false`; yeni üç prop için yanlış tipler reddedildi |
| Tree shaking | Tek Vue runtime; full 185107 byte, GraphStack 166199 byte |

Başlangıçta 265 test vardı: **30 yeni test** (Vue 22, Markdown 3, docs 5).
Bağımsız elle yazılmış beklentiler upstream prose, attribution, terminal
satırlarını/sınıflarını doğrular. Production fixture'ında önce iki yol ayrı
beklentilerle sınanır, ardından DOM eşitliği ölçülür. Yalnız caption kimlikleri
ve Vue yorum düğümleri normalize edilir; kod boşlukları sıkıştırılmaz.
Üç bileşenin SSR çıktısı jsdom içinde mismatch uyarısı olmadan aynı DOM ile
hydrate edildi. Bu kontrol gerçek tarayıcı görsel ölçümü değildir.

Build sırasında önceki compiler fallback fixture uyarıları beklenen şekilde
sürüyor. Registry CLI bağımlılıklarında altı deprecated transitive dependency
uyarısı var; bu teslimatta bağımlılık güncellemesi yapılmadı.

## Tarayıcıda ölçülecekler

`/components/callout`, `/components/quote`, `/components/terminal` sayfalarında
light/dark, mobil genişlik, font/glif fallback, uzun satır kaydırma, reduced
motion, JS kapalı görünürlük ve CLS ölçülecek. `Quote` kenarlık/padding reset
görünümü, `Callout` glyph hizası ve `Terminal` satır aralığı karşılaştırılacak.
Önceki Faz 3 raporundaki 960–1279 px VitePress nav kayması bu kapsamda
değiştirilmedi. Bu teslimatta gerçek tarayıcı veya yeni E2E oturumu çalıştırılmadı.

## Git teslimatı

İlk imzalı commit denemesi `gpg: signing failed: No secret key` hatasıyla
başarısız oldu. Ardından açık izinle imzasız `4fcc486` commit'i oluşturuldu
ve `origin/main` dalına push edildi. Faz 4B başlangıcında `git status --short`
boş çıktı verdi; `git rev-parse HEAD origin/main` iki referans için de
`4fcc48609852e1b2a9e2a5ec0b148debc2e7e1fd` döndürdü. Git teslimat engeli yoktur.
