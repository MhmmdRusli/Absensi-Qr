<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Laporan Absensi Sesi</title>
    <style>
        body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 11px; color: #333; }
        h1 { font-size: 18px; margin-bottom: 4px; }
        .subtitle { font-size: 12px; color: #666; margin-bottom: 4px; }
        .info { font-size: 11px; color: #333; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th { background: #1E3A5F; color: #fff; padding: 8px 6px; text-align: left; font-size: 10px; }
        td { padding: 7px 6px; border-bottom: 1px solid #ddd; font-size: 10px; }
        tr:nth-child(even) { background: #f9f9f9; }
        .hadir { color: #047857; font-weight: bold; }
        .belum { color: #e11d48; font-weight: bold; }
        .footer { margin-top: 20px; font-size: 9px; color: #999; text-align: right; }
    </style>
</head>
<body>
    <h1>Laporan Absensi Sesi</h1>
    <p class="subtitle">{{ $session->classRoom->name }} - {{ $session->subject->name }}</p>
    <p class="info">
        Tanggal: {{ $session->date->format('d F Y') }} |
        Waktu: {{ substr($session->start_time, 0, 5) }} - {{ substr($session->end_time, 0, 5) }} |
        Dicetak pada {{ \Carbon\Carbon::now()->format('d F Y H:i') }}
    </p>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Nama Siswa</th>
                <th>Status</th>
                <th>Waktu Scan</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($data as $row)
            <tr>
                <td>{{ $row['No'] }}</td>
                <td>{{ $row['Nama'] }}</td>
                <td class="{{ strtolower($row['Status']) }}">{{ ucfirst($row['Status']) }}</td>
                <td>{{ $row['Waktu Scan'] }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Total Siswa: {{ $total_siswa }} | Hadir: {{ $total_hadir }} | Belum Hadir: {{ $total_siswa - $total_hadir }}
    </div>
</body>
</html>