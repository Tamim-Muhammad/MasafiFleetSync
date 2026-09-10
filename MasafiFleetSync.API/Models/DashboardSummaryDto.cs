using System.Collections.Generic;

namespace MasafiFleetSync.API.Models
{
    public class DashboardSummaryDto
    {
        public decimal TotalRevenue { get; set; }
        public decimal UtilizationPercentage { get; set; }
        public int ActiveVehiclesCount { get; set; }
        public int TotalVehiclesCount { get; set; }
        public decimal GlobalComplianceRate { get; set; }
        public int CompliantVehiclesCount { get; set; }
        public int ActiveCrisesCount { get; set; }

        public ComplianceAlertsDto ComplianceAlerts { get; set; } = new ComplianceAlertsDto();
        public List<ChartDataDto> WeeklyPerformance { get; set; } = new List<ChartDataDto>();
    }

    public class ComplianceAlertsDto
    {
        public int CriticalCount { get; set; } // 0-7 days
        public int WarningCount { get; set; }  // 8-15 days
        public int UpcomingCount { get; set; } // 16-30 days
    }

    public class ChartDataDto
    {
        public string Day { get; set; } = string.Empty;
        public int WaterDeliveriesVolume { get; set; }
        public decimal LeasingRevenue { get; set; }
        public decimal TotalRevenue { get; set; }
    }
}