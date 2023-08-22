import openpyxl

def create_balance_sheet(ws, year, cash, accounts_receivable, inventory, total_current_assets, total_assets,
                         accounts_payable, long_term_debt, total_liabilities, shareholders_equity, retained_earnings):
    ws.append(['Balance Sheet', '', f'As of December 31, {year}'])
    ws.append(['', '', ''])
    ws.append(['', 'Assets', ''])
    ws.append(['', 'Cash', cash])
    ws.append(['', 'Accounts Receivable', accounts_receivable])
    ws.append(['', 'Inventory', inventory])
    ws.append(['', 'Total Current Assets', total_current_assets])
    ws.append(['', 'Total Assets', total_assets])
    ws.append(['', '', ''])
    ws.append(['', 'Liabilities', ''])
    ws.append(['', 'Accounts Payable', accounts_payable])
    ws.append(['', 'Long-term Debt', long_term_debt])
    ws.append(['', 'Total Liabilities', total_liabilities])
    ws.append(['', '', ''])
    ws.append(['', 'Shareholders\' Equity', ''])
    ws.append(['', 'Share Capital', shareholders_equity])
    ws.append(['', 'Retained Earnings', retained_earnings])
    ws.append(['', 'Total Shareholders\' Equity', shareholders_equity])
    ws.append(['', 'Total Liabilities and Equity', total_liabilities + shareholders_equity])

def create_income_statement(ws, year, revenue, cost_of_goods_sold, gross_profit, operating_expenses, net_income):
    ws.append(['Income Statement', '', f'For the year ending December 31, {year}'])
    ws.append(['', '', ''])
    ws.append(['', 'Revenue', revenue])
    ws.append(['', 'Cost of Goods Sold', cost_of_goods_sold])
    ws.append(['', 'Gross Profit', gross_profit])
    ws.append(['', '', ''])
    ws.append(['', 'Operating Expenses', ''])
    ws.append(['', 'Selling & Marketing', operating_expenses])
    ws.append(['', 'General Administrative', operating_expenses])
    ws.append(['', 'Interest on Loans', operating_expenses])
    ws.append(['', 'Total Operating Expenses', operating_expenses * 3])
    ws.append(['', '', ''])
    ws.append(['', 'Net Income', net_income])

if __name__ == "__main__":
    wb = openpyxl.Workbook()
    ws = wb.active

    # Assuming financial data for the year 2021 and 2022 (replace these values with actual data)
    create_balance_sheet(ws, 2021, 100000, 75000, 50000, 225000, 500000, 75000, 150000, 225000, 250000, 100000)
    create_income_statement(ws, 2021, 500000, 250000, 250000, 100000, 150000)

    create_balance_sheet(ws, 2022, 120000, 80000, 60000, 260000, 550000, 85000, 140000, 225000, 310000, 130000)
    create_income_statement(ws, 2022, 550000, 280000, 270000, 110000, 160000)

    wb.save("financial_statements.xlsx")
