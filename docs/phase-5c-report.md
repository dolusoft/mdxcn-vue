# Faz 5C — GraphTimeline, GraphSpec ve küçük düzeltmeler

Başlangıç `main`, `4581f3f`; çalışma ağacı temizdi. Upstream checkout
`16d817ad5ec54d89142e4c1cf26027b60d6df853` komutla doğrulandı. Bileşenler,
`itemParts`, `dropLead`/`dropText` yardımcıları ve altı upstream örneği gerçek
kaynaklardan okundu. Dev sunucusu başlatılmadı; npm yayını yapılmadı.

## Küçük düzeltmeler

- `25e95df`: `StateListItem` modeline isteğe bağlı `head`/`body` eklendi.
  Ortak host okuyucusu bunları ve özgün VNode parçalarını sağlar; Chat aynı
  `itemParts` işlevini kullanır. Eski alanlar ve bileşen grammar davranışı
  korundu. State-list/Chat regresyonlarında 62 test geçti.
- `cacc044`: Callout fence görünümü `markdown-contract.md` içinde sınır olarak
  belgelendi. Gerçek VitePress renderer testi `div.language-js`, `button.copy`
  ve `span.lang` düğümlerini doğrular. Host CSS kaynağında fence arka planı ve
  dış boşluklar ayrıca incelendi: brifingdeki koyu arka plan yalnız dark tema
  için geçerlidir; gerçek değer temaya bağlıdır. Dikey margin `1rem`, yatay
  margin dar ekranda `-1.5rem`, geniş ekranda `0` olur. Genel CSS sıfırlaması host kopyalama/dil ve
  highlighter arayüzünü değiştireceği için eklenmedi.
- `536720e`: Quote prose sınıfındaki ikinci `leading-relaxed` kaldırıldı;
  GraphProse zaten bu sınıfı sağlar. 23 regresyon testi geçti. Son teslimatta
  Prettier bu çağrıyı tek satıra indirdi ve registry payload yeniden üretildi.
- `837bce3`: tüketici sonucunun yolu açıkça mutlaklaştırıldı; göreli
  `MDXCN_CONSUMER_DIR` repo tabanına bağlandı. **Brifingdeki çift dizin hatası
  mevcut varsayılan kaynakta yeniden üretilemedi:** varsayılan yol zaten doğruydu.
  Düzeltilen risk, göreli override değerinin çağıranın çalışma dizinine bağlı
  olmasıydı. Push sırasında bir kez DNS/thread hatası oluştu; normal tekrar
  başarılı oldu, git config değiştirilmedi.

## GraphTimeline ve GraphSpec

- Veri (`events`/`rows`) → derleyici `list` girdisi veya boş olmayan Markdown
  listesi → `Event`/`Field` sırası; boş dizinin slotu bastırması ve null fallback
  korunur. Item etiketleri typed schema üzerinden okunur; çocuk metni label/value
  fallback sağlar, açık boş string korunur. `note` Vue `VNodeChild` içerir.
- Timeline `date: label — note` grammar, saat metni, gövdenin inline nota
  önceliği, yalnız head içindeki durum işaretleri ve bold önceliğini korur.
  Spec başlık/gövde ayrımını, head accent davranışını ve önek kırpılırken
  kod/link/strike düğümlerini korur. Derleyicinin desteklemediği token değerleri
  konumlu uyarıyla runtime yolunda kalır.
- Upstream DOM, sınıf ve a11y yapıları; `ol[role=list]`, dekoratif glyph ve
  connector alanları, `dl`/`dt`/`dd` ve caption ilişkileri doğrulandı. Reveal
  gecikmesi Timeline için 50 ms artış/250 ms tavan, Spec için 40 ms artış/200 ms
  tavan kullanır. 60 satırda yalnız son satırın görünmesi ayrıca sınandı.
- Shipped, incident, night, type, ship-to ve install örnekleri production
  fixture'ında 16 figure oluşturur. Bağımsız içerik/sınıf beklentileri önce
  sınanır; sonra Markdown/runtime ve uygun örneklerde veri/item DOM eşitliği
  doğrulanır. Yalnız Vue yorumları ve caption kimlikleri normalize edilir;
  gerçek kimlik benzersizliği ayrıca sınanır.
- Her iki bileşen için görünür SSR, jsdom hydration sırasında mismatch
  yokluğu, prop/item normalize ve dinamik slot güncellemesi testleri eklendi.
  Dinamik rich başlık testi gerçek bir hatayı ortaya çıkardı: `dropText`
  klonlarında eski TEXT/block ipuçları güncellemede `[object Object]`
  üretiyordu. Değişen çocuk yapısının ipuçları sıfırlandı; yeni test ve mevcut
  Chat regresyonları geçti.
- Public API/declaration listeleri, Vue tip fixture'ı, Markdown derleme yolu,
  docs/sidebar kayıtları, ESLint item adları, README ve registry güncellendi.

## Kabul çıktısı

Aşağıdaki tam zincir **çıkış 0** verdi:

```sh
pnpm install && pnpm -r build && pnpm -r test && pnpm lint && pnpm typecheck && pnpm format:check && pnpm consumer:check
```

| Kontrol | Çıktı |
| --- | --- |
| Install | `Already up to date` |
| Build | İki paket + VitePress client/server/statik sayfalar geçti |
| Test | Vue **291**, Markdown **166**, docs **43**; **500 geçti**, atlanan yok |
| Lint / typecheck | Çıkış 0; üç workspace typecheck geçti |
| Format | `All matched files use Prettier code style!` |
| Consumer | `CONSUMER CHECK PASSED` |
| Kayıtlı VitePress host | **15 figures**, iki yeni bileşenin kod/notları doğrulandı |
| Registry CLI | **19 items, 46 source files; typecheck and build passed** |
| Paket tipleri | Bundler/NodeNext, `skipLibCheck=false`; yanlış alan türleri reddedildi |
| Tree shaking | Tek Vue runtime; full 210703 byte, GraphStack 166623 byte |
| Yalnız kütüphane | Vue hariç full 49044 byte, GraphStack 12752 byte |

Başlangıç 458 testti: **42 yeni test** (Vue 20, Markdown 15, docs 7).
`TimelineSpecTypes.vue` içinde iki ayrı kasıtlı hatayla kök `pnpm typecheck`
kapsamı doğrulandı; her biri çıkış 1 verdi:

```text
test/fixtures/TimelineSpecTypes.vue(20,38): error TS2322: Type 'number' is not assignable to type 'string'.
test/fixtures/TimelineSpecTypes.vue(20,47): error TS2322: Type 'number' is not assignable to type 'string'.
```

Fixture geri alındıktan sonra tam kabul zincirindeki typecheck çıkışı 0 oldu.
Kanıtlar `C:/Users/zahid/source/github/tmp/mdxcn-vue/` altında
`f5c-acceptance.log`, `f5c-negative.log`, `consumer-results.json` dosyalarındadır.
Sonuç dosyası tam bu mutlak konumda oluştu; tüketici geçici fixture'ını kaldırdı.

## Değişen beklentiler ve sınırlar

Eski state-list traversal testindeki description beklentisine yalnız yeni
`head`/`body` alanları eklendi; nested sinyal ve eski state sonuçları değiştirilmedi.
Public API snapshot'larına yeni adlar, tüketici figure sayısına iki yeni
bileşen eklendi (13 → 15). Başka eski davranış beklentisi değiştirilmedi.
Yeni testlerin ilk yazımında syntax ve union çıkarımı hataları düzeltildi;
lint'te kullanılmayan import kaldırıldı. Kabul zincirinde kırmızı kalan adım yok.

React Motion yerine mevcut `vReveal`, Vue item marker ve compiler `list`
girdisi kullanılır. Custom bileşen sınırları opak, Fragment şeffaftır. Spec veri
değeri upstream gibi string'dir; zengin inline değer için liste kullanılır.
Callout VitePress fence görünümünün sınırı bilinçli olarak korundu.

Tarayıcı/E2E oturumu yapılmadı. Light/dark, dar ekranda Timeline tarih sütunu
ve Spec uzun kod/link taşması, odak/ekran okuyucu sırası, JS kapalı görünürlük,
reduced motion, CLS ve gerçek observer/WAAPI gecikmesi tarayıcıda ölçülecek.

Son teslimat imzasız commit, hook atlamadan ve normal push ile yapılır; commit
kimliği, temiz çalışma ağacı ve `origin/main` eşitliği son mesajda komut
çıktısıyla bildirilir.
