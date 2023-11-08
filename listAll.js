const tbmt = require("./list_tbmt");
var arrLink = [];
const listAll = async (browserInstance, maxpage) => {
    try {
        let browser = await browserInstance
        url = 'https://muasamcong.mpi.gov.vn/web/guest/contractor-selection?render=index';
        let arrLink = await tbmt.list(browser, url, maxpage);
    } catch (error) {
        console.log("Không lấy được trang danh sách");
    }
    return arrLink;
}

module.exports = listAll