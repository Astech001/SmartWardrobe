using SmartWardrobe.Domain.Enums;

namespace SmartWardrobe.Application.DTOs.Subscription
{
    public class SubscriptionPlanDto
    {
        public SubscriptionPlan Plan { get; set; }
        public string PlanName { get; set; }
        public int PhotoLimit { get; set; }
        public decimal PriceMonthly { get; set; }
        public decimal PriceYearly { get; set; }
        public string Description { get; set; }
        public List<string> Features { get; set; }
    }
}