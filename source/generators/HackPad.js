import fs from "fs"
import Baby from "babyparse"
import Promise from "bluebird"
import { chain, uniqBy } from "lodash"
import Utils from "../Utils.js"

export default class HackPad {
  utils: Utils;

  constructor(utils: Utils) {
    this.utils = utils;
  }

  async createJobFilesAsync(): Promise<void> {
    const file = "input/People-100000.csv";
    const csvData = await fs.readFileAsync(file, "utf8");
    const rows = Baby.parse(csvData, {header: true}).data;

    const uniqueRows = uniqBy(rows, e => e["Full Name"]);

    const output = Baby.unparse(uniqueRows);

    await fs.writeFileAsync("input/People (Unique).csv", output, "utf8");
  }
}
