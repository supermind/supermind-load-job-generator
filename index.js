import fs from "fs"
import path from 'path';
import rmdir from 'rimraf';
import moment from 'moment';
import Baby from "babyparse"
import Promise from "bluebird"
import uuid from "node-uuid"
import { chain, random, rangeRight, round } from "lodash"

// Create async versions of callback-driven methods.

Promise.promisifyAll(fs);
const rmdirAsync = Promise.promisify(rmdir);

// Run the application.

const outputFolder = path.resolve(__dirname, "../supermind-load-job-mocks/");
runAsync();

async function runAsync(): Promise<void> {
  await prepareOutputFolderAsync();
  await generateLoadJobsAsync();
}

async function prepareOutputFolderAsync(): Promise<void> {
  await rmdirAsync(outputFolder);
  await fs.mkdirAsync(outputFolder, 0o777);
}

async function generateLoadJobsAsync(): Promise<void> {
  const companiesFile = "input/Companies-50000.csv";
  const companiesCsvData = await fs.readFileAsync(companiesFile, "utf8");
  const companies = Baby.parse(companiesCsvData, {header: true}).data;

  await saveJobAsync(companiesCsvData, "Company");

  let index = 0;

  for (const company of companies) {
    console.log(`Company #${++index} of ${companies.length}`);
    const stockPrices = generateStockPrices();
    const stockPricesCsvData = Baby.unparse(stockPrices);

    await saveJobAsync(stockPricesCsvData, "Stock Price", company["Company"], "Company");
  }

  console.log("Finished processing.");
}


function generateStockPrices(): Object[] {
  // Assumes CAGR of 9.5%: 1.095^(1/(52*5))-1
  // Note: not entirely accurate, since on average results will be less than 9.5%. This is because gains and losses of
  // the same percentage don't compensate one-another (ie. -2% and +2% = -0.04%)
  const dailyAverageIncrease = 0.000349116;

  const stockPriceDays = 40 * 52 * 7;
  const volatilityMin = 0.015;
  const volatilityMax = 0.05;
  const volatility = random(volatilityMin, volatilityMax);
  let oldPrice = Math.random() * 100;

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

async function saveJobAsync(csvData: string, type: string, relation: string, relationType: string): Promise<void> {
  const hasRelation = relation !== undefined;
  const loadJobName = (hasRelation ? `${type} (${relation})` : type) + `-${uuid.v4()}`;
  const metadataFile = loadJobName + ".json";
  const csvDataFile = loadJobName + ".csv";

  await saveFileAsync(csvData, csvDataFile);

  const metadata = { type: type };
  if (hasRelation) {
    metadata.relation = relation;
    metadata.relationType = relationType;
  }

  await saveFileAsync(JSON.stringify(metadata), metadataFile);
}

async function saveFileAsync(content: string, relativeFilePath: string): Promise<void> {
  return fs.writeFileAsync(path.resolve(outputFolder, relativeFilePath), content, "utf8");
}
