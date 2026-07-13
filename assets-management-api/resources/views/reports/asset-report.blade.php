<!DOCTYPE html>
<html>
<head>
    <title>Laporan Inventaris Aset</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #000; padding: 6px; text-align: left; }
        th { backgroundColor: #f2f2f2; }
        .header { text-align: center; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h2>LAPORAN INVENTARIS DAN DEPRESIASI ASET</h2>
        <p>Tanggal Unduh: {{ \Carbon\Carbon::now()->format('Y-m-d H:i:s') }}</p>
    </div>
    <table>
        <thead>
            <tr>
                <th>Kode Aset</th>
                <th>Nama Aset</th>
                <th>Kategori</th>
                <th>Lokasi</th>
                <th>Status</th>
                <th>Harga Pembelian</th>
                <th>Nilai Buku</th>
            </tr>
        </thead>
        <tbody>
            @foreach($assets as $asset)
            <tr>
                <td>{{ $asset->asset_code }}</td>
                <td>{{ $asset->name }}</td>
                <td>{{ $asset->category->name ?? '-' }}</td>
                <td>{{ $asset->location->name ?? '-' }}</td>
                <td>{{ strtoupper($asset->status) }}</td>
                <td>Rp {{ number_format($asset->purchase_price, 0, ',', '.') }}</td>
                <td>Rp {{ number_format($asset->current_book_value, 0, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
