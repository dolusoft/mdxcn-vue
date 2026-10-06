# Markdown derleme arayüzü (Faz 2B-3)

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

Plugin, `html_block` kuralından önce ham blokları alır. `md.block.parse` ve
`md.inline.parse` çağrıları heading anchor ve highlighter işlemlerinden önce
model üretir. JSON, HTML attribute için escape edilir ve bileşene `v-bind` ile
aktarılır; başarılı blokta Markdown slotu kaldırılır. Çok satırlı açılış etiketi
en fazla 33 satırdır; açılış/kapanış kendi satırlarında olmalıdır. Dış HTML
sarmalayıcı ile bileşen arasında Markdown blok sınırı için boş satır gerekir.

`renderLinks: true` seçeneği host `link_open` renderer işlevini kullanarak
VitePress URL dönüşümünü, dead-link kaydını, `title`, `target`, `rel` alanlarını
korur. Varsayılan `false`, özgün href değerini korur. Diğer host core dönüşümleri
(örneğin typographer) bu sınırlı model derlemesinin parçası değildir.

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
Runtime Markdown/Comark, alert/footnote ve `withMdxcn` dönüşümleri bu fazın
dışındadır. `GraphTimer` derleme desteği eklenmedi; mevcut runtime sözleşmesi sürer.

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
