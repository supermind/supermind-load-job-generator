import Application from "./Application.js"
import StocksAndCompanies from "./generators/StocksAndCompanies.js"
import Utils from "./Utils.js"

const outputFolder = "/Volumes/Data (Unencrypted)/data/_staged/";
// const outputFolder = path.resolve(__dirname, "../supermind-load-job-mocks/");
const utils = new Utils(outputFolder);
const application = new Application(utils, new StocksAndCompanies(utils));

application.runAsync();
