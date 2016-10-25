import fs from "fs"
import Baby from "babyparse"
import Promise from "bluebird"
import { uniqBy } from "lodash"
import Utils from "../Utils.js"

export default class CompaniesAndStocks {
  utils: Utils;

  constructor(utils: Utils) {
    this.utils = utils;
  }

  async createJobFilesAsync(): Promise<void> {
    const companiesFile = "/Users/lawrencewagerfield/Downloads/Company Cities.csv";
    const companiesCsvData = await fs.readFileAsync(companiesFile, "utf8");
    const companies = Baby.parse(companiesCsvData, {header: true}).data;

    const uniqueCompanies = uniqBy(companies, e => e["Company"]);

    const output = Baby.unparse(uniqueCompanies);

    await fs.writeFileAsync("/Users/lawrencewagerfield/Downloads/Company Cities (Unique).csv", output, "utf8");
  }
}
