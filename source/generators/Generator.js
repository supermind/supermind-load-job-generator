import Promise from "bluebird"

interface Generator {
  createJobFilesAsync(): Promise<void>;
}

export type Generator = Generator;
