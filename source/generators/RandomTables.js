import Baby from "babyparse"
import Promise from "bluebird"
import { chain, random, range, round, map, forEach } from "lodash"
import Utils from "../Utils.js"
import uuid from "node-uuid"

export default class RandomTables {
  utils: Utils;

  constructor(utils: Utils) {
    this.utils = utils;
  }

  async createJobFilesAsync(): Promise<void> {
    const userCount = 1000000;
    const rowCount = 1600;

    for (let i = 0; i < userCount; i++) {
      console.log(`${round((i / userCount) * 100)}% Random #${i} of ${userCount}`);

      let linkedColumns = {};
      let columns = map(range(0, random(3, 10)), _ => "Column " + random(100, 999));
      chain(columns)
        .filter(_ => Math.random() < 0.3)
        .forEach(c => linkedColumns[c] = "some-table-" + random(100, 999))
        .value();

      await this.utils.saveJobAsync(
        "junk-user-" + (i + 1),
        "default",
        "junk-" + (i + 1), {
          linkedColumns: linkedColumns
        }, () => {
          const rows = this.generateRandomRows(rowCount, columns);
          const csvData = Baby.unparse(rows);
          return csvData;
        });
    }
  }

  generateRandomRows(rowCount: number, columns: string[]): Object[] {
    return chain(range(0, rowCount)).map(_ => {
      const row = {};
      forEach(columns, c => row[c] = uuid.v4());
      return row;
    }).value();
  }
}
