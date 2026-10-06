# Faz 2B-1 raporu

Doğrulama: 2026-10-06 Salı 22:00 (sistemden alınan Europe/Istanbul zamanı).

## Yapılanlar

1. Paket `graph.css` dosyasında graph listeleri sıfırlandı. Katman dışındaki
   `.graph-frame.graph-frame` seçicileri VitePress `.vp-doc` özgüllüğünü aşar;
   `ul`/`ol`/`li` ve `li + li` için kural ve özgüllük testi eklendi.
2. npm sorgusunda `latest` sürümü `5.3.0` olarak doğrulanan
   `@fontsource/geist-mono` docs temasına eklendi (400/600). Paket font dağıtmaz;
   font-family zinciri korunur. README öneri ve OFL bilgisini içerir. Production
   testleri `@font-face` ve `.woff2` çıktısını doğrular.
3. Tailwind testi sınıf içermeyen, `source/github/tmp/mdxcn-vue` altında oluşturulup
   temizlenen izole tüketicide gerçek dağıtım `theme.css` girişini `compile` ve
   `Scanner` ile işler. Yalnız `@source` kaydı çıkarılmış kontrol kolunda paket
   utility sınıfları üretilmez. Derleme araçları doğrudan docs test bağımlılığıdır.
4. `childrenOf` işlevi `h()` dizi ve string children biçimlerini okur.
5. Markdown liste metnindeki whitespace inline sınırlar arasında normalize edilir;
   `sliceProse` normalize edilmiş ofsetlerle zengin etiketi korur. Çok satırlı düz
   ve zengin girdiler test edildi.
6. `GraphStack` gecikmesi `min(index, 6) * 50`; dokuz satırda
   `0/50/100/150/200/250/300/300/300` ms testi eklendi.
7. `ticks` prop tipi `[Number, String]`; `numberOf` ile normalizasyon ve geçersiz
   string için 24 varsayılanı, Vue uyarısı üretmeden test edildi.
8. Adlandırılmış glif kümeleri elle yazılmış beklentilerle sınanır. `BarProps` ve
   `SegmentProps` tipleri dağıtılan `.d.ts` dosyalarında yer alır; geçerli ve
   geçersiz prop girdileri TypeScript kontrolüne dahil edildi.
9. `GraphTable`, `Head`/`Row`/`Foot`/`Cell`, `cellsOf`, `alignsOf`, `tableOf` ve
   `labeledTable` eklendi. Framework bağımsız `TableData`/`TableModel` tipleri ile
   `resolveTable`/`toLabeledTable` işlevleri ilerideki tablo ailesinde yeniden
   kullanılabilir. Öncelik alan bazında veri → item → Markdown; boş ilk
   `Head`/`Foot` kazanır, boş `Row` dizisi Markdown girdisine geçer. Pipe metni,
   hücre dizileri, hizalar, toplam satırı ve açık `tfoot` davranışı upstream ile
   karşılaştırıldı. Native tablo semantiği, `scope="col"`, dekoratif kuralların
   gizlenmesi, görünür SSR ve hydration doğrulandı. Docs sayfasında upstream
   `research cost` verisi üç biçimde, `taste, explained` verisi Markdown olarak
   gösterilir; ilk üç tablo production HTML çıktısında birebir eşittir.

## Kabul çıktısı

| Komut | Sonuç |
| --- | --- |
| `pnpm install` | `Lockfile is up to date, resolution step is skipped`; çıkış 0 |
| `pnpm -r build` | İki paket ve VitePress production build tamamlandı; çıkış 0 |
| `pnpm -r test` | 93 Vue + 1 Markdown iskeleti + 6 docs = **100 test geçti**; çıkış 0 |
| `pnpm lint` | Hata/uyarı yok; çıkış 0 |
| `pnpm typecheck` | Üç workspace projesi geçti; çıkış 0 |
| `pnpm format:check` | `All matched files use Prettier code style!`; çıkış 0 |

Faz 2A toplamı 67 idi: **33 yeni runtime test** (4 Stack, 2 CSS, 25 Table,
2 docs). Ek prop tip kontrolleri runtime test sayısına dahil değildir.
`git diff --check` geçti. Kod incelemesi bu oturumda yapıldı; ayrı agent
incelemesi çalıştırılmadı. Commit/push sonrası Git durumu son kullanıcı raporunda
ayrıca belirtilir.

## Sapmalar ve inceleme bulguları

- Brifingdeki genel öncelik ifadesi tek bir girişin bütün alanları bastırması
  anlamına gelmez: kaynak ve envanter doğrulandığı üzere alanlar ayrı seçilir.
- VitePress liste sızıntısı tablolarda da vardır: `display: block`, hücre border,
  padding, başlık rengi/hizası ve zebra arka planı. Paket kapsamlı tablo kuralları
  eklendi; host `.vp-doc` adına bağımlılık kurulmadı. `graph-table` sınıfı bu
  kuralların sınırını belirler.
- String `style` girdisi Vue tarafından `text-align` anahtarıyla ayrıştırılır;
  hem bu anahtar hem `textAlign` desteklenir. İlk başarısız testlerin kökü
  düzeltildi; son kabul testlerinde başarısızlık yoktur.
- Ortak prose sözleşmesi gereği Markdown hücrelerinde strong/em/code/link
  yapısı korunur; upstream Markdown okuyucusunun yalnız düz metin döndürmesinden
  bilinçli farktır. `b` etiketi `strong` modeline çevrilir.
- `GraphTable` upstream 40 ms stagger değerini korur ve altı artışta sınırlar;
  `GraphStack` için istenen 50 ms değeri korunur. SSR'da gizleme üretilmez.
- ESLint upstream item adlarını kabul edecek şekilde genişletildi;
  `Head` ile HTML `head` adı büyük/küçük harf duyarlı kontrol edilir.

## Tarayıcıda ölçülecekler

Dev sunucusu başlatılmadı; tarayıcı ölçümü yapılmadı. Testler gerçek tarayıcı
görsel/animasyon doğrulamasının yerine geçmez.

- `/components/graph-stack`: 375/768/1280 genişliklerinde light/dark; listelerde
  host margin/padding/bullet sızıntısı; Geist Mono yüklenmesi ve glif ölçüsü;
  300 ms stagger tavanı, reduced motion ve hydration görünürlüğü.
- `/components/graph-table`: aynı genişlik/tema matrisi; ilk üç araştırma
  tablosunun eşit görünümü; sütun hizaları, toplam kuralları, hücre padding ve
  dikey çizgiler; host zebra/border sızıntısı; dar ekranda yatay scroll; ekran
  okuyucuda başlık ve hücre ilişkileri; 40 ms stagger ve reduced motion.

Endpoint, GraphTimer ve `mdxcn-markdown` derleyicisi bu fazda uygulanmadı.
