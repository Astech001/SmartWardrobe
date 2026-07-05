using System.Threading.Tasks;
using SmartWardrobe.Application.DTOs.Subscription;
using SmartWardrobe.Domain.Entities;

namespace SmartWardrobe.Application.Interfaces.Services
{
    public interface ISubscriptionService
    {
        Task<SubscriptionStatusDto> GetSubscriptionStatusAsync(User user);
        Task<SubscriptionStatusDto> CheckAndUpdatePhotoUsageAsync(User user);
        Task<bool> CanUploadPhotoAsync(User user);
        Task<SubscriptionStatusDto> UpgradeSubscriptionAsync(User user, UpgradeSubscriptionDto dto);
        Task<List<SubscriptionPlanDto>> GetAvailablePlansAsync();
        Task ResetMonthlyPhotoCountAsync();
    }
}