# Citation System

Reference extraction wajib mempertahankan raw input, provenance, dan confidence. Sistem harus mendeteksi citation tanpa reference, reference tanpa citation, duplicate, serta field penting yang hilang.

Style provider dirancang extensible. Baseline yang wajib divalidasi: APA 7, IEEE, Vancouver, Harvard, dan Chicago. Style tambahan memerlukan fixture test.

Aplikasi tidak boleh mengarang metadata referensi. Metadata dari provider eksternal harus diberi provenance dan membutuhkan validasi pengguna jika konflik.
