import fs from "fs"
import path from 'path';
import rmdir from 'rimraf';
import moment from 'moment';
import Baby from "babyparse"
import Promise from "bluebird"
import { chain, random, rangeRight, round } from "lodash"

// Create async versions of callback-driven methods.

Promise.promisifyAll(fs);
const rmdirAsync = Promise.promisify(rmdir);

// Run the application.

const outputFolder = "/Volumes/Data (Unencrypted)/data/";
//const outputFolder = path.resolve(__dirname, "../supermind-load-job-mocks/");
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

  await saveJobAsync(
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
    const stockPrices = generateStockPrices();
    const stockPricesCsvData = Baby.unparse(stockPrices);

    await saveJobAsync(
      stockPricesCsvData,
      "stock-prices", {
        relation: company["Company"],
        relationTable: "companies"
      });
  }

  console.log("Finished processing.");
}


function generateStockPrices(): Object[] {
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

async function saveJobAsync(csvData: string, type: string, options: Object): Promise<void> {
  const opt = options || {};
  const hasRelation =  opt.relation !== undefined;
  const loadJobName = hasRelation ? `${type} (${opt.relation})` : type;
  const metadataFile = loadJobName + ".json";
  const csvDataFile = loadJobName + ".csv";
  const owner = "wagerfield";
  const database = "finance";

  if (await fileExistsAsync(csvDataFile)) {
    throw new Error(`Cannot save duplicate job "${loadJobName}".`)
  }

  await saveFileAsync(csvData, csvDataFile);

  const metadata = {
    owner: owner,
    database: database,
    table: type
  };

  if (hasRelation) {
    metadata.relation = opt.relation;
    metadata.relationTable = opt.relationTable;
  }

  if (options.nameColumn) {
    metadata.nameColumn = options.nameColumn;
  }

  if (options.linkedColumns) {
    metadata.linkedColumns = options.linkedColumns;
  }

  await saveFileAsync(JSON.stringify(metadata), metadataFile);
}

function saveFileAsync(content: string, relativeFilePath: string): Promise<void> {
  return fs.writeFileAsync(path.resolve(outputFolder, relativeFilePath), content, "utf8");
}

async function fileExistsAsync(relativeFilePath: string): Promise<boolean> {
  let exists = true;
  try {
    await fs.statAsync(path.resolve(outputFolder, relativeFilePath));
  }
  catch(err) {
    exists = false;
  }

  return exists;
}
