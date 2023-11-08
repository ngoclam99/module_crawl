const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: true, // có hiện ui của Chromium hay không, false là có
    devtools: false,
    'ignoreHTTPSErrors': true
  });
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
            console.log(jsonData);
            fs.writeFileSync('./data/reload/reload.json', JSON.stringify(jsonData[1], null, 2));
        }
  });

  // Điều hướng đến URL của trang web bạn muốn kiểm tra
  await page.goto('https://muasamcong.mpi.gov.vn/web/guest/contractor-selection?render=index', {
    waitUntil: 'networkidle0', // Chờ cho đến khi không có request mạng nào hoặc ít nhất 500ms sau lần cuối request mạng
  });

  // Chờ cho các yêu cầu và phản hồi kết thúc
  await page.waitForTimeout(5000);
})();
