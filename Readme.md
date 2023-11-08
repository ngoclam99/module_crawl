B1: npm init --> để khởi tạo dự án
B2: npm install express ejs socket.io puppeteer --> cài các thư viện cần thiết
B3: Tạo 1 file index.js, 
    tạo thư mục public --> để chưa thư viện
    tạo thư mục views --> để chứa giao diện view của mình
B4: đoạn code khởi tạo server
```
var express =  require("express");
const startBrower = require("./brower");
const listAll = require("./listAll");
var app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

// Khởi tạo server
var server = require("http").Server(app);
server.listen(3000);

app.get("/", function(req, res) {
    res.render("index");
});
```
