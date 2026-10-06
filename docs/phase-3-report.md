# Faz 3 raporu

Doğrulama: 2026-10-07 Çarşamba 00:36 (Europe/Istanbul), bu turda sistemden
alınan zaman. Windows, Node `24.21.0`, pnpm `12.4.1`.

## Yapılanlar

- **O1:** İki paketin göreli import'ları `.js` yollarıyla çözülebilir oldu.
  Gerçek tarball tüketicisi Bundler ve NodeNext, `skipLibCheck:false` ve dört
  yanlış alan/değer kontrolüyle sınanır. Başlangıçtaki `TS2834` komutla üretildi;
  düzeltilmiş iki `.d.ts` ağacının NodeNext kontrolü hatasız geçti.
- **O2/O3:** CSS öğesi `registry:file`; onaysız gerçek CLI kurulumu geçti.
  `registry.json` içeriksiz dosya kayıtlarıyla gerçek kaynaklara bağlandı.
  `shadcn-vue build` koşar; çıktısı MIT bildirimi ve `.txt` taşıma suffix'i
  eklendikten sonra `public/r` ile karşılaştırılır. Böylece yeni bir CLI
  bağımlılığını köke kurmadan kaynak/payload eşitliği korunur.
- **B-a:** `MdxcnSmoke` public API ve paket kaynaklarından çıktı; fixture
  `test/fixtures` altında kaldı. Export/tip snapshot'ı ve docs kaydı güncellendi.
- **B-b/B-c:** Eksik Callout kaydı host alert çıktısını değiştirmez; alıntı em
  dash'i korunur. Eksik hedef uyarıları parser/site başına hedef başına bir kez
  verilir. Derleme uyarılardan önce çalışır; iki plugin kayıt sırası plain
  markdown-it ve gerçek VitePress host ile sınandı.
- **T1–T3:** Fence ve emoji/entity beklentileri açık tablolar oldu; alıntı
  kaçışı pozitif HTML beklentisiyle sınanır.
- **S1/S2:** Tüketici kontrolü paketleri önce build eder; başarıda kendi
  fixture dizinini siler. `MDXCN_CONSUMER_DIR` scratch üst dizinini değiştirir;
  üst dizin silinmez. Sonuç özeti `consumer-results.json` içinde kalır.
- **S3:** Node `22.18`/`24` kontrol matrisi; tüketici için Linux/Windows matrisi.
  Gerçek Node 22.18 CI koşumu Corepack'in native pnpm 12 için olmayan
  `pnpm.cjs` girişini çağırdığını ortaya çıkardı. Yalnız geçici tüketici
  runner'larında Corepack kaldırılır; `pnpm/action-setup` native pnpm'i kullanır.
  Windows runner PATH üzerinde başka Node dağıtımlarının başlatıcıları da
  kaldığı için bulunan Corepack dizinlerindeki üç başlatıcı biçimi ayrıca
  kaldırılır; PATH kontrolü yapılır ve native pnpm dizini öne alınır.
- **D1/D2:** Vue dahil uygulama toplamı ve kütüphane payı ayrıldı; fence
  metadata kapsamı ve plugin/uygulama kayıt sözleşmesi README ve önceki rapora
  işlendi. **Font:** yalnız docs temasında upstream metrikli fallback ve
  build sırasında iki gerçek `.woff2` preload bağlantısı eklendi.
- **Adım 2:** [Karar kapısı](phase-3-gate.md), arşiv görünürlük kontrolü ve
  [SHA-256 kanıt özeti](phase-3-evidence.json) yazıldı; 42 bileşen sekiz grammar
  grubuna ayrıldı. Docs aracı değişmedi.

## Kabul çıktısı

```sh
pnpm install && pnpm -r build && pnpm -r test && pnpm lint && pnpm typecheck && pnpm format:check && pnpm consumer:check
```

Zincirin son yerel koşumu çıkış **0**. Log:
`C:/Users/zahid/source/github/tmp/mdxcn-vue/f3-check.log`.

| Kontrol | Sonuç |
| --- | --- |
| `pnpm install` | `Already up to date` |
| `pnpm -r build` | İki paket ve VitePress client/server + statik render başarılı |
| `pnpm -r test` | **156 Vue + 92 Markdown + 15 docs = 263 geçti**; 0 başarısız/atlanan |
| `pnpm lint` / `pnpm typecheck` | Çıkış 0 |
| `pnpm format:check` | `All matched files use Prettier code style!` |
| `pnpm consumer:check` | `CONSUMER CHECK PASSED; fixture removed` |
| Tip sözleşmesi | `TYPE CONTRACT PASSED: NodeNext, skipLibCheck=false; invalid fields rejected` |
| Registry build | `REGISTRY CLI BUILD PASSED: real source index and normalized payload parity` |
| Registry kurulumu | `REGISTRY PROMPT CHECK PASSED: closed stdin, no --yes`; **7 öğe, 21 dosya**, typecheck/build geçti |
| `pnpm registry:check` / `git diff --check` | Çıkış 0 |
| `MDXCN_CONSUMER_DIR` kontrolü | Ayrı scratch üst dizininde başarılı; `Remaining override fixtures: 0` |

**8 yeni test**, toplam **255 → 263**. Paketli typecheck/build ve negatif
tüketici kontrolleri bu runtime test sayısına dahil değildir.

```text
TREE-SHAKE full=180685 bytes GraphStack=166187 bytes removed=14498 bytes; Vue runtime entries=1
LIBRARY ONLY (source-map attribution, Vue excluded, minify=false): full=23791 bytes GraphStack=12370 bytes
VITEPRESS CONSUMER PASSED: 3 compiled figures, 4 warned native upgrade fallbacks
```

Bütün paket export'larını içeren dağıtım JS dosyaları **30.120 byte**.
Source map atfı son JS içindeki kütüphane span'larını sayar; Vue, eşlemesiz
bağlantı kodu ve satır sonları hariçtir. Brifingdeki yaklaşık 14/30 KB ile
farklı kapsamlar karıştırılmadı. Gzip ölçümü diye sunulmaz.

## Brifingden düzeltilenler ve sınırlar

`data-mdxcn-language` dil etiketli VitePress fence `div` çıktısına eklenir;
dilsiz fence veya `div` üretmeyen renderer için eklenmez. Arşivde sekiz JS
kapalı sayfa ve dört script engellenmiş sayfa doğrulandı; önceki build'e aittir.
`0.0007` CLS değeri yeniden hesaplanabilir ölçüm çıktısıyla doğrulanamadı.
Font düzeni değiştiği için güncel cold-cache CLS kapısı açık bırakıldı.

Ek host testinde `$ run` için yanlış `console` beklentisi kaynakla kontrol
edilerek `request` olarak düzeltildi. VitePress `markdown.config` callback
dönüşünün `void` olması gerektiği typecheck ile bulundu ve düzeltildi.
Başarısız ara test/CI koşumları nihai kabul yerine gösterilmedi.

Docs önerisi: VitePress `2.0.0-alpha.20` exact pin ile kalsın. Yerel
SSR/Markdown yolu ve iki DevTools config kontrolü geçti; `vite-ssg 28.3.0`
mevcut repo için denenmemiş bir geçiş adayıdır. Canlı DevTools UI bağlantısı,
yeni font sonrası CLS/glif genişliği, reduced motion ve 375/768/1280 ×
light/dark görsel/hydration matrisi yeniden ölçülmeli. Dev sunucusu
başlatılmadı; npm yayını yapılmadı.

## Git ve CI

Uygulama commit'leri `fe48e79` ile başladı; son CI araç zinciri düzeltmesi
`f850649`. Ana değişiklikler: `0180872` O1, `1dc5a32` O2, `2798c19` O3,
`a65ffba` B-b, `51ed749` B-c, `6cf72ed` T1–T3, `34793d3` tüketici/ölçüm,
`b2a9604` matris, `6cd0636` font, `a9cdb96` belgeler.
Test güçlendirmesi `bc0353e`; beklenti/dönüş düzeltmeleri `30f16f9` ve
`a9f1894`. Her commit sonrası normal push yapıldı. `0323445` ilk push
denemesi geçici `getaddrinfo() thread failed to start` hatası verdi;
ikinci normal push başarılı oldu. Force veya hook bypass kullanılmadı.

İlk 15 commit imzasız oluşturuldu; bu, verilen Git imza talimatının ihlalidir.
`c429bcc`, `eeda9af` ve `f850649` SSH imzalıdır ve mevcut `allowed-signers`
dosyasıyla `G` sonucu doğrulandı. Son rapor commit'i de imzalanır.
Gönderilmiş geçmiş değiştirilmedi.

Son uygulama CI koşumu [37534677393](https://github.com/dolusoft/mdxcn-vue/actions/runs/37534677393)
**başarılı**: iki Node sürümünde kontrol işleri ve Node `22.18`/`24` ×
Linux/Windows tüketici işleri, toplam **6/6** geçti. Önceki
[37534587535](https://github.com/dolusoft/mdxcn-vue/actions/runs/37534587535)
koşumu da **6/6 başarılı**. Önceki kırmızı koşumların Corepack ve test
callback sorunları çözüldü; silinmedi veya başarılı gibi sunulmadı.

Bu üç belge ayrı son commit ile gönderilir. Son commit'in temiz çalışma ağacı,
remote farkı, SSH imzası ve `gh run list -L 3` sonucu kullanıcıya ayrıca bildirilir.
