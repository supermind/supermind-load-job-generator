import fs from "fs"
import moment from 'moment'
import Baby from "babyparse"
import Promise from "bluebird"
import { chain, random, rangeRight, round } from "lodash"
import Utils from "../Utils.js"

export default class CompaniesAndStocks {
  utils: Utils;

  constructor(utils: Utils) {
    this.utils = utils;
  }

  async createJobFilesAsync(): Promise<void> {
    const companiesFile = "input/Companies-50000.csv";
    const companiesCsvData = await fs.readFileAsync(companiesFile, "utf8");
    const companies = Baby.parse(companiesCsvData, {header: true}).data;

    await this.utils.saveJobAsync(
      companiesCsvData,
      "companies", {
        nameColumn: "Company",
        linkedColumns: {
          "Parent Company": "companies",
          "Industry": "industries"
        }
      });

    let index = 0;

    for (const company of companies) {
      console.log(`Company #${++index} of ${companies.length}`);
      const stockPrices = this.generateStockPrices();
      const stockPricesCsvData = Baby.unparse(stockPrices);

      await this.utils.saveJobAsync(
        stockPricesCsvData,
        "stock-prices", {
          relation: company["Company"],
          relationTable: "companies"
        });
    }
  }

  generateStockPrices(): Object[] {
    const dailyAverageIncrease = 0.01;

    const stockPriceDays = 40 * 52 * 7;
    const volatilityMin = 0.005;
    const volatilityMax = 0.035;
    const volatility = random(volatilityMin, volatilityMax);
    let oldPrice = random(20, 80);

    return chain(rangeRight(0, stockPriceDays)).flatMap(daysAgo => {
      const date = moment().subtract(daysAgo, 'days');

      // Skip weekends (stock exchanges are closed).
      if (date.isoWeekday() > 5) {
        return [];
      }

      const rnd = Math.random() - (0.5-(dailyAverageIncrease/2));
      const changeFactor = 2 * volatility * rnd;
      const changeAmount = oldPrice * changeFactor;
      const newPrice = oldPrice + changeAmount;
      const volume = random(100000, 250000);

      const open = oldPrice;
      const close = newPrice;
      oldPrice = newPrice;

      return [{
        'Date': date.format("YYYY-MM-DD"),
        'Open': round(open, 2),
        'High': round(Math.max(open, close) * (1 + (Math.random() * volatility)), 2),
        'Low': round(Math.min(open, close) * (1 - (Math.random() * volatility)), 2),
        'Close': round(close, 2),
        'Adj Close': round(close, 2),
        'Volume': round(volume, 2)
      }];
    }).value();
  }
}
