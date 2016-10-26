import fs from "fs"
import path from 'path';
import rmdir from 'rimraf';

// Create async versions of callback-driven methods.
Promise.promisifyAll(fs);
const rmdirAsync = Promise.promisify(rmdir);

export default class Utils {
  outputFolder: string;

  constructor(outputFolder: string) {
    this.outputFolder = outputFolder;
  }

  async prepareOutputFolderAsync(): Promise<void> {
    await rmdirAsync(this.outputFolder);
    await fs.mkdirAsync(this.outputFolder, 0o777);
  }

  async saveJobAsync(owner: string, database: string, type: string, options: Object, getCsvData: () => string): Promise<void> {
    const opt = options || {};
    const hasRelation =  opt.relation !== undefined;
    const loadJobName = hasRelation ? `${type} (${opt.relation.replace(/\//g, ',')})` : type;
    const metadataFile = loadJobName + ".json";
    const csvDataFile = loadJobName + ".csv";

    if (await this.fileExistsAsync(metadataFile)) {
      return;
    }

    const csvData = getCsvData();

    await this.saveFileAsync(csvData, csvDataFile);

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

    await this.saveFileAsync(JSON.stringify(metadata), metadataFile);
  }

  saveFileAsync(content: string, relativeFilePath: string): Promise<void> {
    return fs.writeFileAsync(path.resolve(this.outputFolder, relativeFilePath), content, "utf8");
  }

  async fileExistsAsync(relativeFilePath: string): Promise<boolean> {
    let exists = true;
    try {
      await fs.statAsync(path.resolve(this.outputFolder, relativeFilePath));
    }
    catch(err) {
      exists = false;
    }

    return exists;
  }
}
