# Faz 11B — Bekleyen kontroller

Metadata, lisanslar, README/changelog, tarball içerikleri, registry ve yerel
kabul zinciri tamamlandı. Kanıtlar [raporda](phase-11b-report.md).

Kalan iş: `publint` ve `@arethetypeswrong/cli` için geçici indirme izni.
Global kullanıcı talimatındaki “Yazılım kurmadan önce sor” kuralı nedeniyle
izin sorusu gönderildi; henüz yanıt alınmadı. İzin olmadan indirilmediler.

İzin verilirse `pnpm release:check` çalıştırılmalı; araçlar repo devDependency
listesine eklenmez, cache ve geçici çıktıları `source/github/tmp` altına gider.
Bulgular düzeltilmeli, gerekirse ilgili kabul kontrolleri tekrarlanmalı,
rapordaki bekleyen satırlar gerçek çıktılarla güncellenmeli ve bu handover
kapatılmalı. Her commit sonrasında normal push yapılmalı.

Yayın ve login yasakları devam eder. npm hesap/scope/sürüm kararları Zahid'e aittir.
