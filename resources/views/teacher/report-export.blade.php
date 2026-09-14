<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Laporan Absensi</title>
    <style>
        body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 11px; color: #333; }
        h1 { font-size: 18px; margin-bottom: 4px; }
        .subtitle { font-size: 12px; color: #666; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th { background: #1E3A5F; color: #fff; padding: 8px 6px; text-align: left; font-size: 10px; }
        td { padding: 7px 6px; border-bottom: 1px solid #ddd; font-size: 10px; }
        tr:nth-child(even) { background: #f9f9f9; }
        .hadir { color: #047857; font-weight: bold; }
        .izin { color: #b45309; font-weight: bold; }
        .sakit { color: #1d4ed8; font-weight: bold; }
        .alpa { color: #e11d48; font-weight: bold; }
        .footer { margin-top: 20px; font-size: 9px; color: #999; text-align: right; }
    </style>
</head>
<body>
    <h1>Laporan Absensi</h1>
    <p class="subtitle">Dicetak pada {{ \Carbon\Carbon::now()->format('d F Y H:i') }}</p>

    <table>
        <thead>
            <tr>
                <th>Nama Siswa</th>
                <th>Tanggal</th>
                <th>Kelas</th>
                <th>Mata Pelajaran</th>
                <th>Status</th>
                <th>Waktu</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($data as $row)
            <tr>
                <td>{{ $row['nama_siswa'] }}</td>
                <td>{{ $row['tanggal'] }}</td>
                <td>{{ $row['kelas'] }}</td>
                <td>{{ $row['mata_pelajaran'] }}</td>
                <td class="{{ strtolower($row['status']) }}">{{ $row['status'] }}</td>
                <td>{{ $row['waktu'] }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        {{ $data->count() }} data
    </div>
</body>
</html>