import fs from "fs"
import moment from 'moment'
import Baby from "babyparse"
import Promise from "bluebird"
import { chain, random, rangeRight, round } from "lodash"
import Utils from "../Utils.js"

export default class CompanyFundamentals {
  years: number;

  utils: Utils;

  constructor(utils: Utils) {
    this.utils = utils;
    this.years = 40;
  }

  async createJobFilesAsync(): Promise<void> {
    const companiesFile = "input/Companies-50000.csv";
    const companiesCsvData = await fs.readFileAsync(companiesFile, "utf8");
    const companies = Baby.parse(companiesCsvData, {header: true}).data;

    let index = 0;

    for (const company of companies) {
      if (company === undefined || company["Company"].length === 0) continue;

      console.log(`Company #${++index} of ${companies.length}`);

      const income = this.generateIncomeStatements();
      await this.utils.saveJobAsync(
        Baby.unparse(income),
        "income-statements", {
          relation: company["Company"],
          relationTable: "companies"
        });

      const balance = this.generateBalanceSheets();
      await this.utils.saveJobAsync(
        Baby.unparse(balance),
        "balance-sheets", {
          relation: company["Company"],
          relationTable: "companies"
        });

      const cashFlow = this.generateCashFlowStatements();
      await this.utils.saveJobAsync(
        Baby.unparse(cashFlow),
        "cash-flow-statements", {
          relation: company["Company"],
          relationTable: "companies"
        });
    }
  }

  generateIncomeStatements(): Object[] {
    const averageAnnualIncrease = 0.1;

    const grossMarginAverage =  random(0.2, 0.7);
    const netMarginAverage =  random(0.2, 0.7);
    const volatilityMin = 0.01;
    const volatilityMax = 0.3;
    const volatility = random(volatilityMin, volatilityMax);
    let oldRevenue = random(500, 1500);

    return chain(rangeRight(0, this.years * 4)).flatMap(quartersAgo => {
      const yearsAgo = Math.floor(quartersAgo / 4);
      const quarter = ((quartersAgo % 4) - 4) * -1;
      const date = moment().subtract(yearsAgo, 'years');

      const rnd = Math.random() - (0.5-(averageAnnualIncrease/2));
      const changeFactor = 2 * volatility * rnd;
      const changeAmount = oldRevenue * changeFactor;

      const newRevenue = oldRevenue + changeAmount;
      const costOfRevenue = newRevenue * (grossMarginAverage + random(-0.1, 0.1));
      const grossProfit = newRevenue - costOfRevenue;
      const opExGeneral =  grossProfit * (netMarginAverage + random(-0.1, 0.1));
      const opExOther =  opExGeneral * random(0.01, 0.1);
      const opIncome = grossProfit - (opExGeneral + opExOther);
      const interestExpense = opIncome * random(0.01, 0.05);
      const otherIncomeExpense = opIncome * random(0.2, 0.01);
      const incomeTaxProvisions = opIncome * random(0.25, 0.29);
      const other = opIncome * random(-0.03, 0.03);

      oldRevenue = newRevenue;

      return [{
        'Quarter': `${date.format("YYYY")}-Q${quarter}`,
        'Revenue': round(newRevenue),
        'Cost Of Revenue': round(costOfRevenue),
        'Operating Expenses General': round(opExGeneral),
        'Operating Expenses Other': round(opExOther),
        'Interest Expense': round(interestExpense),
        'Other Income Expense': round(otherIncomeExpense),
        'Income Tax Provisions': round(incomeTaxProvisions),
        'Other': round(other)
      }];
    }).value();
  }

  generateBalanceSheets(): Object[] {
    const averageAnnualIncrease = 0.1;

    const volatilityMin = 0.01;
    const volatilityMax = 0.3;
    const volatility = random(volatilityMin, volatilityMax);
    let oldRetainedEarnings = random(1000, 10000);
    let oldCommonStock = random(300, 1000);

    return chain(rangeRight(0, this.years * 4)).flatMap(quartersAgo => {
      const yearsAgo = Math.floor(quartersAgo / 4);
      const quarter = ((quartersAgo % 4) - 4) * -1;
      const date = moment().subtract(yearsAgo, 'years');

      const rnd = Math.random() - (0.5-(averageAnnualIncrease/2));
      const changeFactor = 2 * volatility * rnd;
      const changeAmount = oldRetainedEarnings * changeFactor;
      const retainedEarnings = oldRetainedEarnings + changeAmount;

      const commonStock = Math.random() < 0.975
        ? oldCommonStock
        : oldCommonStock * 2; // Simulate stock split.

      const additionalPaidInCapital = retainedEarnings * random(0.18, 0.22);
      const treasuryStock = retainedEarnings * random(0.58, 0.62) * -1;
      const otherAccumulatedIncome = retainedEarnings * random(0.03, 0.06) * -1;
      const assetsCashAndEquivalents = retainedEarnings * random(0.2, 0.24);
      const assetsShortTermInvestments = retainedEarnings * random(0.02, 0.024);
      const assetsReceivables = retainedEarnings * random(0.09, 0.11);
      const assetsInventories = retainedEarnings * random(0.09, 0.11);
      const assetsPrepaidExpenses = retainedEarnings * random(0.09, 0.11);
      const assetsCurrentOther = retainedEarnings * random(0.00, 0.11);
      const assetsPropertyPlantEquipment = retainedEarnings * random(0.42, 0.46);
      const assetsAccumulatedDepreciation = retainedEarnings * random(0.14, 0.18) * -1;
      const assetsEquityAndOtherInvestments = retainedEarnings * random(0.14, 0.18);
      const assetsGoodwill = retainedEarnings * random(0.15, 0.18);
      const assetsIntangible = retainedEarnings * random(0.15, 0.20);
      const assetsLongTermOther = retainedEarnings * random(0.09, 0.11);
      const liabilitiesShortTermDebt = retainedEarnings * random(0.25, 0.30);
      const liabilitiesAccountsPayable = retainedEarnings * random(0.03, 0.05);
      const liabilitiesTaxesPayable = retainedEarnings * random(0.003, 0.06);
      const liabilitiesAccrued = retainedEarnings * random(0.1, 0.15);
      const liabilitiesCurrentOther = retainedEarnings * random(0.0, 0.05);
      const liabilitiesLongTermDebt = retainedEarnings * random(0.25, 0.30);
      const liabilitiesDeferredTaxes = retainedEarnings * random(0.08, 0.12);
      const liabilitiesMinorityInterest = retainedEarnings * random(0.002, 0.005);
      const liabilitiesLongTermOther = retainedEarnings * random(0.08, 0.12);

      oldCommonStock = commonStock;
      oldRetainedEarnings = retainedEarnings;

      return [{
        'Quarter': `${date.format("YYYY")}-Q${quarter}`,
        'Equity / Common Stock': commonStock,
        'Equity / Additional Paid In Capital': round(additionalPaidInCapital),
        'Equity / Retained Earnings': round(retainedEarnings),
        'Equity / Treasury Stock': round(treasuryStock),
        'Equity / Other Accumulated Income': round(otherAccumulatedIncome),
        'Assets / Current / Cash And Equivalents': round(assetsCashAndEquivalents),
        'Assets / Current / Short Term Investments': round(assetsShortTermInvestments),
        'Assets / Current / Receivables': round(assetsReceivables),
        'Assets / Current / Inventories': round(assetsInventories),
        'Assets / Current / Prepaid Expenses': round(assetsPrepaidExpenses),
        'Assets / Current / Other': round(assetsCurrentOther),
        'Assets / Long-term / Property, Plant & Equipment': round(assetsPropertyPlantEquipment),
        'Assets / Long-term / Accumulated Depreciation': round(assetsAccumulatedDepreciation),
        'Assets / Long-term / Equity And Other Investments': round(assetsEquityAndOtherInvestments),
        'Assets / Long-term / Goodwill': round(assetsGoodwill),
        'Assets / Long-term / Intangible': round(assetsIntangible),
        'Assets / Long-term / Other': round(assetsLongTermOther),
        'Liabilities / Current / Short Term Debt': round(liabilitiesShortTermDebt),
        'Liabilities / Current / Accounts Payable': round(liabilitiesAccountsPayable),
        'Liabilities / Current / Taxes Payable': round(liabilitiesTaxesPayable),
        'Liabilities / Current / Accrued': round(liabilitiesAccrued),
        'Liabilities / Current / Other': round(liabilitiesCurrentOther),
        'Liabilities / Long-term / Long-term Debt': round(liabilitiesLongTermDebt),
        'Liabilities / Long-term / Deferred Taxes': round(liabilitiesDeferredTaxes),
        'Liabilities / Long-term / Minority Interest': round(liabilitiesMinorityInterest),
        'Liabilities / Long-term / Other': round(liabilitiesLongTermOther)
      }];
    }).value();
  }

  generateCashFlowStatements(): Object[] {
    const averageAnnualIncrease = 0.13;

    const volatilityMin = 0.01;
    const volatilityMax = 0.3;
    const volatility = random(volatilityMin, volatilityMax);
    let oldNetIncome = random(200, 500);
    let oldBalance = random(200, 500);

    return chain(rangeRight(0, this.years * 4)).flatMap(quartersAgo => {
      const yearsAgo = Math.floor(quartersAgo / 4);
      const quarter = ((quartersAgo % 4) - 4) * -1;
      const date = moment().subtract(yearsAgo, 'years');

      const rnd = Math.random() - (0.5-(averageAnnualIncrease/2));
      const changeFactor = 2 * volatility * rnd;
      const changeAmount = oldNetIncome * changeFactor;

      const opNetIncome = oldNetIncome + changeAmount;

      const relativeEntry = opNetIncome * random(0.8, 1.5);

      const opDepreciationAndAmortization =  relativeEntry * random(0.2, 0.25);
      const opDeferredIncomeTaxes = relativeEntry * random(0.1, 0.15);
      const opStockBasedCompensation = relativeEntry * random(0.02, 0.05);
      const opAccountsReceivable = relativeEntry * random(-0.06, 0.02);
      const opInventory = relativeEntry * random(-0.1, 0.05);
      const opPrepaidExpenses = relativeEntry * random(-0.1, 0.04);
      const opAccruedLiabilities = relativeEntry * random(-0.1, 0.03);
      const opOtherWorkingCapital = relativeEntry * random(-0.1, 0.06);
      const opOtherNonCashItems = relativeEntry * random(-0.1, 0.06);
      const opTotal = opNetIncome + opDepreciationAndAmortization + opDeferredIncomeTaxes +
        opStockBasedCompensation + opAccountsReceivable + opInventory + opPrepaidExpenses + opAccruedLiabilities +
        opOtherWorkingCapital + opOtherNonCashItems;

      const invPpeInvestments = relativeEntry * random(0.35, 0.5) * -1;
      const invPpeReductions = relativeEntry * random(0.01, 0.15) * -1;
      const invNetAcquisitions = relativeEntry * random(0.2, 0.4) * -1;
      const invPurchases = relativeEntry * random(0.5, 2) * -1;
      const invSalesAndMaturities = invPurchases * random(0.5, 0.8) * -1;
      const invOther = relativeEntry * random(-0.01, 0.01);
      const invTotal = invPpeInvestments + invPpeReductions + invNetAcquisitions +
        invPurchases + invSalesAndMaturities + invOther;

      const finDebtIssued = relativeEntry * random(3, 5.5);
      const finDebtRepayed = finDebtIssued * random(0.8, 1) * -1;
      const finCommonStockIssued = relativeEntry * random(0.18, 0.22);
      const finCommonStockRepurchased = relativeEntry * random(0.18, 0.22) * -1;
      const finDividendPaid = relativeEntry * random(0.18, 0.22) * -1;
      const finOther = relativeEntry * random(-0.01, 0.01);
      const finTotal = finDebtIssued + finDebtRepayed + finCommonStockIssued +
        finCommonStockRepurchased + finDividendPaid + finOther;

      const capitalExpenditure = opNetIncome * random(0.1, 0.3) * -1;
      const effectOfExchangeRate =  opNetIncome * random(-0.05, 0.05);

      const cashAtStart = oldBalance;
      const cashFlowChange = opTotal + invTotal + finTotal + effectOfExchangeRate;
      const cashAtEnd = cashAtStart + cashFlowChange;

      oldNetIncome = opNetIncome;
      oldBalance = cashAtEnd;

      return [{
        'Quarter': `${date.format("YYYY")}-Q${quarter}`,
        'Cash At Start': round(cashAtStart),
        'Cash At End': round(cashAtEnd),
        'Capital Expenditure': round(capitalExpenditure),
        'Effect Of Exchange Rate': round(effectOfExchangeRate),
        'Operating / Net Income': round(opNetIncome),
        'Operating / Depreciation And Amortization': round(opDepreciationAndAmortization),
        'Operating / Deferred Income Taxes': round(opDeferredIncomeTaxes),
        'Operating / Stock Based Compensation': round(opStockBasedCompensation),
        'Operating / Accounts Receivable': round(opAccountsReceivable),
        'Operating / Inventory': round(opInventory),
        'Operating / Prepaid Expenses': round(opPrepaidExpenses),
        'Operating / Accrued Liabilities': round(opAccruedLiabilities),
        'Operating / Other Working Capital': round(opOtherWorkingCapital),
        'Operating / Other Non Cash Items': round(opOtherNonCashItems),
        'Investing / PPE Investments': round(invPpeInvestments),
        'Investing / PPE Reductions': round(invPpeReductions),
        'Investing / Net Acquisitions': round(invNetAcquisitions),
        'Investing / Investment Purchases': round(invPurchases),
        'Investing / Investment Sales And Maturities': round(invSalesAndMaturities),
        'Investing / Other': round(invOther),
        'Financing / Debt Issued': round(finDebtIssued),
        'Financing / Debt Repayed': round(finDebtRepayed),
        'Financing / Common Stock Issued': round(finCommonStockIssued),
        'Financing / Common Stock Repurchased': round(finCommonStockRepurchased),
        'Financing / Dividend Paid': round(finDividendPaid),
        'Financing / Other': round(finOther),
      }];
    }).value();
  }
}
