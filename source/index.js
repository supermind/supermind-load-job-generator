import path from "path"
import Application from "./Application.js"
import HackPad from "./generators/HackPad.js"
import CompaniesAndStocks from "./generators/CompaniesAndStocks.js"
import CompanyFundamentals from "./generators/CompanyFundamentals.js"
import Utils from "./Utils.js"

const outputFolder = "/Volumes/Data (Unencrypted)/data/_staged/";
//const outputFolder = path.resolve(__dirname, "../../supermind-load-job-mocks/");
const utils = new Utils(outputFolder);
const application = new Application(utils, new CompanyFundamentals(utils));

application.runAsync();
