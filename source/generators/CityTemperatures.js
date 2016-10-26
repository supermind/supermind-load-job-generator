import fs from "fs"
import moment from 'moment'
import Baby from "babyparse"
import Promise from "bluebird"
import { chain, random, rangeRight, round } from "lodash"
import Utils from "../Utils.js"

export default class CityTemperatures {
  utils: Utils;

  constructor(utils: Utils) {
    this.utils = utils;
  }

  async createJobFilesAsync(): Promise<void> {
    const citiesFile = "input/Cities-24689.csv";
    const citiesCsvData = await fs.readFileAsync(citiesFile, "utf8");
    const cities = Baby.parse(citiesCsvData, {header: true}).data;

    let index = 0;

    for (const city of cities) {
      if (city === undefined || city["City"].length === 0) continue;

      console.log(`City #${++index} of ${cities.length}`);

      await this.utils.saveJobAsync(
        "city-temperatures", {
          relation: city["City"],
          relationTable: "cities"
        }, () => {
        const temperatures = this.generateTemperatures();
        const temperaturesCsvData = Baby.unparse(temperatures);
        return temperaturesCsvData;
      });
    }
  }

  generateTemperatures(): Object[] {
    const days = 100 * 52 * 7;
    const maxTemp = random(20,35);
    const minTemp = maxTemp * random(0.2, 0.5);
    const year = 365;
    const sinCycle = 1.571111;
    const citySeasonOffset = random(0, 365);

    return chain(rangeRight(0, days)).flatMap(daysAgo => {
      const date = moment().subtract(daysAgo, 'days');

      const sinInput = ((citySeasonOffset + daysAgo) / year) * 4 * sinCycle; // Ensure an entire season repeats each year.
      const temperature = (minTemp + (((Math.sin(sinInput) * 0.5) + 0.5) * ((maxTemp - minTemp) / 2))) + random(-3, 3);

      return [{
        'Date': date.format("YYYY-MM-DD"),
        'Max': round(temperature * random(1, 1.4), 1),
        'Min': round(temperature * random(0.6, 1), 1),
        'Mean': round(temperature, 1)
      }];
    }).value();
  }
}
