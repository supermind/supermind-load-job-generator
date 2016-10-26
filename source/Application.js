import Promise from "bluebird"
import Utils from "./Utils.js"
import type { Generator } from "./generators/Generator.js"

export default class Application {
  utils: Utils;
  generator: Generator;

  constructor(utils: Utils, generator: Generator) {
    this.utils = utils;
    this.generator = generator;
  }

  async runAsync(): Promise<void> {
    // await this.utils.prepareOutputFolderAsync();
    await this.generator.createJobFilesAsync();
    console.log("Finished processing.");
  }
}
