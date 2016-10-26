import fs from "fs"
import Baby from "babyparse"
import Promise from "bluebird"
import { chain, random, range, round } from "lodash"
import Utils from "../Utils.js"

export default class CompanyFounders {
  utils: Utils;

  constructor(utils: Utils) {
    this.utils = utils;
  }

  async createJobFilesAsync(): Promise<void> {
    const peopleFile = "input/People-43239.csv";
    const peopleCsvData = await fs.readFileAsync(peopleFile, "utf8");
    const people = Baby.parse(peopleCsvData, {header: true}).data;

    const companiesFile = "input/Companies-50000.csv";
    const companiesCsvData = await fs.readFileAsync(companiesFile, "utf8");
    const companies = Baby.parse(companiesCsvData, {header: true}).data;

    const founders = chain(companies)
      .filter(c => c !== undefined && c["Company"].length > 0)
      .flatMap(c => {
        const founderCountWeighting = [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 4 ];
        const founderCount = founderCountWeighting[random(0, founderCountWeighting.length - 1)];
        return chain(range(0, founderCount))
          .map(_ => people[random(0, people.length - 1)])
          .map(p => ({
            "Company": c["Company"],
            "Founder": p["Full Name"]
          }))
          .value();
      })
      .value();

    await this.utils.saveJobAsync(
      "company-founders", {
        linkedColumns: {
          "Company": "companies",
          "Founder": "people",
        },
      }, () => {
        return Baby.unparse(founders);
      });
  }
}
