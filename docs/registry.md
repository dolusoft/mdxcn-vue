# Registry üretimi ve doğrulaması

`pnpm registry:build` komutu kendi `scripts/registry-build.mjs` betiğimizle
`registry.json` kaynak dizinini ve on `public/r/mdxcn-*.json` payload dosyasını
üretir. Kaynak dizini içerik taşımaz; gerçek TS/CSS dosyalarını gösterir.
Payload dosyalarının `path` alanları kaynak diziniyle aynıdır; `.txt` gerekmez.
`~/src/components/mdxcn/` hedefi, CLI'nin `src/` dizinini koruması için kalır.

`shadcn-vue build registry.json` komutu dağıtım üreticimiz değildir. Tüketici
kontrolü gerçek CLI çıktısına aynı MIT bildirimini ekleyerek `public/r` ile
eşitliğini doğrular. `pnpm registry:check` komutu bayat üretimleri reddeder.

## `.txt` olmadan kurulum kanıtı

Yerel `shadcn-vue 2.8.2` denemesinde kapalı stdin ile aşağıdaki komut çalıştı;
`--yes` ve `--overwrite` kullanılmadı. Faz 4A temiz tüketicisinde on öğe/26 dosya kuruldu.
CSS/TS ayrıştırma hatası tekrar üretilemedi; `.txt` kaldırıldı.

```sh
pnpm consumer:check
```

Bu kontrolün temiz registry fixture dizininde çalıştırdığı kurulum komutu:

```sh
pnpm exec shadcn-vue add ./registry-input/mdxcn-callout.json ./registry-input/mdxcn-core.json ./registry-input/mdxcn-css.json ./registry-input/mdxcn-endpoint.json ./registry-input/mdxcn-graph-frame.json ./registry-input/mdxcn-graph-stack.json ./registry-input/mdxcn-graph-table.json ./registry-input/mdxcn-graph-timer.json ./registry-input/mdxcn-quote.json ./registry-input/mdxcn-terminal.json
```

Brifingin byte eşitliği iddiası Windows'ta tam doğru değildir: CSS dosyaları
byte eşittir, TS dosyalarını CLI CRLF satır sonlarıyla yazar. Kontrol yalnız
CRLF/LF farkını giderir; `trim()` kullanmaz, kalan içerik birebir aynı olmalıdır.
Gerçek kurulumdan sonra `vue-tsc --noEmit` ve `vite build` komutları da çalışır.

Fixture dizinleri, repo içindeki `vite@8.3.3` için mevcut
`minimumReleaseAgeExclude` istisnasını aynen kullanır. Bu kayıt olmadan yeni
tüketici kurulumu pnpm sürüm yaşı denetiminde durur; genel denetim kapatılmaz.
