var express =  require("express");
const startBrower = require("./brower");
const listAll = require("./listAll");
const fs = require('fs');
const path = require('path');
var app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

puppeteer = require('puppeteer');
// Khởi tạo server
var server = require("http").Server(app);
var io = require("socket.io")(server)
server.listen(process.env.PORT || 3000);

// Lắng nghe xem có ai kết nối lên không
io.on("connection", function(socket) {
    console.log(">> Có người kết nối: " + socket.id);
    socket.on("disconnect", function(data) {
        console.log(">> Ngắt kết nối" + socket.id);
    });

    // Dữ liệu người dùng gửi lên
    socket.on("Update-TBMT", function(page) {
        // console.log(data);
        // io.sockets.emit("Server-Update-TBMT", "Server trả dữ liệu vệ")
        // Chỉ trả dữ liệu cho người dùng mở tab đó
        // socket.emit("Server-Update-TBMT", data);
        let brsower = startBrower();
        listTBMT = listAll(brsower, page);
    });

    socket.on("DataServer-TBMT", function() {
        const folderPath = './data/TBMT/'; // Đặt đường dẫn đến thư mục ở đây
        var dataFile = [];
        fs.readdir(folderPath, (err, files) => {
            if (err) {
                console.error('Lỗi khi đọc thư mục:', err);
            } else {
                dataFile.push(files);
                files.forEach((file) => {
                    const filePath = path.join(folderPath, file);
                });
            }
        });
        console.log(dataFile);
    });

    
});

// app.get("/", function(req, res) {
//     res.render("index");
// });

app.get('/api', (req, res) => {
    (async () => {
        option = {
            headless: true, // có hiện ui của Chromium hay không, false là có
            devtools: false,
            'ignoreHTTPSErrors': true
        };

        const browser = await puppeteer.launch(option);
        const page = await browser.newPage();
    
        // Kích hoạt Request Interception
        await page.setRequestInterception(true);
    
        let blockRequests = false;
    
        // Xử lý sự kiện trước request
        page.on('request', (request) => {
        if (blockRequests) {
            request.abort(); // Chặn request nếu biến blockRequests là true
        } else if (request.url().includes('https://muasamcong.mpi.gov.vn/o/egp-portal-contractor-selection-v2/services/smart/search')) {
            blockRequests = true; // Bắt đầu chặn request sau request cụ thể
            request.abort(); // Chặn request đầu tiên
        } else {
            request.continue(); // Cho phép các request khác đi tiếp
        }
        });
    
        page.on('response', async (response) => {
            const url = response.url();
            const status = response.status();
            // Kiểm tra các response và xử lý dữ liệu nếu cần
            if (url.includes('https://www.google.com/recaptcha/api2/reload') && status === 200) {
                // Tiếp tục với xử lý dữ liệu theo nhu cầu của bạn.
                const responseText = await response.text(); // Chờ cho đến khi response.text() được giải quyết
                const cleanedResponse = responseText.replace(")]}'", ''); // Thực hiện việc replace() trên nội dung text
                const jsonData = JSON.parse(cleanedResponse); // Phân tích dữ liệu JSON từ văn bản
                const jsonData1 = {
                    token: jsonData[1],
                };
                
                res.json(jsonData1);
                //   fs.writeFileSync('./data/reload/reload.json', JSON.stringify(jsonData[1], null, 2));
            }
        });
    
        // Điều hướng đến URL của trang web bạn muốn kiểm tra
        await page.goto('https://muasamcong.mpi.gov.vn/web/guest/contractor-selection?render=index', {
        waitUntil: 'networkidle0', // Chờ cho đến khi không có request mạng nào hoặc ít nhất 500ms sau lần cuối request mạng
        });
    
        // Chờ cho các yêu cầu và phản hồi kết thúc
        await page.waitForTimeout(5000);
    })();

});
