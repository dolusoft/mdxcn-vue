# Faz 3 karar kapısı

Kanıt değerlendirmesi: 2026-10-07 Çarşamba 01:13 (Europe/Istanbul), bu turda
sistemden alınan zaman. Yerel ortam Node `24.21.0`, pnpm `12.4.1`.

**Karar:** uygulama ve dağıtım kontrolleri, güncel görünürlük/reduced motion
ölçümleri ve iki DevTools UI kanıtı Faz 4 hazırlığı için yeterli. 1280 px
CLS kapısı preload düzeltmesiyle kabul edildi; 960–1279 px aralığındaki
yerleşim kayması Faz 4'te izlenir. Tam görsel matris ve JS kapalı dark tema
kabulü bu kararın dışında kalır. Docs aracı VitePress
`2.0.0-alpha.20` olarak sabit kalsın. Bu karar npm yayını veya tam katalog
kapsamı onayı değildir.

## Kapı kanıtları

| Kalem | Karar | Kanıt | Açık risk / kalan doğrulama |
| --- | --- | --- | --- |
| Production Markdown derlemesi | Geçti | `apps/docs/test/markdown-build.test.mjs`: gerçek docs config, bağımsız beklenen DOM, compile/runtime eşitliği, entity/fence/açılış sınırları; `pnpm -r build` | Trusted Markdown; `@include` kaynak haritası ve dinamik slotlar mevcut sözleşmenin dışında |
| Hydration eşitliği | Otomatik kapı geçti | `stack.test.ts`: stable caption IDs; `table.test.ts`: hydration; `endpoint.test.ts`: visible SSR without mismatches; `timer.test.ts`: üç modda ilk istemci/SSR eşitliği | JSDOM gerçek tarayıcıya eşdeğer değildir; yeni font sonrası canlı kontrol yeniden yapılmalı |
| Prop normalize | Geçti | `stack.test.ts`: own schema, boolean/kebab-case/default, string ticks; `table.test.ts`: field precedence; `endpoint.test.ts`: class/fence normalization; `timer.test.ts`: bağımsız alan önceliği | Kalan 42 bileşenin grammar ve boş girdi öncelikleri ayrı fixture gerektirir |
| JS kapalıyken görünürlük | Geçti | `f3-shots/visibility-nojs.json`: dört sayfa × iki tema tercihi, her grupta 14/14 görünür figure; `scriptsRan=false`, `hasVueApp=false` | Dark tercihte `htmlDarkClass=false`: VitePress inline betiği çalışmadığından bu sonuç dark tema kapı kanıtı değildir |
| Script yükleme hatasında görünürlük | Geçti | `f3-shots/visibility-blocked.json`: dört sayfa × iki tema, her grupta 14/14 görünür figure; `scriptsRan=false`, `hasVueApp=false` | Script engelleme kanıtı her olası mount sonrası exception durumunu kapsamaz |
| Reduced motion | Canlı ve otomatik kapı geçti | `f3-shots/reduced-motion.json`: dört sayfada `reducedMatches=true`, `animateCalls=0`, gizli öğe/figure animasyonu/transition yok; tercihsiz negatif kontrolde animasyon var; `reveal.test.ts` | `GraphStack` düşük opacity değerleri dekoratif öğelerdir; gizli öğe sayısı sıfır |
| Temiz npm tüketimi | Geçti | `consumer:check`: iki tarball, Bundler ve NodeNext `skipLibCheck=false`, yanlış alanlar için `@ts-expect-error`, CSS `@source` negatif kontrolü, production Vite/VitePress build, tek Vue runtime | Paketler `0.0.0`; ilk yayın öncesi peer sürüm aralığı kararı gerekli |
| Temiz registry tüketimi | Geçti | Gerçek `shadcn-vue 2.8.2 build` eşitlik kontrolü; kendi betiğimizin `public/r` üretimi; `add` (kapalı stdin, `--yes`/`--overwrite` yok), yedi öğe/21 dosya, typecheck/build | `.txt` olmadan kurulum geçti; yalnız CRLF/LF farkı giderildiğinde içerik birebir aynı. `~/` hedefi ve host CSS import'u gerekir; [kanıt](registry.md) |
| CLS, 1280 px | Preload düzeltmesiyle kabul | `f3-shots/cls-1280.json`: Slow 4G en yüksek `graph-table` değeri `0.0058948865`; `graph-title-ink` genişliği fallback 314 px → Geist 248 px. `cls-1280-preload-fixed-sim.json`: en yüksek `0.0000436589` | Başlık fallback farkı kabul; preload düzeltmesi yeterli. Simülasyon düzeltme sonrası yeni canlı ölçüm değildir; brifingdeki `≤0.00004` kesin sınırı hatalıdır |
| CLS, 960–1279 px | Faz 4 izleme | `f3-shots/cls-992-preload-fixed-sim.json`: 992 px örneğinde `#VPContent` 52 px kayıyor, CLS yaklaşık `0.0533`; font preload düzeltmesiyle de sürüyor | İlk boyamadan yaklaşık 30 ms sonra oluşan kayma fonttan bağımsız; VitePress yerel nav olası kaynak, sebep doğrulanmadı; aralığın tamamı bu dosyada ölçülmedi |
| Font yükleme | Build kapısı geçti | `stack-build.test.mjs`: `Geist Mono Fallback`, `size-adjust:134.59%`, iki gerçek `.woff2` preload hedefi | Arial bulunmayan sistemlerin yedeği farklıdır; latin-ext font ve glif fallback yolu canlı ölçülmeli |

Güncel arşivde dört sayfa × iki tema tercihi × iki mod (JS kapalı/script
engelli) için 16 kayıt incelendi: her dört sayfalık grupta 14/14 görünür figure,
toplam 56/56. JS kapalı dark tercihin gerçekte light kaldığı ayrıca doğrulandı.
Vue DevTools bileşen/prop ekranı ve Vite DevTools modül grafiği görsel olarak
incelendi. Arşiv kaynakları repo dışında; bütün `f3-shots/*.json` dosyalarının
ve DevTools PNG görüntülerinin SHA-256 özeti `phase-3-evidence.json` içindedir.
Bu düzeltme turunda dev sunucusu veya yeni tarayıcı ölçüm oturumu başlatılmadı.

## Docs aracı kararı

| Ölçüt | VitePress `2.0.0-alpha.20` | `vite-ssg 28.3.0` |
| --- | --- | --- |
| Vue DevTools + Vite DevTools | Geçti: aynı dev sunucusundaki UI'ler `f3-shots/*devtools*.png` ile kayıtlı; Vue bileşen/prop ekranı ve Vite modül grafiği incelendi. `config.test.mjs` development eklentilerini doğrular; production config ikisini çıkarır | Normal Vite eklenti yolu uygun bir adaydır; bu repo için kurulup çalıştırılmadı, iki UI'nin birlikte çalıştığı iddia edilmez |
| SSR build | Workspace ve temiz tarball tüketicisinde client/server build + statik sayfa render geçti | Vue 3 için statik üretim sağlar; mevcut docs sayfaları bu araçla build edilmedi |
| Markdown plugin yolu | Mevcut `markdown.config` üzerinden markdown-it; compiler ve `withMdxcn` host kuralları gerçek testlerle kapsanıyor | Markdown dönüştürme, Vue SFC üretimi, routing, highlighter, anchor ve footnote kuralları ayrıca bağlanmalı; doğrudan host eşdeğerliği kanıtlanmadı |
| Sürüm riski | Alpha: exact pin, lockfile, production DOM testleri ve ayrı yükseltme incelemesiyle yönetilir | Alpha etiketi yok; geçişin kendi entegrasyon ve davranış paritesi riski var |
| Araç uyumluluğu | Yüklü sürüm Vite `^8.2.1` kullanır; workspace Vite `8.3.3` ile geçti | `pnpm view vite-ssg@28.3.0 peerDependencies --json`: Vue `^3.2.10`, Vite 8 ve Vue Router 4/5 aralıkları mevcut; bu, çalışma kanıtı değildir |

**Öneri:** VitePress kalsın. Çalışan Markdown/SSR yolunu değiştirmek için
kanıtlanmış bir arıza yok. Alpha riski açıkça kabul edilmeli; exact sürüm
korunmalı. DevTools bağlantısı veya production Markdown kapısı tekrarlanabilir
biçimde bozulursa ayrı kapsamda `vite-ssg` denemesi yapılmalı. Geçiş yapılmadı.

Kaynaklar: [VitePress Markdown yapılandırması](https://vitepress.dev/reference/site-config#markdown),
[VitePress Markdown uzantıları](https://vitepress.dev/guide/markdown),
[vite-ssg resmî README](https://github.com/antfu-collective/vite-ssg),
[28.3.0 npm sürüm kaydı](https://registry.npmjs.org/vite-ssg/28.3.0).
Kalıcılık/uyumluluk önerisi bu kaynakların ve yerel testlerin değerlendirilmesidir.

## Faz 4/5 sırası ve boyutu

`docs/inventory.md` tablosu komutla sayıldı: 50 katalog satırı; tamamlanan
dört temsili bileşen, frame, Markdown upgrade ve iki adaptör satırı ayrılınca
**42 bileşen** kalıyor. Aşağıdaki boyut tahminleri bileşen sayısıdır; süre veya
bundle boyutu taahhüdü değildir. Adaptörler ayrıca planlanır.

Faz 4'te önce ortak model/çerçeve sözleşmeleri ve erişilebilirlik gözden
geçirilsin; ilk teslimat 1–2. gruplar olsun. Faz 5, 3–8. gruplarla devam etsin.
Her büyük grup 2–4 bileşenlik teslimatlara bölünsün; alan önceliği, bağımsız
grammar fixture'ı, SSR/hydration ve görsel kabul her teslimatta tekrarlansın.

| Sıra | Grammar ailesi | Bileşenler | Tahmini grup boyutu |
| --- | --- | --- | --- |
| 1 | `prose`, `fence` | `Callout`, `Quote`, `Terminal`, `Annotate`, `Env` | 5; upgrade hedeflerini erken kapatır |
| 2 | `state-list` | `Steps`, `Changelog`, `Decision`, `Chat`, `Keys`, `GraphTimeline`, `GraphSpec` | 7; üç küçük teslimat |
| 3 | `numeric-list` | `GraphScore`, `GraphRank`, `GraphFunnel`, `GraphGantt`, `GraphDiff`, `GraphStat`, `GraphWaterfall`, `GraphSlope`, `GraphBullet` | 9; bileşene özgü grammar ile üç teslimat |
| 4 | `sections`, `sections-table`, `invoice`, `table` | `Faq`, `GraphBoard`, `GraphSheet`, `GraphInvoice`, `GraphCompare`, `GraphMatrix`, `GraphHeatmap` | 7; tablo/alan fallback temeli ortak, öncelikler ayrı |
| 5 | `nested-list`, `flow` | `GraphTree`, `GraphCheck`, `GraphFlow` | 3 |
| 6 | `series` | `GraphBars`, `GraphSpark`, `GraphPlot`, `GraphKpi` | 4 |
| 7 | `grid`, `fraction` | `GraphCells`, `GraphMeter`, `GraphWaffle` | 3 |
| 8 | `dated-runs`, `calendar`, `status-runs`, `instant` | `GraphActivity`, `GraphCalendar`, `GraphUptime`, `GraphCountdown` | 4 |

`Footnotes` için envanterde bağımsız bileşen satırı yok; bu nedenle 42 sayısına
eklenmedi. `withMdxcn` host bölümüyle birlikte ayrı kapsamı belirlenmeli.
`runtime-adapter` ve `ascii-adapter` işleri, ailelerin tipli modelleri
sabitlendikten sonra gelir. Tam görsel matris ve yayın kabulü sonraki faza aittir.

## Boyut ve ölçüm sınırı

`consumer:check` sonucu: uygulama JS toplamı dört bileşen için **180.685 byte**,
yalnız `GraphStack` için **166.187 byte** (Vue dahil; source map bağlantı
yorumu dahil, harita dosyaları hariç). Tree-shake farkı **14.498 byte**.

Vue hariç kütüphane payı ayrı satırdır: dört bileşen **23.791 byte**,
`GraphStack` **12.370 byte**. Son, elenmiş JS çıktısının source map eşlemesi
kullanılır; eşlemesiz bağlantı kodu ve satır sonları sayılmaz. Bu rakam gzip
boyutu değildir. UTF-8/harici kaynak ayrımı bağımsız küçük negatif kontrolle
sınanır. Bütün export'ları içeren dağıtım JS dosyalarının toplamı **30.120 byte**.
Brifingdeki yaklaşık 14/30 KB ile bu farklı kapsamları eşitlemedik.

Kabul komutları, commit'ler ve son CI sonucu [Faz 3 raporunda](phase-3-report.md).
