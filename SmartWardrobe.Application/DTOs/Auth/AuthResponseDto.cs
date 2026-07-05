using SmartWardrobe.Domain.Enums;

namespace SmartWardrobe.Application.DTOs.Auth
{
    public class AuthResponseDto
    {
        public string Token { get; set; }
        public string RefreshToken { get; set; }
        public DateTime ExpiresAt { get; set; }
        public UserInfoDto User { get; set; }
    }

    public class UserInfoDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public SubscriptionPlan Plan { get; set; }
        public int MonthlyPhotoLimit { get; set; }
        public int UsedPhotoCount { get; set; }
        public int RemainingPhotoCount { get; set; }
    }
}