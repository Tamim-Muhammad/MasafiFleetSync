using System;
using System.Collections.Generic;

namespace MasafiFleetSync.API.Models
{
    public class FinancialDashboardDto
    {
        public decimal TotalGrossToday { get; set; }
        public decimal WeeklyAccumulatedRevenue { get; set; }
        public decimal TotalCommissionToday { get; set; }
        public decimal TotalNetToday { get; set; }
        public List<LedgerEntryDto> CashLedger { get; set; } = new List<LedgerEntryDto>();
        public List<MonthlyContributorDto> MonthlyTopContributors { get; set; } = new List<MonthlyContributorDto>();
        public int TotalMonthlyOrdersCount { get; set; }
    }

    public class LedgerEntryDto
    {
        public int Id { get; set; }
        public string TransactionId { get; set; } = string.Empty;
        public string Driver { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Volume { get; set; } = string.Empty;
        public decimal Gross { get; set; }
        public decimal Commission { get; set; }
        public decimal Net { get; set; }
        public string State { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string FormattedDate { get; set; } = string.Empty;
    }

    public class MonthlyContributorDto
    {
        public string DriverName { get; set; } = string.Empty;
        public int TotalOrders { get; set; }
        public decimal TotalGross { get; set; }
        public decimal TotalCommission { get; set; }
    }
}