const fs = require('fs');
var data = [];
const list = (browser, url, stopPage) => new Promise (async (resolve, reject) => {
    try {
        let page = await browser.newPage();
        // mở 1 trang theo yêu cầu
        console.log(">> Mở tab ...");
        await page.goto(url, {
            waitUntil: 'networkidle0', // Chờ cho đến khi không có request mạng nào hoặc ít nhất 500ms sau lần cuối request mạng
        });
        console.log(">> Truy cập URL: " + url);
        
        setTimeout(async function() {
            const selectSelector = '#search-home > div > div.content__wrapper.background--white > div:nth-child(1) > div.row.d-flex.justify-content-between > div:nth-child(2) > select';
            const optionTextToSelect = '50';
          
            // Click vào tùy chọn để gây ra sự kiện thay đổi
            await page.select(selectSelector, optionTextToSelect);

            const articles = await page.evaluate(() => {
                let item = document.querySelectorAll('.content__body__left__item');
                listitem = [...item];
                let articles = listitem.map(item => ({
                    link: item.querySelector('.content__body__left__item__infor__contract > a').href
                }));
                return articles;
            });

            page.on('response', async (response) => {
                const request = response.request();
                const url = response.url();
                const status = response.status();
                if (request.url().startsWith('https://muasamcong.mpi.gov.vn/o/egp-portal-contractor-selection-v2/services/smart/search') &&
                    response.headers()['content-type'] === 'application/json') {
                    // Tiếp tục với xử lý dữ liệu theo nhu cầu của bạn.
                    const body = await response.text();
                    const jsonData = JSON.parse(body); // Phân tích dữ liệu JSON từ văn bản
                    jsonData['list_link'] = articles;
                    data.push(jsonData);
                    const selector = '#search-home > div > div.content__wrapper.background--white > div:nth-child(1) > div.content__body__left > div:nth-child(1) > div > div > div > ul > li.number.active';
                    const pagetxt = await page.$eval(selector, element => element.textContent);
                    if (jsonData != '') {
                        fs.writeFileSync('./data/TBMT/tbmt_page_' +  pagetxt + '.json', JSON.stringify(jsonData, null, 2));
                    }

                    if (pagetxt == stopPage) {
                        console.log(">> Dừng click next Page");
                        clearInterval(interValList);
                    }
                }
            });
            
            const interValList = setInterval(async function() {
                await page.locator('div').scroll({
                    scrollLeft: 10,
                    scrollTop: 100
                  });
                await page.click('#search-home > div > div.content__wrapper.background--white > div:nth-child(1) > div.content__body__left > div:nth-child(1) > div > div > div > button.btn-next');
            }, 3000);

            await page.waitForSelector(selectSelector); // Chờ cho đến khi phần tử select xuất hiện lại
            resolve(data);
            // Đợi cho đến khi sự kiện thay đổi hoàn thành (để đảm bảo rằng request đã được tạo)
          }, 2000);

    } catch (error) {
        console.log("Không lấy được trang danh sách TBMT" + error);
    }
})

module.exports = {
    list
}