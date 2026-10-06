# Markdown derleme arayüzü (Faz 2B)

`packages/mdxcn-markdown` henüz derleyici içermez. Hedef arayüz:

```ts
interface CompiledGraphStack {
  kind: 'graph-stack'
  props: {
    title: string
    rows: StackRow[]
    palette?: GraphPalette
    ticks?: number
  }
}
```

`StackRow`, `StackSegment` ve `ProseNode` model tipleri `mdxcn-vue` paketindeki
framework bağımsız `src/core/` dizininde tanımlıdır. Derleyici `markdown-it`
token değerlerini bu modele dönüştürecek; Vue VNode üretmeyecek ve runtime
Markdown bağımlılığı eklemeyecek. `labelContent` alanı metnin zengin biçimini,
`label` alanı erişilebilirlik metnini ve satır anahtarını taşır. Kaynak konumlu
tanılar, desteklenen sayı grammar kuralları ve güvenli bağlantı politikası Faz 2B
kararlarıdır. `segmentsFromText` düzeltmesi tam sayı grammar tanımı değildir.

Faz 2A okuyucusu yalnız slot kökündeki `ul > li` yapısını, isteğe bağlı `p`/`span`
ve `strong`/`em`/`code`/`a` düğümlerini kabul eder. `Fragment` açılır, `Comment`
elenir. Özel bileşen sınırları ve iç içe listeler yorumlanmaz. Item şeması yalnız
bildirilen alanları okur; kebab-case anahtarları camelCase biçimine çevirir,
boolean boş değeri `true` yapar ve varsayılanları uygular. Slotlar `computed`
içinde önbelleğe alınmaz; her render sırasında okunur.
