# Markdown derleme arayüzü (Faz 2B-4)

`mdxcn-markdown` paketindeki `mdxcnMarkdown` işlevi bir `markdown-it` plugin'idir.
VitePress `markdown.config` alanına takılır; ek Vite transform gerekmez:

```ts
import { mdxcnMarkdown } from 'mdxcn-markdown'

export default {
  markdown: {
    config: (md) => { md.use(mdxcnMarkdown, { renderLinks: true }) },
  },
}
```

`StackRow`, `StackSegment` ve `ProseNode` model tipleri `mdxcn-vue` paketindeki
framework bağımsız `src/core/` dizininde tanımlıdır. Derleyici `markdown-it`
token değerlerini bu modele dönüştürür; Vue VNode üretmez. Host tarafından
sağlanan parser kullanılır; runtime Markdown renderer eklenmez.
`labelContent` alanı metnin zengin biçimini,
`label` alanı erişilebilirlik metnini ve satır anahtarını taşır.
`segmentsFromText` düzeltmesi tam sayı grammar tanımı değildir.

## Desteklenen derleme blokları

- `GraphStack`: doğrudan `ul > li` listeleri → `rows`; satır etiketi içinde
  `strong`, `em`, `code`, `link` korunur. İç içe ve sıralı listeler fallback kullanır.
- `GraphTable`: tek Markdown tablosu → `headers`, `rows`, isteğe bağlı `footer`
  ve `align`. Son satırın ilk hücresi yalnız bold ise veya `Total` yazıyorsa ve
  en az iki gövde satırı varsa footer olur. `center` upstream gibi yok sayılır.
- `Endpoint`: paragraflar, en fazla bir parametre tablosu ve fence bölümleri →
  `method`, `path`, `params`, `blocks`, `about`. Parametre tablosunda footer
  algılaması yapılmaz; boş açıklama `undefined` olur. `about` alanı paragraf
  başına bir `ProseNode[]` taşır. Kod girintisi korunur; yalnız bir son newline
  çıkarılır. `$ ` ve `curl` önekleri `request` etiketi üretir.
- `Annotate`: ilk fence → `code` ve varsayılan `title`; doğrudan `ol`/`ul`
  notları → zengin `ProseNode[][]` içeren `notes`. İşaretler runtime core
  okuyucusunda ayrıştırılır. İki veri alanının önceliği bağımsızdır; boş değerler
  fallback yapmaz. Kod yoksa boş bir satır çizilir. Birden fazla paragraf veya
  iç içe liste içeren notlar yapıyı korumak için runtime okuyucusuna bırakılır;
  upstream gibi iç içe not listeleri çizilmez.
- `Env`: ilk fence (boş olsa da) → boş olmayan doğrudan liste → ham metin;
  sonuç `vars` dizisidir. Açık `vars` alanı tüm Markdown girdilerinden önce gelir.
  Liste metni `KEY: value — note` biçimindedir; kalın öğe `required` bayrağını
  üretir. Core `parseEnv` upstream gösterim grammar davranışını korur: boş
  satır yorumları temizler, geçersiz satır atlanır ve ` #` dizisi tırnak içinde
  bile inline yorum başlatır. Bu bir dotenv yükleyicisi değildir.

Plugin, `html_block` kuralından önce ham blokları alır; gövde token değerlerini
host core kurallarına bırakır. Model dönüşümü `inline`, emoji, typographer ve
`text_join` adımlarından sonra, `anchor` adımından önce yapılır. Host entity
renderer işlevinin metin anlamı bir kez çözülür; `text_special` metin sayılır.
JSON, HTML attribute için escape edilir ve bileşene `v-bind` ile
aktarılır; başarılı blokta Markdown slotu kaldırılır. Çok satırlı açılış etiketi
model derleyicisinin desteklediği bileşenlerde en fazla 33 satırdır; açılış/kapanış kendi satırlarında olmalıdır. Dış HTML
sarmalayıcı ile bileşen arasında Markdown blok sınırı için boş satır gerekir.
Açılışın ardından liste varsa önüne boş satır konur. Aksi halde VitePress
listeyi ham HTML metni sayar; iki yol da bu davranışı korur ve uyarı verir.
Kapanışı bulunmayan ve açılış satırında gövde içeren bloklar da konumlu uyarı verir.
Uyarı satırları frontmatter farkını içerir; `@include` konumları genişletilmiş
host dosyasına aittir, dahil edilen dosyaya ayrı kaynak eşlemesi yapılmaz.

`renderLinks: true` seçeneği host `link_open` renderer işlevini kullanarak
VitePress URL dönüşümünü, dead-link kaydını, `title`, `target`, `rel` alanlarını
korur. Varsayılan `false`, özgün href değerini korur. Reference link tanımları
inline dönüşümünden önce tamamlandığından sonraki tanımlar da derlenebilir.
Tablo ve liste metninin boşlukları iki yolda aynı core işleviyle normalize edilir.
Fence dil etiketi `/^[^\s:{[]+/` kuralıyla meta bilgiden ayrılır; VitePress
highlighter işlevinin kısalttığı `c++`, kaynak metadata değerinden geri alınır.
Dilsiz fence blokları `undefined` etiketle korunur. Endpoint kod bölgesinin
erişilebilir adı caption ve kod etiketini birlikte içerir.

## Fallback ve güven sınırı

`{{ }}` interpolasyon, Vue direktifleri, özel bileşenler, item etiketleri, ham
HTML, desteklenmeyen inline/block token'ları ve henüz çözülmemiş reference link
bulunursa blok dönüştürülmez. Açık veri props bulunan bloklar da alan bazındaki
runtime önceliğini korumak için fallback kullanır. Kaynak Markdown normal host
derlemesine bırakılır; `[mdxcn-markdown] dosya:satır` uyarısı nedenini belirtir.
`warn` callback seçeneği aynı bilgiyi yapılandırılmış biçimde alır. Başarılı
derleme bloğunun kaynak aralığı token `map` alanında tutulur.

**Yalnız repo içindeki güvenilir Markdown kullanılır.** Üretilen Vue şablonu
çalıştırılabilir; bu plugin kullanıcı girdisi için sanitization sağlamaz.
Runtime Markdown/Comark bu fazın dışındadır. `GraphTimer` derleme desteği
eklenmedi; mevcut runtime sözleşmesi sürer.

## `withMdxcn` dönüşümleri

Ayrı `withMdxcn` plugin'i aynı güvenilir Markdown host'una takılır.
`alerts`, `quotes`, `terminals`, `footnotes` seçenekleri varsayılan `true` olur.
GitHub alert ve upstream Obsidian alias değerleri `Callout`, son satırındaki
byline işareti `—`/`―`/`–`/`--` olan alıntılar `Quote`, console/session fence
ve baskın `$ ` prompt içeren shell fence blokları `Terminal` hedefini kullanır.
Prompt içermeyen shell script değişmez. Footnote token değerlerini host üretir;
VitePress bunu sağlar, düz `markdown-it` host'u kendi footnote plugin'ini takar.

`components` listesi yalnız host'un kaydettiği `Callout`, `Quote`, `Terminal`,
`Footnotes` adlarını içerir. Listelenen hedefler bileşen etiketi üretir;
`Callout` için `type`/`title`, `Quote` için `by`/`source`, `Terminal` için
`prompt`/`text` değerleri JSON binding ile aktarılır. `Footnotes` özgün host
bölümünü sarar; ID, ileri bağlantı ve backlink değerleri korunur.
Faz 4A'da `Callout`, `Quote`, `Terminal` gerçek Vue bileşenleri olarak sağlanır.
`Terminal` için `text` upstream'de olmayan derleyici girdisidir: açık değer slot
metninden önce gelir; boş string slotu bastırır, `null`/`undefined` slotu okur.
Prose bileşenlerinin gövdesi slot olarak kalır; item adaptörü yoktur.
`Terminal`, `Endpoint`, `Annotate` ve `Env` etiketleri içindeki fence blokları kendi okuyucularına
bırakılır; iç içe otomatik `Terminal` üretilmez.

`withMdxcn` çerçeve içindeki `blockquote` token değerlerini de işler: açık
`Callout` veya `Quote` gövdesindeki alert/byline, kayıtlı hedefe dönüşebilir.
Çerçeve için genel bir dönüşüm engeli yoktur. Yalnız eşleşen kod okuyucusu
etiketleri fence yükseltmesini engeller; HTML yorumları ve kapanışsız etiketler
sonraki fence bloklarını engellemez.

Varsayılan boş liste kaynak konumlu uyarıyla HTML üretir: host alert çıktısı
(kendi alert renderer işlevi yoksa `aside`), byline içeren `blockquote`, host
`pre > code` yapısı ve özgün footnote bölümü. Zengin gövde biçimleri korunur.
Seçenekler yalnız bu plugin'in dönüşümlerini kapatır; VitePress'in kendi alert
işlevi gibi host özelliklerini kapatmaz. Registry dört mevcut bileşeni, üç yeni
prose/fence bileşenini, `Annotate`, `Env`, frame, core ve CSS dosyalarını içerir;
toplam on iki öğedir.

Runtime Endpoint, VitePress `div.language-* > pre` sarmalayıcısını tek seviyede
açar; `button.copy` ve `span.lang` içerik sayılmaz. Highlighter kaynak kodun
sonundaki boş satırları silmişse VNode okuyucusu bunları geri getiremez. Derleme
yolu ham fence değerini korur; anlamlı son newline paritesi fixture'ında bu
nedenle doğrudan `pre > code` runtime girdisi kullanılır.

## Doğrulama

Token → model testleri bağımsız beklenen nesneleri kullanır. Docs config testi
gerçek üç sayfada dönüşümü doğrular. Production fixture'ı derleme/runtime
yollarının her birini bağımsız beklenen hücre, prose, glyph, erişilebilir ad ve
boşluk duyarlı kod değerleriyle sınar; ardından DOM eşitliğini kontrol eder.
Yalnız caption kimlikleri normalize edilir ve Vue yorum düğümleri çıkarılır;
gerçek kimliklerin benzersizliği ve ilişkileri ayrıca doğrulanır. Kod boşlukları
sıkıştırılmaz. Tarayıcı hydration ve görsel ölçüm ayrı doğrulama konusudur.

Faz 2A okuyucusu yalnız slot kökündeki `ul > li` yapısını, isteğe bağlı `p`/`span`
ve `strong`/`em`/`code`/`a` düğümlerini kabul eder. `Fragment` açılır, `Comment`
elenir. Özel bileşen sınırları ve iç içe listeler yorumlanmaz. Item şeması yalnız
bildirilen alanları okur; kebab-case anahtarları camelCase biçimine çevirir,
boolean boş değeri `true` yapar ve varsayılanları uygular. Slotlar `computed`
içinde önbelleğe alınmaz; her render sırasında okunur.

## Terminal açılış etiketi sınırı

`Terminal`, yukarıdaki model derleyicisinin desteklediği bileşenler arasında
bulunmaz. Açık `Terminal` etiketi tek satırda yazılmalıdır; çok satırlı açılış
etiketi Markdown host yolunda desteklenmez:

```md
<Terminal prompt="$">
```

`<Terminal` / `prompt="$"` / `>` biçiminde üç satıra bölünmüş açılış,
`markdown-it` tarafından paragraph ve blockquote olarak okunur. İçindeki console
fence ayrıca otomatik `Terminal` dönüşümü alabilir; dış etiket korunmuş bir
runtime bileşen sayılmaz. 33 satırlık destek bu etikete uygulanmaz.