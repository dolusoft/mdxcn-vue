# Faz 11A — Yayın öncesi temizlik

Başlangıç `main`, `33c90b4`; çalışma ağacı temizdi. Sistem zamanı:
2026-10-07 Çarşamba 05:31 (Europe/Istanbul).

## Kök giriş noktasının tree-shaking davranışı

Brifingdeki 135.831 bayt eşitliği yeniden üretilemedi. Aynı koşullardaki yeni
ölçümde iki bileşen zaten farklı boyuttaydı; ancak kullanılmayan item kayıtları
ve frame yardımcıları bundle içinde kalıyordu. `sideEffects: ["**/*.css"]`
zaten vardı; CSS kök JavaScript girişinden yüklenmiyordu. `graphComponents` ve
knap fabrika çağrıları zaten `@__PURE__` işareti taşıyordu.

Eksik işaretler bileşenlerin `defineComponent`, item işaretçilerinin `defineItem`
ve frame yardımcılarının `host` çağrılarındaydı. Bu çağrılar yalnız döndürdükleri
nesneyi oluşturur. `defineItem` yalnız yeni nesnenin şemasını `WeakMap` içine
yazar; kullanılmayan nesnenin kaydını atmak kullanılan nesnelerin kaydını etkilemez.
Public API, kayıt yapısı ve CSS sözleşmesi korunarak bu çağrılar işaretlendi.
Registry kaynak çıktıları yeniden üretildi.

`scripts/tree-shaking-check.mjs`, aynı Vue runtime ve `minify=false` ile Vite
8.3.3/Rolldown production build çalıştırır. Tek girişin export değeri global
bir alana atanır; böylece import tamamen atılamaz. “Tümü” kök export kümesinin
tamamını canlı tutar. HTML, mount ve CSS bu ölçümde yoktur; Vue dahildir.

| Kök import | Önce (bayt) | Sonra (bayt) |
| --- | ---: | ---: |
| Tüm export değerleri | 258214 | 258797 |
| `GraphStack` | 74893 | 51045 |
| `Footnotes` | 69472 | 45333 |

Tek bileşen/tüm export oranı ve `GraphStack` bundle içindeki ilgisiz
Footnotes/knap/Comark ile item/frame sembollerinin yokluğu otomatik sınanır.
Kontrol `consumer:check` içine bağlandı; paketlenmiş tarball tüketicisinde de
tek bileşen boyutu ve `Footnotes` için ayrı build sınanır.

İlk doğrulama: Vue paketinde **900 test geçti**; tarball tüketici kontrolü
**52 registry öğesi / 111 kaynak dosyası** ile geçti. Mount içeren tüketicide
`minify=false`: tüm kullanılan bileşenler 300122, `GraphStack` 166498,
`Footnotes` 160604 bayt. Bunlar yukarıdaki global export ölçümünden farklı
girişlerdir; iki ölçüm birbirinin önce/sonra değeri olarak kullanılmaz.

## Doküman iddialarının doğrulanması

Upstream checkout `16d817ad5ec54d89142e4c1cf26027b60d6df853` komutla doğrulandı.
Activity kaynak dosyasındaki işlevler TypeScript ile derlenip çalıştırıldı:
`days=[{date:'+275760-09-13',count:1}]`, `weekStartsOn=1` gerçekten
`RangeError: Invalid time value` üretiyor. Brifingdeki `toISO(last)` kaynakta
yoktur; hata döngüdeki `toISO(time)` çağrısındadır. Portun derlenmiş `parseUTC`
işlevi aynı tarihi reddediyor; `buildWeeks` sonucu `[]`. Faz 9B raporu düzeltildi.

Knap için `graph_meter({value:'oops'})` uyarısız `NaN%`,
`graph_spec({rows:[{label:'x'},{label:'y',value:{x:1}}]})` uyarısız `undefined`
ve `[object Object]` üretti. Doküman yalnız okuma hatası veya throw durumunda
uyarı verildiğini söylüyor; şema doğrulaması iddiası kaldırıldı. Güvenilmeyen
filtre girdisi ve daha uzun ASCII fence davranışı açıklandı.

Comark 0.7.0 ile çalıştırılan gerçek parse çıktısı, `body` içindeki tek başına
`::` satırından sonraki metnin blok dışında kaldığını, inline `::` ifadesinin
blok içinde kaldığını gösterdi. `coerceProps` string `once`, `only`, `onclick`
alanlarını attı. `security()` eklentisi çalıştırıldı; `javascript:` URL ve inline
handler kaldırıldı, ancak seçeneksiz kullanımda `<script>` ve `<iframe>` etiketleri
kalır (inceleme ile doğrulandı); doküman örneği `blockedTags` ile güncellendi.

Footnotes bilgisi ayrı bir sayfada değil `apps/docs/docs/mdx.md` içindedir;
not oraya eklendi. Production HTML içinde iki backlink yalnız `↩︎` glifi
taşıyor ve `aria-label` yok. Host bağlantılarını ve dilini değiştirmemek için
bu kapsamda yeni bir label eklenmedi. Düzeltme (inceleme): bu eksik upstream ile
ortak DEĞİL. Upstream mdxcn GFM dipnotlarını remark-gfm ile üretir ve geri
bağlantıları `aria-label="Back to reference 1"` taşır (remark-gfm 4 ile
doğrulandı); `markdown-it-footnote` bağlantıları yalnız `↩︎` içerir. Bu, Vue
yolunun upstream'e göre erişilebilirlik farkıdır ve doküman bunu böyle söyler.

Docs production build geçti. Kanıtlar yetkili scratch dizinindeki
`f11a-docs-evidence.mjs`, `f11a-docs-evidence.log`, `f11a-docs-build.log`
dosyalarındadır.

## Knap fixture ve mutant kanıtları

`scripts/capture-knap-edge-cases.mjs` upstream commit kimliğini doğrular ve
yalnız upstream TypeScript kodunu çalıştırarak bağımsız fixture üretir.
`knap-edge-cases.json` normal çıktıları upstream byte değerleriyle saklar.
YAML anahtarlarında upstream zaten hatalı olduğu için upstream çıktısı ile
elle tanımlanan düzeltme ayrı alanlardadır; port çıktısı fixture üretiminde
kullanılmaz. Testler düzeltilmiş YAML değerini gerçek Comark parse sonucuyla
da karşılaştırır. Funnel fixture için locale `en-US` altında sabitlenir;
test ayrıca üretim çağrısının locale argümanı vermediğini doğrular. Böylece
host varsayılan locale sözleşmesi korunur.

| Geçici mutant | Fixture girdisi | Sonuç |
| --- | --- | --- |
| `padEnd` kırpmasını kaldır | `abcdef`, genişlik 3 → `abc` | Çıkış 1, assertion başarısız |
| Funnel `toLocaleString()` yerine `String()` | `1234.5` → `1,234.5` | Çıkış 1, assertion başarısız |
| Rank `Math.round` yerine `Math.floor` | `0.26`, `max=1`, `ticks=10` → 3 dolu hücre | Çıkış 1, assertion başarısız |
| `flowMap` anahtar tırnaklamasını kaldır | `x, y` anahtarı | Çıkış 1, assertion başarısız |
| İç içe scalar anahtar tırnaklamasını kaldır | `outer` altında `x: y` | Çıkış 1, assertion başarısız |
| Map taşıyan anahtar tırnaklamasını kaldır | `x: y` altında `child` | Çıkış 1, assertion başarısız |

Her mutant tek başına gerçek kaynakta uygulanıp test çalıştırıldı; hedef
fixture assertion hatası doğrulandı. Kaynak her seferinde `finally` içinde
byte düzeyinde geri yüklendi ve SHA-256 eşitliği sınandı. Ardından temiz
kaynakla 19 yeni test tekrar geçti. Beş istenen kategori, iç içe anahtarların
iki dalı nedeniyle altı mutant olarak sınandı. Kanıtlar scratch dizinindeki
`f11a-mutations.mjs`, `f11a-mutants.json`, `f11a-mutant-0.log` …
`f11a-mutant-5.log` ve `f11a-mutants-pristine.log` dosyalarındadır.

Waffle ASCII çıktısı `cells=0..10000`, `columns=1..200` tam sayı değerleriyle
sınırlandı. Çok küçük pozitif kesirli `columns`, yalnız üst sınır konduğunda
hâlâ çok uzun döngü üretebildiği için tam sayı şartı da gerekliydi. Sınır dışı
girdiler tek `FILTER_WARNING` uyarısıyla özgün değeri döndürür. Bu upstream
farkı docs içinde belgelenir. Üst sınırların hemen üzeri, çok büyük değerler,
kesirli değerler, izin verilen sınırlar ve sıfır hücre sınandı. Registry
payload tekrar üretildi. Yeni testler Activity tarih sınırını ve upstream'in
uyarısız bozuk çıktısını da kapsar.

## Son kabul

`pnpm install --frozen-lockfile` mevcut lockfile ile geçti; lockfile değişmedi.
Tüm workspace build işlemleri production modunda çalıştırıldı. Sonuçlar:

| Kontrol | Çıktı |
| --- | --- |
| Install | `Lockfile is up to date, resolution step is skipped`; çıkış 0 |
| `pnpm -r build` | Vue, Markdown, docs production build; çıkış 0 |
| `pnpm -r test` | Vue **919**, Markdown **374**, docs **78** geçti; toplam **1371** |
| `pnpm lint` | ESLint; çıkış 0 |
| `pnpm typecheck` | Üç workspace; çıkış 0 |
| `pnpm format:check` | `All matched files use Prettier code style!`; çıkış 0 |
| `pnpm consumer:check` | `CONSUMER CHECK PASSED`; 52 registry öğesi, 111 kaynak; çıkış 0 |

Kabul log dosyası: `C:/Users/zahid/source/github/tmp/mdxcn-vue/f11a-acceptance.log`.
Başarısız veya atlanan kabul adımı yoktur. Rapor tamamlandıktan sonra format
kontrolü yeniden çalıştırıldı. İlk commit sonrasındaki 258774 bayt “tümü”
ölçümü Waffle sınır kontrolüyle 258797 oldu; tablo son kodu gösterir.
Mevcut fixture fallback ve registry bağımlılık uyarıları test başarısızlığı
değildir. Dev sunucusu ve npm yayını yapılmadı. Son diff; public API,
`defineItem` kayıtlarının kullanılan nesneler için korunması, hata yolları,
locale sözleşmesi ve registry eşitliği açısından incelendi. Açık bir kod
bulgusu kalmadı. Üç commit açık izinle imzasız, hook atlamadan ve kalıcı Git
config değişikliği olmadan oluşturulur; her commit hemen normal push edilir.
