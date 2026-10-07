# Faz 11B — Yayın hazırlığı

Tarih: 2026-10-07. Başlangıç: `main`, `83c907a`.

İki paket `0.1.0` sürüm adayı olarak hazırlandı; npm yayını yapılmadı.
`publint` ve `attw` araçlarının geçici indirilmesi için istenen izin henüz
yanıtlanmadığından bu iki kontrol bekliyor. Bu rapor tam yayın onayı değildir.

## Yayın kontrol listesi

| Kontrol                                                                                                       | Sonuç                                               |
| ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| İki pakette version, description, MIT, author, repository.directory, homepage, bugs, keywords                 | Tamam                                               |
| `files`, `types`, `main`, `module`, `exports` tutarlılığı                                                     | Paket içerikleri ve tüketici derlemeleri doğrulandı |
| Vue `^3.5.0`, Markdown `^14`, bileşen paketi `^0.1.0` peer aralıkları                                         | Gerçek kurulu manifestlerle doğrulandı              |
| Node `>=22.18`, `publishConfig.access: public`                                                                | Tamam                                               |
| CSS için `sideEffects: ["**/*.css"]`; Markdown için `false`                                                   | Korundu                                             |
| Kök ve iki pakette upstream MIT bildirimi ve Dolusoft telifi                                                  | Kaynak LICENSE metninden üretildi                   |
| Kök ve paket README dosyaları, npm/registry, VitePress, Comark, Knap, güvenlik, farklar, sürüm gereksinimleri | Tamam                                               |
| README örneğinin tarball tüketicisinde derlenmesi                                                             | Tamam; örnek README içinden alınır                  |
| `CHANGELOG.md`, ilk sürüm adayı                                                                               | Tamam; repo README diliyle İngilizce                |
| `pnpm pack`, gerçek arşiv listesi, declaration/CSS doğrulaması                                                | Tamam                                               |
| `publint@0.3.25 --strict`                                                                                     | İndirme izni bekleniyor; çalıştırılmadı             |
| `@arethetypeswrong/cli@0.18.5`                                                                                | İndirme izni bekleniyor; çalıştırılmadı             |
| Kabul zinciri ve temiz tarball tüketicisi                                                                     | Aşağıdaki yerel kontroller geçti                    |
| CI kabul zinciri                                                                                              | Mevcut workflow okundu; yayın adımı yok             |

## Doğrulama çıktıları

Yerel ortam: Windows, Node `v24.21.0`, pnpm `12.4.1`.

| Komut                            | Çıktı / çıkış kodu                                                            |
| -------------------------------- | ----------------------------------------------------------------------------- |
| `pnpm install`                   | `Already up to date`, 0                                                       |
| `pnpm -r build`                  | Vite/Vue declaration, Markdown TypeScript ve VitePress build geçti, 0         |
| `pnpm -r test`                   | Vue: 919; Markdown: 374; docs: 78 test geçti, 0                               |
| `pnpm lint`                      | `eslint .`, 0                                                                 |
| `pnpm typecheck`                 | Üç workspace kontrolü geçti, 0                                                |
| `pnpm format:check`              | 0; Markdown ve docs repo `.prettierignore` dosyasındaki mevcut kapsam dışında |
| `pnpm consumer:check`            | `CONSUMER CHECK PASSED`, 0                                                    |
| `pnpm registry:check`            | `REGISTRY CHECK PASSED: 52 items from library sources`, 0                     |
| `pnpm release:check --pack-only` | `RELEASE PACK CHECK PASSED (tool checks not run)`, 0                          |

Tüketici çıktıları: tek Vue runtime girişi; 46 kayıtlı VitePress figure;
Callout/Quote/Terminal/Footnotes için dört beklenen native fallback;
52 registry öğesi, 111 kaynak dosyası; gerçek Comark parse/render;
NodeNext ve `skipLibCheck: false` declaration kontrolü; CSS için negatif kontrol;
GraphStack dışındaki bileşenlerin tree-shaking kontrolü.

Build çıktısındaki Markdown uyarıları mevcut fallback senaryolarıdır ve testlerle
doğrulanır. Bu teslimatta yeni runtime davranışı eklenmedi.

Loglar: `C:/Users/zahid/source/github/tmp/mdxcn-vue/phase-11b-*.log`.
Başarılı tüketici fixture dizini kaldırıldı; özet aynı dizindeki
`consumer-results.json` dosyasında saklanır.

## Tarball içerikleri

Kalıcı inceleme çıktısı: `C:/Users/zahid/source/github/tmp/mdxcn-vue/phase-11b-pack/`.
Arşivler `pnpm pack` ile üretildi; arşiv listesi `tar -tzf` ile okundu.
Tüketici kontrolü gerçek arşiv listesini `npm pack --dry-run --json` listesiyle
ayrıca karşılaştırır. npm `pack` yayın yapmaz.

| Paket                  | Dosya | Declaration | CSS |
| ---------------------- | ----: | ----------: | --: |
| `mdxcn-vue@0.1.0`      |   120 |         109 |   3 |
| `mdxcn-markdown@0.1.0` |    13 |           5 |   0 |

Her arşivde yalnız `dist/`, `package.json`, `README.md`, `LICENSE` vardır.
Test, kaynak, docs, registry, `node_modules`, cache ve tarball dosyaları yoktur.
Vue paketindeki üç CSS dosyası Tailwind v4 kaynaklarıdır; önceden derlenmiş CSS
değildir. Markdown paketinde CSS olmaması beklenir.
Tam listeler:

- [Vue tarball dosyaları](artifacts/phase-11b-mdxcn-vue-files.json)
- [Markdown tarball dosyaları](artifacts/phase-11b-mdxcn-markdown-files.json)

`release:check` ad/sürüm bilgisini doğrudan paket manifestlerinden okur;
scoped adları tarball dosya adına dönüştürür. `--pack-only` araç indirmez.
Tam komut npm cache ve araçların geçici dizinlerini de izin verilen scratch
konumuna yönlendirir. Kontrol araçları repo bağımlılığına eklenmedi.
Paketler ESM girişleri sunar; CommonJS `require` desteği vaat edilmez.
`attw` için resmi [`esm-only` profili](https://github.com/arethetypeswrong/arethetypeswrong.github.io/tree/main/packages/cli#profiles)
bu sözleşmeye göre seçildi. Henüz çalıştırılmadığı için bir sonuç iddiası yoktur.
`publint` [tarball CLI desteği](https://github.com/publint/publint/blob/master/packages/publint/src/cli.js)
ile doğrudan aynı arşivi denetleyecek.

## Bulunan ve düzeltilen sorunlar

- Kök README bileşenlerin eksik olduğunu ve eski registry sayısını söylüyordu.
  Sürüm adayı durumuna, 52 registry öğesine ve 111 kaynak dosyasına güncellendi.
- Kök CSS örneğinde `graph.css` ve `host.css` importları eksikti; eklendi.
- Markdown paketinde `main`/`module` yoktu; mevcut ESM ve declaration girişlerine
  uygun alanlar eklendi. Sınırsız `mdxcn-vue: "*"` peer aralığı `^0.1.0` oldu.
- Upstream lisans sahibi `shadcn-labs` kuruluşu değil, kaynak LICENSE içindeki
  `Keshav Bagaade` kişisidir. Tam özgün telif satırı ve izin metni korundu;
  Dolusoft telif satırı eklendi. Değişiklik registry bildirimlerine de üretildi.
- pnpm `12.4.1 peers check`, yerel tarball peer sürümü olarak gerçek manifest
  sürümü yerine `file:../artifacts/mdxcn-vue.tgz` bildiriyor. Kontrollü fixture
  içinde bu tek JSON hatası ayrıştırılır; diğer yanlış/eksik peer, çakışma ve
  aralık kesişimi hataları kabul edilmez. İki kurulu manifest ayrıca okunarak
  `0.1.0` ve `^0.1.0` doğrulanır. Peer aralığı gevşetilmedi, genel kontrol
  kapatılmadı. Kurulumun bu pnpm uyarısı bilinen sınırlama olarak kalır.
- Tree-shaking betiğinin geçici çıktıları repo cache yerine izin verilen
  `source/github/tmp/mdxcn-vue/tree-shaking-check` dizinine taşındı.

## CI

`.github/workflows/ci.yml` içinde `check` işi install/lint/format/registry/build/
typecheck/test zincirini Node 22.18 ve 24 üzerinde çalıştırır. `consumer` işi
Linux/Windows ve aynı iki Node sürümünde tarball tüketicisini çalıştırır.
Yeni workflow gerekmedi. Yerel kontroller Node 24 üzerinde çalıştırıldı;
uzak CI matrisi bu raporda çalışmış kabul edilmez. Yayın adımı eklenmedi.

## Paket adları ve Zahid'in kararları

Public paket adları için kaynaklar iki `packages/*/package.json` dosyasındaki
`name` alanlarıdır. Yeni paketleme komutu bu bilgiyi başka bir yerde tekrarlamaz.
Repo klasör adları ve GitHub `dolusoft/mdxcn-vue` adresi public npm adıyla aynı
karar değildir; scope değişirse repo yollarını körlemesine değiştirmeyin.

Adların geçtiği bütün metin dosyalarının listesi
[ad envanteri](artifacts/phase-11b-package-name-files.json) dosyasındadır.
Scope kararı uygulanırken özellikle şunlar birlikte güncellenmelidir:

- Paket manifestleri ve Markdown paketinin peer/devDependency anahtarları.
- Docs uygulamasının dependency anahtarları ve `pnpm-lock.yaml`.
- Docs/test/consumer importları, `mdxcn-vue/core`, `mdxcn-vue/knap`, CSS yolları.
- Consumer/tree-shaking betiklerindeki fixture importları, path kontrolleri;
  CI paket filtreleri ve workspace açıklamaları.
- Üç README, changelog, canlı kullanım belgeleri ve registry bildirimleri;
  tarihsel raporlarda eski adların korunması ayrıca değerlendirilmeli.

Kararlar: scope ve son iki npm adı; `0.1.0` yerine başka ilk sürüm istenip
istenmediği; yayın yapacak npm hesabı/organization ve erişim hakkı; ESM ve
VitePress alpha gereksinimlerinin ilk sürüm için kabulü. Ad/sürüm değişikliği
sonrasında lockfile, registry ve bütün yayın/tüketici kontrolleri yeniden koşmalı.

## Yayın komutu taslağı — çalıştırılmadı

Aşağıdakiler yalnız inceleme taslağıdır. İndirme izni ve araç kontrolleri,
scope/sürüm kararları, npm erişimi ve CI sonuçları tamamlanmadan uygulanmamalı.
Markdown paketinin peer gereksinimi nedeniyle önce bileşen paketi yayınlanır.

```sh
pnpm release:check
pnpm consumer:check
npm publish ../tmp/mdxcn-vue/phase-11b-pack/mdxcn-vue-0.1.0.tgz --access public
npm publish ../tmp/mdxcn-vue/phase-11b-pack/mdxcn-markdown-0.1.0.tgz --access public
```

Bu teslimatta `npm publish`, `npm login` veya `pnpm publish` çalıştırılmadı;
dev sunucusu başlatılmadı.
