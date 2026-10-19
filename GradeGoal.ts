import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

// Menentukan struktur data setiap komponen penilaian
interface KomponenNilai {
  nama: string;
  bobot: number;
  nilai: number | null;
}

// Menjalankan program utama GradeGoal
async function main(): Promise<void> {
  const rl = createInterface({ input, output });

  try {
    // Menampilkan judul dan petunjuk program
    console.log("\n================================================");
    console.log("                  GRADE GOAL");
    console.log("        Simulator Target Nilai Akademik");
    console.log("================================================\n");
    console.log("- Total bobot seluruh komponen harus 100%.");
    console.log("- Kosongkan nilai jika komponen belum dinilai.\n");

    // Meminta jumlah komponen penilaian
    const inputJumlah = Number(
      await rl.question("Jumlah komponen penilaian (1-20): ")
    );

    // Memvalidasi jumlah komponen dengan operator modulus
    const jumlahValid =
      Number.isFinite(inputJumlah) &&
      inputJumlah % 1 === 0 &&
      inputJumlah >= 1 &&
      inputJumlah <= 20;
    const jumlahKomponen = inputJumlah;
    const komponen: KomponenNilai[] = [];

    // Menyiapkan variabel untuk perhitungan
    let totalBobot = 0;
    let kontribusiNilai = 0;
    let bobotTersisa = 0;
    let jumlahBelumDinilai = 0;
    let dataValid: boolean = jumlahValid;

    // Memasukkan nama, bobot, dan nilai setiap komponen
    for (let i = 0; i < (jumlahValid ? jumlahKomponen : 0); i++) {
      console.log(`\n--- Komponen ${i + 1} ---`);
      const nama = (
        await rl.question("Nama komponen penilaian: ")
      ).trim();
      const bobot = Number(
        await rl.question("Bobot komponen (%): ")
      );
      const inputNilai = (
        await rl.question(
          "Nilai (0-100, kosongkan jika belum dinilai): "
        )
      ).trim();

      // Mengubah input kosong menjadi null
      const nilai: number | null =
        inputNilai === "" ? null : Number(inputNilai);

      // Memeriksa data menggunakan operator perbandingan dan logika
      const komponenValid =
        nama.length > 0 &&
        Number.isFinite(bobot) &&
        bobot > 0 &&
        bobot <= 100 &&
        (
          nilai === null ||
          (
            Number.isFinite(nilai) &&
            nilai >= 0 &&
            nilai <= 100
          )
        );

      // Menyimpan status validitas seluruh komponen
      dataValid = dataValid && komponenValid;

      // Menyimpan komponen dan menghitung bobotnya
      komponen.push({ nama, bobot, nilai });
      totalBobot += bobot;

      // Memisahkan nilai yang sudah ada dan yang belum dinilai
      bobotTersisa += nilai === null ? bobot : 0;
      jumlahBelumDinilai += nilai === null ? 1 : 0;
      kontribusiNilai +=
        nilai === null ? 0 : nilai * (bobot / 100);
    }

    // Meminta target nilai akhir dan memeriksa rentangnya
    const inputTarget = (
      await rl.question("\nTarget nilai akhir (0-100): ")
    ).trim();
    const targetInput = Number(inputTarget);
    const targetValid =
      inputTarget !== "" &&
      Number.isFinite(targetInput) &&
      targetInput >= 0 &&
      targetInput <= 100;

    // Menyiapkan variabel hasil perhitungan
    let nilaiDibutuhkan = Number.NaN;
    let statusTarget = "BELUM DIPROSES";
    let kategori = "BELUM DIPROSES";

    // IF 1 / Nested tingkat 1: memeriksa validitas data
    if (dataValid) {
      // IF 2 / Nested tingkat 2: memeriksa total bobot
      if (Math.abs(totalBobot - 100) < 0.000001) {
        // IF 3 / Nested tingkat 3: memeriksa target dan komponen tersisa
        if (
          targetValid &&
          jumlahBelumDinilai > 0 &&
          bobotTersisa > 0
        ) {
          // Menghitung rata-rata nilai yang dibutuhkan
          nilaiDibutuhkan =
            (targetInput - kontribusiNilai) /
            (bobotTersisa / 100);
          // Menentukan status target menggunakan ekspresi kondisional
          statusTarget =
            nilaiDibutuhkan <= 0
              ? "TARGET SUDAH TERCAPAI"
              : nilaiDibutuhkan <= 100
                ? "TARGET DAPAT DICAPAI"
                : "TARGET TIDAK DAPAT DICAPAI";
          // Menentukan kategori rekomendasi tanpa menambah rantai if
          kategori =
            statusTarget === "TARGET SUDAH TERCAPAI"
              ? "TERCAPAI"
              : nilaiDibutuhkan <= 50
                ? "RENDAH"
                : nilaiDibutuhkan <= 75
                  ? "SEDANG"
                  : nilaiDibutuhkan <= 100
                    ? "TINGGI"
                    : "MUSTAHIL";
        } else {
          // Memberikan status jika target atau komponen tersisa tidak sesuai
          statusTarget = !targetValid
            ? "TARGET TIDAK VALID"
            : "TIDAK ADA KOMPONEN TERSISA";
        }
      } else {
        // Memberikan status jika total bobot bukan 100%
        statusTarget = "TOTAL BOBOT TIDAK VALID";
      }
    } else {
      // Memberikan status jika data komponen tidak valid
      statusTarget = "DATA TIDAK VALID";
    }

    // SWITCH 1: menentukan rekomendasi belajar berdasarkan kategori
    let rekomendasi = "";
    switch (kategori) {
      case "TERCAPAI":
        rekomendasi =
          "Pertahankan usaha, evaluasi hasil belajar, dan terus tingkatkan kemampuanmu.";
        break;
      case "RENDAH":
        rekomendasi =
          "Peluang mencapai target cukup besar! Tetap konsisten, pahami materi, dan pertahankan cara belajar yang efektif.";
        break;
      case "SEDANG":
        rekomendasi =
          "Kamu perlu meningkatkan persiapan! Buat jadwal belajar, prioritaskan materi yang belum dikuasai, dan evaluasi kemajuanmu.";
        break;
      case "TINGGI":
        rekomendasi =
          "Target membutuhkan usaha lebih! Atur waktu dengan baik, perbanyak latihan, dan minta bantuan jika ada materi yang sulit.";
        break;
      case "MUSTAHIL":
        rekomendasi =
          "Target tidak dapat dicapai dengan batas nilai maksimum 100.";
        break;
      default:
        rekomendasi = "Periksa kembali data dan status perhitungan.";
        break;
    }

    // Switch 2: menjelaskan status hasil perhitungan
    let keterangan = "";
    switch (statusTarget) {
      case "TARGET SUDAH TERCAPAI":
        keterangan =
          "Selamat! Kontribusi nilai saat ini sudah memenuhi target.";
        break;
      case "TARGET DAPAT DICAPAI":
        keterangan =
          "Target dapat dicapai jika rata-rata nilai komponen tersisa mencukupi.";
        break;
      case "TARGET TIDAK DAPAT DICAPAI":
        keterangan =
          "Nilai yang dibutuhkan melebihi batas maksimum 100.";
        break;
      case "TARGET TIDAK VALID":
        keterangan =
          "Masukkan target nilai antara 0 sampai 100.";
        break;
      case "TIDAK ADA KOMPONEN TERSISA":
        keterangan =
          "Sisakan minimal satu komponen yang belum dinilai.";
        break;
      case "TOTAL BOBOT TIDAK VALID":
        keterangan =
          "Total bobot semua komponen harus tepat 100%.";
        break;
      case "DATA TIDAK VALID":
        keterangan =
          "Periksa nama, bobot, nilai, dan jumlah komponen.";
        break;
      default:
        keterangan = "Hasil belum dapat dihitung.";
        break;
    }

    // Menampilkan daftar komponen penilaian
    console.log("\n================================================");
    console.log("               HASIL GRADE GOAL");
    console.log("================================================");
    console.log("\nDaftar komponen:");
    for (const item of komponen) {
      const nilaiTeks =
        item.nilai === null
          ? "Belum dinilai"
          : item.nilai.toFixed(2);
      console.log(
        `- ${item.nama}: bobot ${item.bobot}%, nilai ${nilaiTeks}`
      );
    }

    // Menampilkan ringkasan perhitungan dan rekomendasi
    console.log(`\nTotal bobot: ${totalBobot.toFixed(2)}%`);
    console.log(`Kontribusi nilai saat ini: ${kontribusiNilai.toFixed(2)}`);
    console.log(`Target nilai akhir: ${inputTarget || "Belum diisi"}`);
    console.log(`Bobot tersisa: ${bobotTersisa.toFixed(2)}%`);
    console.log(`Komponen belum dinilai: ${jumlahBelumDinilai}`);
    console.log(
      `Rata-rata nilai yang dibutuhkan: ${
        Number.isFinite(nilaiDibutuhkan)
          ? Math.round(Math.max(0, nilaiDibutuhkan) * 100) / 100
          : "Tidak dapat dihitung"
      }`
    );
    console.log(`Status: ${statusTarget}`);
    console.log(`Keterangan: ${keterangan}`);
    console.log(`Rekomendasi: ${rekomendasi}\n`);
  } finally {
    // Menutup terminal input setelah program selesai
    rl.close();
  }
}

// Menjalankan program dan menangani kesalahan yang tidak terduga
main().catch((error: unknown) => {
  console.error("Terjadi kesalahan:", error);
});