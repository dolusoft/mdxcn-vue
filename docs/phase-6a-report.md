# Faz 6A — GraphScore, GraphRank ve GraphFunnel

Başlangıç `main`, `5229d3b`; çalışma ağacı temizdi. Upstream checkout
`16d817ad5ec54d89142e4c1cf26027b60d6df853` komutla doğrulandı. Üç bileşen,
`graph-markdown` sayı/liste yardımcıları, `GraphStack`, altı sonraki bileşenin
parser kodları ve `components/docs/examples.tsx` içindeki altı örnek okundu.
Dev sunucusu başlatılmadı; npm yayını yapılmadı; bağımlılık eklenmedi.
`adapters/chat.ts` ve sonraki altı bileşen değiştirilmedi.

## Ortak okuyucu kararı ve düzeltilen yönlendirme

Dokuz bileşen tek grammar paylaşmıyor. Rank/Funnel/Stat ilk token, Score
`etiket: değer/max`, Gantt aralık, Diff metinsel ayrım, Waterfall işaretli son
sayı, Slope ok, Bullet hedef ve maksimum ayrımı kullanıyor. Bu nedenle genel
bir etiket/sayı parser yazılmadı. Core `firstToken` ve `numericFromList`
Rank/Funnel arasında ortak; `scoreFromList` ayrı. Tümü mevcut `numberOf` ve
`splitLabel` yardımcılarını kullanır. `GraphStack` regex ve davranışı korundu.
Binlik virgül kaldırılır; ondalık nokta, yüzde ve birim son ekleri upstream
`parseFloat` davranışını izler. `−2` Unicode eksi token değeri 0 olur;
upstream böyle davranır. Eksik sayı 0; görüntü token'ı korunur.

Envanterde GraphRank item adı `Bar` yazılmıştı; gerçek upstream export'u
`Rank`. Envanter `Rank` olarak düzeltildi. Brifingdeki sıralama ifadesi
otomatik sıralama olarak uygulanmadı: upstream giriş sırasını korur.

## Uygulama ve doğrulama

- Ayrı tipli props, `ScoreRow`, `RankItem`, `FunnelStep`, `Rank` ve `Stage`
  adaptörleri; veri → derleyici listesi/runtime liste → item önceliği.
  Boş veri dizisi fallback girdisini bastırır; null sonraki girdiye geçer.
- Upstream host DOM, sınıflar ve a11y; Score tam/yarım/boş dot ve satır
  maksimumu; Rank köşeli parantezler ve ölçek; Funnel en büyük değere göre
  genişlik, ilk satıra göre yüzde, minimum bir dolu hücre ve stage/palette.
  Rank boş display için biçimlenmiş sayıya geçer; Funnel boş display tutar.
- Runtime slotlar düz modele okunur; VNode klonlanmaz. Her bileşende gerçek
  derlenmiş `{{ }}` şablonuyla reaktif değişim sınandı. SSR görünürlük,
  hydration uyarısız DOM eşitliği ve frame attribute aktarımı doğrulandı.
- `vReveal` 50 ms artış ve 250 ms tavan kullanır. Üç bileşende 60 satırın
  yalnız son satırı görünürken animasyon gecikmesi 250 ms olarak sınandı.
- Altı upstream örneği elle yazılmış bağımsız fixture girdileriyle doğrulandı:
  review, out of ten, routes, coverage, install, signup. Production VitePress
  fixture'ında 20 figure; Markdown/runtime/props ve uygun item yollarının
  DOM eşitliği, özgün caption ilişkileri ve beklenen değer/glif/oranlar sınandı.
- Markdown derleyicisi, docs sayfaları/sidebar kayıtları, README, public API
  snapshot'ları, ESLint item istisnaları ve registry üretimi güncellendi.

## Kabul çıktısı

Aşağıdaki tam zincirin yedi adımı da **çıkış 0** verdi:

```sh
pnpm install && pnpm -r build && pnpm -r test && pnpm lint && pnpm typecheck && pnpm format:check && pnpm consumer:check
```

| Kontrol | Sonuç |
| --- | --- |
| Install | `Already up to date` |
| Build | Vue/Markdown paketleri ve VitePress client/server/statik sayfalar |
| Test | Vue 327, Markdown 180, docs 45; toplam 552, atlanan yok |
| Lint / typecheck | Üç workspace ve ESLint |
| Format | `All matched files use Prettier code style!` |
| Consumer | `CONSUMER CHECK PASSED` |
| Kayıtlı VitePress host | 18 figure; yeni bileşenlerin değer ve oranları doğrulandı |
| Registry CLI | 22 öğe, 52 kaynak dosya; typecheck/build ve gerçek CLI payload eşitliği |
| Paket tipleri | Bundler/NodeNext, `skipLibCheck=false`; yanlış yeni alan türleri reddedildi |
| Tree shaking | Tek Vue runtime; full 216980 byte, GraphStack 166823 byte |
| Yalnız kütüphane | Vue hariç full 54159 byte, GraphStack 12937 byte |

Başlangıç 500 testti: **52 yeni test** (Vue 36, Markdown 14, docs 2).
`NumericTypes.vue` tip fixture'ına geçici yanlış label türü verildi;
kök `pnpm typecheck` çıkış 1 verdi:

```text
test/fixtures/NumericTypes.vue(9,39): error TS2322: Type 'number' is not assignable to type 'string'.
```

Fixture geri yüklendi. Kanıtlar `C:/Users/zahid/source/github/tmp/mdxcn-vue/`
altında `f6a-acceptance.log`, `f6a-negative.log`, `f6a-consumer.log` ve
`consumer-results.json` dosyalarındadır.

## Beklenti değişiklikleri ve sınırlar

Public API snapshot'larına yeni adlar eklendi. Kayıtlı tüketici figure sayısı
15 → 18; registry öğeleri 19 → 22. Eski davranış beklentisi değiştirilmedi.
İlk kontrollerde script tekrarından oluşan yinelenen kayıtlar, testteki union
çıkarımı, tüketici registry import eşlemesi ve biçim sorunları düzeltildi.
İlk tam zincir `GraphScore` dosyasının biçim kontrolünde durdu; Prettier
uygulandıktan sonra yedi adımın tamamı yeniden çalıştırılıp geçti.
Değişmeyen satırların özgün satır sonları korundu.

React Motion yerine mevcut `vReveal`, Vue item marker ve compiler `list`
girdisi kullanılır. `ticks` string biçimi Vue attribute kullanımını destekler.
Custom bileşen sınırları opak; Fragment şeffaftır. Funnel varsayılan sayı
biçimi upstream gibi ortam locale değerine bağlıdır. Birim son ekleri
ölçüye dönüştürülmez; sayının başlangıcı okunur.

Tarayıcı/E2E oturumu yapılmadı. Light/dark, dar ekran sütun/glif taşması,
uzun label kırpılması, ekran okuyucu sırası, stage dim kontrastı, JS kapalı
ve reduced motion görünürlük, CLS ve gerçek observer/WAAPI gecikmesi
tarayıcıda ölçülecek. Otomatik hydration bu canlı kontrollerin yerine geçmez.

Teslimat imzasız commit, hook atlamadan ve normal push ile yapılır;
commit kimliği ve temiz `origin/main` eşitliği son mesajda komutla bildirilir.
