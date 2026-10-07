# Faz 10B — ASCII filtreleri ve Markdown entegrasyonu

Sistemden alınan zaman: 2026-10-07 Çarşamba 05:11 (Europe/Istanbul).
Başlangıç `main`, `e870011`; çalışma ağacı temizdi. Salt okunur upstream
checkout `16d817ad5ec54d89142e4c1cf26027b60d6df853`, çalışma ağacı temiz.

## Teslimat ve `mdx` kararı

Repo içinde önceden ASCII çizici bulunmadığı komutla doğrulandı. Upstream'in
framework bağımsız TS çizicileri `src/knap/` altında taşındı; Vue modellerine
bağlanmadı. `graphFilters`, `createGraphFilters`, metadata, filtre adları,
`resolveGraphProps` ve public tipler kök girişte ve Vue import etmeyen
`mdxcn-vue/knap` girişinde sunulur. Registry aynı kaynakları dağıtır.
46 filtre vardır: 39 fenced ASCII, yedi varsayılan Comark YAML çıktısı.
`rawValue`, JSON, title, varsayılan alan, content `body`, record tablo dönüşümü
ve uyarı sözleşmesi korunur. Bu print şeması Vue slot/compiler modeli değildir.

Mevcut `mdxcn-markdown/withMdxcn`, alert/byline/shell/footnote dönüşümü için
yeterlidir; yeni compiler veya React component-map API'si eklenmedi. Ancak
`Footnotes` Vue bileşeni eksikti. Bu yüzden yalnız belge notu yeterli bulunmadı:
ayrı `mdxcn-mdx` registry öğesi `Footnotes`, `Callout`, `Quote`, `Terminal` ve
kaynak bağımlılıklarını dağıtır. Host mevcut Markdown plugin'ini ayrı
yapılandırır ve footnote parser sağlar. `Footnotes` heading/note kimliklerini,
zengin gövdeyi, tüm backlink'leri ve VitePress section özniteliklerini korur.
SSR/hydration, reaktif slot/title güncellemeleri ve custom component sınırı
sınandı. Animasyon ortak `vReveal`, not başına 40 ms, 240 ms tavanlıdır.

`/docs/knap` gerçek filtre çıktısını build sırasında üretir; `/docs/mdx` dört
gerçek Vue bileşenini ve iki backlink'li dipnotu gösterir. Envanter, registry
belgesi, README ve public API sözleşmesi güncellendi. Yeni bağımlılık yoktur;
Knap host'a aittir, mevcut Comark paketleri yalnız test/docs için kullanıldı.
Gerçek Knap engine çalıştırılmadı; filtre sözleşmesi doğrudan ve paketlenmiş
tüketicide sınandı. Dev sunucusu ve npm yayını yapılmadı.

## Bağımsız kanıt ve düzeltilen hatalar

`scripts/capture-knap-upstream.mjs` yalnız upstream kaynağını çalıştırarak 46
sabit JSON fixture üretir; üretim portunu import etmez. Yeniden üretim komutu:

```text
node scripts/capture-knap-upstream.mjs C:/Users/zahid/source/github/tmp/mdxcn-src
UPSTREAM_FIXTURES 46
```

39 ASCII çıktısının tamamı upstream ile bayt düzeyinde eşittir. İçerik grammar'ı,
tablo hizası/footer, ağaç, glifler, çerçeve boşlukları ve newline düzeni dahildir.
Fixture'lar her ailenin bir örneğini kapsar; tüm olası girdiler için parite
iddiası değildir. Funnel'ın upstream locale davranışı değiştirilmedi.

İnceleme sırasında upstream'e göre şu düzeltmeler yapıldı:

- `resolveGraphProps` ve Comark serialization hataları da uyarı + özgün değer
  sınırına alındı; upstream yalnız ASCII çizimini bu sınırda tutuyordu.
- İç içe YAML nesnelerinin newline/indent çıktısı, boş map ve iç içe dizi
  desteği düzeltildi. YAML boolean/null gibi string değerleri ve özel anahtarlar
  tırnaklanır; non-finite veya desteklenmeyen scalar değerler fallback verir.
  Gerçek `parseMarkdown` ile iç içe verinin korunması sınandı.
- Waffle'ın sıfır/negatif/non-finite sütunları ve geçersiz cell boyutu çizimden
  önce reddedilir. Upstream sıfır sütunda sonlanmayan döngüye girebiliyordu.
- Saf filtre/map çağrıları `@__PURE__` ile işaretlendi. `getModuleIds()`
  çıkarılmış print chunk kimliğini de gösterdiği için tüketici ayrıca gerçek
  emitted module baytlarını denetler. Yalnız `GraphStack` kullanan tüketicinin
  son JavaScript'inde ve emitted modüllerinde Knap/ASCII/parser kodu yoktur;
  yasak bağımlılık kontrolü korunur.

İlk lint turunda `Footnotes` upstream adını koruyan mevcut istisna listesine
eklendi ve gereksiz regex escape kaldırıldı. İlk parser test beklentisi Comark'ın
`:value` binding önekine düzeltildi; parser çıktısı değiştirilmedi. Düzenleme
sırasında tüketici betiğindeki Unicode metin yanlış Windows kodlamasıyla
okundu; UTF-8 byte kontrolü bunu yakaladı ve özgün karakterler geri yüklendi.
Bu geçici hata son kabul zincirinden önce giderildi.

## Ayrı docs düzeltmeleri

`5cc789e` ile 9B/9C raporları düzeltildi; `1481ac4` ile yanlışlıkla değişen
LF satır sonları geri yüklendi. Her iki imzasız commit normal push ile gönderildi.
Activity `RangeError` iddiası üretilemediğinden kaldırıldı. Upstream ve port
işlevleri çalıştırılarak `2026-3-5` ve ` 2026-03-05` için upstream bir hafta,
port sıfır hafta ürettiği doğrulandı; UTC taşması korunur. Countdown'ın
timezone'suz ISO değerlerini UTC okuması tutarlılık tercihidir; SSR'de `now`
yoktur ve hydration zorunluluğu değildir.

`- 2026-03-02: 1 2` ve devam satırındaki `3 4`, Vue Markdown derlemesinde dört
gün verir; upstream newline nedeniyle sıfır gün verir. Ham VNode içinde newline
aynen bırakılırsa port da sıfır gün verir. Brifingdeki fark bu nedenle derlenmiş
Markdown/template yolu olarak sınırlandırıldı; ham okuyucuya genellenmedi.
Komut kanıtı `f10b-probe.mjs` ve `f10b-softbreak.mjs` scratch dosyalarındadır.

## Son kabul

Son kaynak değişikliklerinden sonra sıralı zincirde bütün çıkış kodları **0**:

```text
pnpm install         PASS: Already up to date
pnpm -r build        PASS: Vue, Markdown, VitePress production build
pnpm -r test         PASS: Vue 893, Markdown 374, docs 78
pnpm lint            PASS
pnpm typecheck       PASS: üç workspace
pnpm format:check    PASS: All matched files use Prettier code style!
pnpm consumer:check  PASS: CONSUMER CHECK PASSED; fixture removed
pnpm registry:build  PASS: 52 items from library sources
pnpm registry:check  PASS: 52 items from library sources
```

**75 yeni test**: Vue 73, docs 2. Toplam **1345**, başlangıç toplamı 1270.
Consumer: NodeNext `skipLibCheck=false`, negatif prop/filtre tipleri, gerçek
Comark parser → filtre YAML → Vue renderer, üç compiler figure ve 46 kayıtlı
figure geçti. Kayıtsız host için dört native fallback kontrolü korunur;
kayıtlı host dipnotu artık Vue çerçevesinde render eder. Registry CLI kapalı
stdin ile promptsuz kurulum, payload/source eşitliği, kopyalanmış filtre ve
`Footnotes` kullanımını içeren tüketici typecheck/build kontrolü geçti:
**52 öğe, 111 kaynak dosyası**.

`GraphStack` bundle ölçümü değişmedi: toplam 168744 bayt, Vue hariç library
14721 bayt; tek Vue runtime girişi. Kabul log'u
`C:/Users/zahid/source/github/tmp/mdxcn-vue/f10b-acceptance.log`, sonuçlar
aynı dizindeki `consumer-results.json` dosyasındadır. Beklenen mevcut Markdown
fallback ve kurulum bağımlılık uyarıları korunur; başarısız/atlanan kabul adımı
yoktur. Teslimat commit'i açık izinle imzasız ve hook atlamadan atılır, normal
push sonrası Git durumu son mesajda komutla bildirilir.

Tarayıcı/E2E ölçümü yapılmadı. Dipnot anchor/backlink odağı, uzun içerikte yatay
scroll, font/glif fallback, light/dark kontrastı, reduced motion, observer/WAAPI
zamanlaması ve CLS canlı tarayıcıda ölçülmelidir. Otomatik SSR/hydration ve
production build bu ölçümlerin yerine geçmez.
