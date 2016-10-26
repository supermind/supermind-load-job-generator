import fs from "fs"
import Baby from "babyparse"
import Promise from "bluebird"
import { chain, random, range, round } from "lodash"
import Utils from "../Utils.js"

export default class CompanyCities {
  utils: Utils;

  constructor(utils: Utils) {
    this.utils = utils;
  }

  async createJobFilesAsync(): Promise<void> {
    const citiesFile = "input/Cities-24689.csv";
    const citiesCsvData = await fs.readFileAsync(citiesFile, "utf8");
    const cities = Baby.parse(citiesCsvData, {header: true}).data;

    const companiesFile = "input/Companies-50000.csv";
    const companiesCsvData = await fs.readFileAsync(companiesFile, "utf8");
    const companies = Baby.parse(companiesCsvData, {header: true}).data;

    const companyCities = chain(companies)
      .filter(c => c !== undefined && c["Company"].length > 0)
      .map(c => {
        const city = cities[random(0, cities.length - 1)];
        return {
          "Company": c["Company"],
          "Founding City": city["City"]
        };
      })
      .value();

    await this.utils.saveJobAsync(
      "company-cities", {
        linkedColumns: {
          "Company": "companies",
          "Founding City": "cities",
        },
      }, () => {
        return Baby.unparse(companyCities);
      });
  }
}
