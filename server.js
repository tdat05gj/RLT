const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Đường dẫn đến file lưu trữ dữ liệu
const DATA_FILE = path.join(__dirname, 'game-stats.json');

// Khởi tạo file dữ liệu nếu chưa tồn tại
async function khoiTaoFileDuLieu() {
    try {
        await fs.access(DATA_FILE);
    } catch {
        await fs.writeFile(DATA_FILE, JSON.stringify([]));
    }
}

// Đọc thống kê hiện tại
async function docThongKe() {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
}

// Ghi thống kê vào file
async function ghiThongKe(thongKe) {
    await fs.writeFile(DATA_FILE, JSON.stringify(thongKe, null, 2));
}

// API nhận thống kê game
app.post('/stats', async (req, res) => {
    try {
        const thongKeMoi = {
            ...req.body,
            thoiGian: new Date().toISOString()
        };
        const thongKe = await docThongKe();
        thongKe.push(thongKeMoi);
        await ghiThongKe(thongKe);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API lấy tất cả thống kê
app.get('/stats', async (req, res) => {
    try {
        const thongKe = await docThongKe();
        res.json(thongKe);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Khởi tạo và chạy máy chủ
khoiTaoFileDuLieu().then(() => {
    app.listen(PORT, () => {
        console.log(`Máy chủ đang chạy tại cổng ${PORT}`);
    });
});