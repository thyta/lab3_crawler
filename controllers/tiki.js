const { Builder, By, Key, until } = require('selenium-webdriver');
const fs = require('fs');

// Define the tikiCrawl function
async function tikiCrawl(keyword, quantity, filePath) {
    // Initialize the Edge driver
    const driver = await new Builder().forBrowser("MicrosoftEdge").build();

    try {
        // Navigate to Tiki website
        await driver.get("https://tiki.vn/");

        const searchBox = await driver.wait(
            until.elementLocated(By.css("input")),
            10000
        );

        await searchBox.sendKeys(keyword, Key.RETURN);

        console.log(quantity);

        // const csvHeader = "ID@Type@SKU@Name@Published@'Is featured?'@'Visibility in catalog'@'Short description'@Description@'Date sale price starts'@'Date sale price ends'@'Tax status'@'Tax class'@'In stock?'@Stock@'Low stock amount'@'Backorders allowed?'@'Sold individually?'@'Weight(kg)'@'Length(cm)'@'Width(cm)'@'Height(cm)'@'Allow customer reviews?'@'Purchase note'@'Sale price'@'Regular price'@Categories@Tags@'Shipping class'@Images@'Download limit'@'Download expiry days'@Parent@'Grouped products'@Upsells@Cross-sells@'External URL'@'Button text'@Position@'Attribute 1 name'@'Attribute 1 value(s)'@'Attribute 1 visible'@'Attribute 1 global'@'Attribute 1 default'@'Attribute 2 name'@'Attribute 2 value(s)'@'Attribute 2 visible'@'Attribute 2 global'@'Attribute 2 default'@'Attribute 3 name'@'Attribute 3 value(s)'@'Attribute 3 visible'@'Attribute 3 global'@'Attribute 3 default'@'Attribute 4 name'@'Attribute 4 value(s)'@'Attribute 4 visible'@'Attribute 4 global'@'Attribute 4 default'@'Attribute 5 name'@'Attribute 5 value(s)'@'Attribute 5 visible'@'Attribute 5 global'@'Attribute 5 default'@'Attribute 6 name'@'Attribute 6 value(s)'@'Attribute 6 visible'@'Attribute 6 global'@'Attribute 6 default'@'Attribute 7 name'@'Attribute 7 value(s)'@'Attribute 7 visible'@'Attribute 7 global'@'Attribute 7 default'@'Attribute 8 name'@'Attribute 8 value(s)'@'Attribute 8 visible'@'Attribute 8 global'@'Attribute 8 default'@'Attribute 9 name'@'Attribute 9 value(s)'@'Attribute 9 visible'@'Attribute 9 global'@'Attribute 9 default'\n";
        // fs.writeFileSync("product.csv", csvHeader);

        //Lặp qua các page
        const hrefArray = [];

        let pageNum = 0;

        while (hrefArray.length < quantity) {
            await driver.sleep(5000);

            const container = await driver.wait(until.elementLocated(By.css('#__next > div:nth-child(1) > main > div > div.styles__FlexContainer-sc-mp632j-1.czHakJ > div.styles__MainContainer-sc-mp632j-2.ddTQeK > div:nth-child(2) > div.CatalogProducts__Wrapper-sc-1r8ct7c-0.jOZPiC')), 5000);

            let items = await container.findElements(By.css("a.product-item"));

            await driver.executeScript('window.scrollTo(0, document.body.scrollHeight);');

            for (let item of items) {
                let productHref = await item.getAttribute("href");
                hrefArray.push(productHref);

                if (hrefArray.length >= quantity) {
                    break;
                }
            }

            let nextPageButton = await driver.findElement(By.css(`#__next > div:nth-child(1) > main > div > div.styles__FlexContainer-sc-mp632j-1.czHakJ > div.styles__MainContainer-sc-mp632j-2.ddTQeK > div:nth-child(2) > div.Pagination__Root-sc-1lprxge-0.ipxgGX > div > ul > li:nth-child(${pageNum + 2}) > a`));
            await nextPageButton.click();

            pageNum++;
        }

        console.log(">> check length href: ", hrefArray.length)

        for (let link of hrefArray) {
            await driver.get(link);

            const infos = await driver.findElements(By.className("jvWfki"));

            for (let info of infos) {
                // Find the price element within the info element
                const name = await info.findElement(By.css("h1"));
                const price = await info.findElement(By.css('.product-price__current-price'));
                const image = await info.findElement(By.css(".hbqSye"))
                //Cuộn trang để lấy mô tả
                const pageHeight = await driver.executeScript('return document.body.scrollHeight');
                const scrollDistance = Math.floor(0.36 * pageHeight);
                await driver.executeScript(`window.scrollTo(0, ${scrollDistance})`);

                await driver.wait(until.elementLocated(By.css("a.btn-more")), 5000);
                await driver.findElement(By.css("a.btn-more")).click();

                await driver.sleep(2000);
                const description = await info.findElement(By.css(".imwRtb"));

                const nameText = await name.getText();
                await driver.wait(until.elementLocated(By.css(".imwRtb")), 5000);
                const descriptionHTML = await description.getText();
                const priceText = await price.getText();
                const imageUrl = await image.getAttribute("srcset");

                // console.log("check script>>>", descriptionHTML)
                const newDataRow = `@simple@""@"${nameText}"@1@"0"@"visible"@""@"${descriptionHTML}"@""@""@"taxable"@""@"5"@@""@"0"@"0"@""@""@""@""@"1"@""@""@"${priceText}"@"Technology Book"@@""@"${imageUrl}"@""@""@@""@@@""@""@0@""@""@"0"@"1"@""@""@""@"0"@"1"@""@""@""@"0"@"1"@""@""@""@"0"@"1"@""@""@""@"0"@"1"@""@""@""@"0"@"1"@""@""@""@"0"@"1"@""@""@""@"0"@"1"@""@""@""@"0"@"1"@""`;
                let csvData = "";
                csvData += newDataRow + "\n";

                fs.appendFileSync("crawled_data_store/" + filePath, csvData);
            }
        }
    } catch (error) {
        console.error("Error occurred:", error);
    } finally {
        // Close the browser
        await driver.quit();
    }
}

// Modify the submitForm function to include web scraping
exports.submitForm = async (req, res) => {
    try {
        const keyword = req.body.keyword;
        const quantity = req.body.quantity;
        const timestamp = new Date().getTime(); // Get current timestamp
        const filePath = `tiki_${quantity}_${keyword}_${timestamp}.csv`; // Construct file path
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
