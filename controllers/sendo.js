const { Builder, By, Key, until } = require('selenium-webdriver');
const fs = require('fs');

// Define the tikiCrawl function
async function tikiCrawl(keyword, quantity, filePath) {
    // Initialize the Edge driver
    const driver = await new Builder().forBrowser("MicrosoftEdge").build();

    const hrefArray = [];
    try {
        await driver.get("https://www.sendo.vn");
        await driver.executeScript('document.body.style.transform = "scale(0.8)";');
        await driver.sleep(2000);

        const btnExit = await driver.wait(until.elementLocated(By.css('#main > div.d7ed-IB_g3V.d7ed-NsreHf._36fd-qAyq2p > div.d858-yPnKHn > div > button')), 25000);
        await btnExit.click();

        const searchBox = await driver.wait(until.elementLocated(By.css('#sendo-search')), 5000);
        await searchBox.sendKeys(keyword, Key.RETURN);

        while (hrefArray.length < quantity) {
            const container = await driver.wait(until.elementLocated(By.css('#main > div.d7ed-IB_g3V.d7ed-NsreHf._36fd-qAyq2p > div > div._36fd-hjrAHG.d7ed-fdSIZS > div._36fd-kus3M4.d7ed-d4keTB.d7ed-OoK3wU.d7ed-sD2H_f > div.d7ed-NcrsFA > div > div.d7ed-fdSIZS.d7ed-OoK3wU.d7ed-mPGbtR')), 5000);
            const aTags = await container.findElements(By.tagName('a'));

            await driver.sleep(10000);
            await driver.executeScript('window.scrollTo(0, document.body.scrollHeight);');
            await driver.sleep(10000);

            for (const aTag of aTags) {
                try {
                    let href = await aTag.getAttribute('href');
                    hrefArray.push(href);

                    if (hrefArray.length >= quantity) {
                        break;
                    }
                    await driver.executeScript('window.scrollTo(0, document.body.scrollHeight);');

                } catch (error) {
                    console.log(">>> error: " + error);
                }
            }
        }

        console.log(hrefArray);

        for (let prLink of hrefArray) {
            try {
                await driver.get(prLink);

                await driver.executeScript('document.body.style.transform = "scale(0.2)";');

                await driver.sleep(5000);

                const pageHeight = await driver.executeScript('return document.body.scrollHeight');
                const scrollDistance = Math.floor(0.40 * pageHeight);
                await driver.executeScript(`window.scrollTo(0, ${scrollDistance})`);

                await driver.sleep(5000);

                const type = await driver.wait(until.elementLocated(By.css('#main > div.d7ed-IB_g3V.d7ed-NsreHf._36fd-qAyq2p > div:nth-child(2) > nav > ol')), 10000);
                const typeText = await type.getText();

                console.log("\ntype: " + typeText);

                const name = await driver.wait(until.elementLocated(By.css('#main > div.d7ed-IB_g3V.d7ed-NsreHf._36fd-qAyq2p > div:nth-child(3) > div._36fd-qUkp3A.d7ed-OoK3wU.d7ed-E1SUA2.d7ed-MTc6d2.d7ed-P1dAZs.d7ed-giRxgK > div.d7ed-IB_g3V._3141-sPiIwu > div._3141-uvnWHO > div:nth-child(1) > h1')), 10000);
                const nameText = await name.getText();

                console.log(nameText);

                // const scrollDistance2 = Math.floor(0.75 * pageHeight);
                // await driver.executeScript(`window.scrollTo(0, ${scrollDistance2})`);

                await driver.sleep(5000);

                // const expandDes = await driver.findElement(By.css('#id-tong-quan > div._96e1-g62ZNF.d7ed-OoK3wU > button > span'));
                const expandDes = await driver.wait(until.elementLocated(By.css('#id-tong-quan > div._96e1-g62ZNF.d7ed-OoK3wU > button > span')), 10000);
                await driver.wait(until.elementIsEnabled(expandDes), 5000);
                await expandDes.click();

                const des = await driver.wait(until.elementLocated(By.css('#id-tong-quan > div._96e1-BT20Ke')), 10000);
                const desText = await des.getText();

                console.log(desText);

                const regularPrice = await driver.wait(until.elementLocated(By.css('#main > div.d7ed-IB_g3V.d7ed-NsreHf._36fd-qAyq2p > div:nth-child(3) > div._36fd-qUkp3A.d7ed-OoK3wU.d7ed-E1SUA2.d7ed-MTc6d2.d7ed-P1dAZs.d7ed-giRxgK > div.d7ed-IB_g3V._3141-sPiIwu > div._3141-uvnWHO > div._3141-j_1grA.d7ed-fdSIZS.d7ed-OoK3wU.d7ed-UkcyG6 > span')), 10000);
                const regularPriceText = await regularPrice.getText();

                let salePriceText = null;
                const salePriceElement = await driver.findElements(By.css('#main > div.d7ed-IB_g3V.d7ed-NsreHf._36fd-qAyq2p > div:nth-child(3) > div._36fd-qUkp3A.d7ed-OoK3wU.d7ed-E1SUA2.d7ed-MTc6d2.d7ed-P1dAZs.d7ed-giRxgK > div.d7ed-IB_g3V._3141-sPiIwu._3141-hLwOW_ > div._3141-uvnWHO > div._3141-j_1grA.d7ed-fdSIZS.d7ed-OoK3wU.d7ed-UkcyG6 > span'));

                if (salePriceElement.length > 0) {
                    const salePrice = salePriceElement[0];
                    salePriceText = await salePrice.getText();
                    // Proceed with any additional steps involving sale price
                } else {
                    salePriceText = "";
                }

                console.log(regularPriceText);
                console.log(salePriceText);

                const img = await driver.wait(until.elementLocated(By.css('#id-media-block > div > div.d950-UAC2qr > div.d7ed-eGYQmX._0032-nmPNsg.d7ed-WzzWtM > div > div > div > div > div > div.swiper-slide._0032-EkTVl7.swiper-slide-visible.swiper-slide-active > div > div.d7ed-a1ulZz > img')), 10000);
                const imgUrl = await img.getAttribute("src");

                console.log(imgUrl);

                const newDataRow = `@simple@""@"${nameText}"@1@"0"@"visible"@""@"${desText}"@""@""@"taxable"@""@"5"@@""@"0"@"0"@""@""@""@""@"1"@""@"${salePriceText}"@"${regularPrice}"@"${typeText}"@@""@"${imgUrl}"@""@""@@""@@@""@""@0@""@""@"0"@"1"@""@""@""@"0"@"1"@""@""@""@"0"@"1"@""@""@""@"0"@"1"@""@""@""@"0"@"1"@""@""@""@"0"@"1"@""@""@""@"0"@"1"@""@""@""@"0"@"1"@""@""@""@"0"@"1"@""`;
                let csvData = "";
                csvData += newDataRow + "\n";

                fs.appendFileSync("crawled_data_store/" + filePath, csvData);
            } catch (error) {
                console.log("bug in product", error);
            }
        }
    } catch (error) {
        console.log(error);
    } finally {
        await driver.quit();
    }
}

// Modify the submitForm function to include web scraping
exports.submitForm = async (req, res) => {
    try {
        const keyword = req.body.keyword;
        const quantity = req.body.quantity;
        const timestamp = new Date().getTime(); // Get current timestamp
        const filePath = `sendo_${quantity}_${keyword}_${timestamp}.csv`; // Construct file path
        // Call the web scraping function with the provided keyword, quantity, and file path
        await tikiCrawl(keyword, quantity, filePath);
        res.send(`Keyword: ${keyword} has crawled`);
    } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).send("Internal Server Error");
    }
};

// Function to render the form
exports.renderForm = (req, res) => {
    res.render('tiki');
};

module.exports = exports; // Exporting the functions
