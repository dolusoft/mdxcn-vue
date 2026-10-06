# Faz 2B-2 raporu

Doğrulama: 2026-10-06 Salı 22:31 (sistemden alınan Europe/Istanbul zamanı).

## Yapılanlar

1. **Adım 1.1:** `ul`/`ol` sıfırlaması korundu; `li` padding sıfırlaması
   kaldırıldı, `li + li` yalnız margin sıfırlar. Link/code kuralları `revert-layer`
   ile host değerlerini kaldırır; normal ve hover durumlarında utility katmanı
   kazanır. Eski CSS testi kaldırıldı. Yeni test gerçek VitePress kaynağını,
   production Tailwind CSS çıktısını ve docs DOM yapısını kullanarak katman,
   özgüllük, kaynak sırası ve padding/margin shorthand etkilerini hesaplar.
2. **Adım 1.2:** Upstream `words` ve tekrar tokenlarını açan `numbers` eklendi.
   Düz hücre ve string `align` ayrıştırması ortak `words` kullanır; virgüllü
   headers/align ve sayısal tekrarlar bağımsız beklentilerle sınanır.
3. **Adım 1.3:** Bilinmeyen host etiketleri açılır; desteklenen prose yapısı ve
   metin korunur. `del`, `s`, `kbd`, `img alt` sınandı; `script`/`style` elenir.
4. **Adım 1.4:** `@source` kontrol kolu tam `dist` kopyasıdır; yalnız kayıt satırı
   çıkarılır. Scratch dizini `os.tmpdir()` ile oluşturulur; test süresince
   `TEMP`/`TMPDIR`, izin verilen `source/github/tmp/mdxcn-vue` dizinine yönlendirilir
   ve sonra eski değer geri yüklenir. Dağıtım ve kontrol kolu gerçek Scanner ile sınanır.
5. **Adım 1.5:** `Cell` kenar boşlukları kırpılır; çok satırlı düz ve zengin
   gövdeler sınandı.
6. **Adım 1.6:** Veri satırı/footer hücreleri `isVNode` ile render edilir;
   güncelleme ve tip kontrolleri eklendi. Çekirdek model Vue bağımlılığı almadan
   genel `Rich` tip parametresiyle genişletildi.
7. **Adım 1.7:** `tableOf` dönüşündeki `MarkdownTable` hücre tipi
   `string | ProseNode[]` ile sınırlandı; derleme zamanı kontrolü eklendi.
8. **Adım 1.8:** Tablo kaydırma kabına `tabindex="0"`, `role="region"` ve
   `aria-labelledby` eklendi; tablo da aynı figcaption kimliğini kullanır.
   Bilinçli a11y farkı envantere yazıldı.
9. **Adım 2:** `Endpoint` upstream alan önceliklerini, route grammar, kendi
   parametre tablosu kurallarını, rich açıklamaları, request/response yapısını,
   DOM/class ve required a11y metnini korur. `rowsIn`/`hostCells` ortak VNode
   okuyucuları tekrar kullanılır; toplam satırı algılaması uygulanmaz. Public
   tipler, slot/prop güncellemesi, SSR/hydration testleri ve docs eklendi.
10. **Adım 3:** `GraphTimer`, saat yardımcıları ve `useGraphNow` eklendi.
    İlk render upstream gibi `null` saattir; üç modda SSR ve ilk istemci DOM
    eşittir. Mount sonrası interval, zaman ilerlemesi ve unmount temizliği
    sınandı. Testler `TZ=UTC` ve fake timers kullanır; sunucu/istemci saatleri
    farklıyken de hydration doğrulandı. Üç upstream docs örneği eklendi.

## Kabul çıktısı

İstenen zincir tek komutta çalıştırıldı ve çıkış kodu **0** oldu:

`pnpm install && pnpm -r build && pnpm -r test && pnpm lint && pnpm typecheck && pnpm format:check`

| Kontrol | Çıktı |
| --- | --- |
| `pnpm install` | `Already up to date`; pnpm 12.4.1 |
| `pnpm -r build` | İki paket `Done`; VitePress `build complete` |
| `pnpm -r test` | 142 Vue + 1 Markdown iskeleti + 9 docs = **152 geçti**, 0 başarısız |
| `pnpm lint` | `eslint .`; hata/uyarı yok |
| `pnpm typecheck` | Üç workspace projesi `Done` |
| `pnpm format:check` | `All matched files use Prettier code style!` |
| `git diff --check` | Çıktı yok; çıkış 0 |

**53 yeni runtime test**, 1 eski CSS testi kaldırıldı; toplam 100 → 152, net
artış **52**. Yeni testler: 8 ortak okuyucu/tablo, 20 Endpoint, 22 saat/Timer,
3 docs. Ek tip kontrolleri runtime sayısına dahil değildir.

## Commit'ler

Her commit sonrası normal `git push` başarılı oldu; force/hook atlama kullanılmadı.

| Commit | Kapsam |
| --- | --- |
| `adb29eb` | Adım 1.1, CSS katmanları ve gerçek cascade testi |
| `3d6f152` | Adım 1.2, words/numbers |
| `fe1a02a` | Adım 1.3, host etiketlerini açma |
| `8052698` | Adım 1.4, tam dist kontrol kolu |
| `d5e16a7` | Adım 1.5, Cell kırpma |
| `d885017` | Adım 1.6, VNode hücreleri |
| `84281c7` | Adım 1.7, dar dönüş tipi |
| `fd35b88` | Adım 1.8, erişilebilir tablo |
| `9b8d8e1` | Hover özgüllüğü ve tablo karşılaştırma düzeltmeleri |
| `53c3434` | Endpoint, GraphTimer, docs, paragraph CSS ve os.tmpdir uyarlaması |

Bu rapor ayrı bir son commit ile gönderilir. Uygulama commit'i sonrası
`git status --short` boş, `git rev-list --left-right --count origin/main...HEAD`
çıktısı `0 0` idi; rapor commit'i sonrası son Git doğrulaması kullanıcı raporundadır.

## Sapmalar ve düzeltilen bulgular

- Sistem temp dizinini kullanma isteği katı scratch kuralıyla birlikte uygulandı:
  `os.tmpdir()` yalnız test ortamında izin verilen dizini döndürür.
- Yeni bileşenlerde `.vp-doc p` margin/line-height sızıntısı da kaynakta doğrulandı;
  kapsamlı `revert-layer` kuralları ve gerçek CSS kontrolleri eklendi.
- VitePress highlighted fence çıktısı `div` içine alınır; upstream yalnız doğrudan
  `pre` okur. Docs bu sözleşmeyi açıklar ve host `pre > code`/`blocks` kullanır.
  `mdxcn-markdown` derleyicisi değiştirilmedi.
- Tablo örnekleri artık farklı erişilebilir kimlikler taşır. Production testi
  yalnız bu kimlikleri normalize ederek tablo içeriğini karşılaştırır; her gerçek
  kimliğin doğru figcaption/bölge ilişkisini ayrıca doğrular. VitePress `.html`
  bağlantı dönüşümü de gerçek çıktıyla sınanır.
- İlk kontrol turundaki test beklentileri, Vue slot callback tipi, nullable caption
  tipi, upstream `Endpoint` adı için lint istisnası ve son format hatası düzeltildi.
  Son kabul zincirinde başarısız veya atlanan kontrol yoktur.
- Görünmez sekmede interval upstream gibi devam eder. Kod incelemesi bu oturumda
  kaynak ve diff üzerinden yapıldı; ayrı agent veya tarayıcı kullanılmadı.

## Tarayıcıda ölçülecekler

Dev sunucusu başlatılmadı; tarayıcı ölçümü yapılmadı. Production/DOM testleri
görsel ölçümün yerine geçmez. 375/768/1280 genişlik ve light/dark matrisi:

- `/components/graph-stack`: host liste boşlukları ve mevcut glif/stagger davranışı.
- `/components/graph-table`: klavyeyle yatay scroll, başlık ilişkileri, üç girdi
  görünüm eşitliği, VNode/prose ve sütun hizaları.
- `/components/endpoint`: dar ekran parametre grid yapısı, link/code normal/hover
  görünümü, paragraf boşlukları, request/response scroll, required metni ve reveal.
- `/components/graph-timer`: üç saat türü, local timezone, ilk hydration görüntüsü,
  saniyelik güncelleme, caption, unmount temizliği ve reduced motion.
