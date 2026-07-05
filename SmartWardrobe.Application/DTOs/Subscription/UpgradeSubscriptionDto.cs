using SmartWardrobe.Domain.Enums;

namespace SmartWardrobe.Application.DTOs.Subscription
{
    public class UpgradeSubscriptionDto
    {
        public SubscriptionPlan NewPlan { get; set; }
        public bool IsYearly { get; set; } = false;
    }
}