// Import puppeteer
const puppeteer = require('puppeteer');

const startBrower = async () => {
  let browser 
  try {
    browser = puppeteer.launch({
      headless: false, // có hiện ui của chromirum hay không, false là có
      // chrome sử dụng multiple layer của sanbox để tránh nội dung web không đáng tin câyh,
      // nêu stin tưởng content dùng thì set như vậy
      args: ["--disable-setuid-sandbox"],
      devtools: false,
      //truy cập website bỏ qua lỗi liên quan đến http secure
      'ignoreHTTPSErrors': true
    });
  } catch (error) {
    console.log('Khởi động trình duyệt thất bại ' + error);    
  }
  return browser;
}

module.exports = startBrower;