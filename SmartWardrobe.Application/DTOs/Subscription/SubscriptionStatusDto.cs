using SmartWardrobe.Domain.Enums;

namespace SmartWardrobe.Application.DTOs.Subscription
{
    public class SubscriptionStatusDto
    {
        public SubscriptionPlan Plan { get; set; }
        public int MonthlyPhotoLimit { get; set; }
        public int UsedPhotoCount { get; set; }
        public int RemainingPhotoCount { get; set; }
        public DateTime? SubscriptionExpiryDate { get; set; }
        public bool IsExpired { get; set; }
        public bool CanUpload { get; set; }
    }
}