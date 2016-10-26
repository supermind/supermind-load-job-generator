import path from "path"
import Application from "./Application.js"
import CityTemperatures from "./generators/CityTemperatures.js"
import CompaniesAndStocks from "./generators/CompaniesAndStocks.js"
import CompanyCities from "./generators/CompanyCities.js"
import CompanyFounders from "./generators/CompanyFounders.js"
import CompanyFundamentals from "./generators/CompanyFundamentals.js"
import HackPad from "./generators/HackPad.js"
import RandomTables from "./generators/RandomTables.js"
import Utils from "./Utils.js"

const outputFolder = "/Volumes/Data (Unencrypted)/data/_staged/";
//const outputFolder = path.resolve(__dirname, "../../supermind-load-job-mocks/");
const utils = new Utils(outputFolder);
const application = new Application(utils, new RandomTables(utils));

application.runAsync();
