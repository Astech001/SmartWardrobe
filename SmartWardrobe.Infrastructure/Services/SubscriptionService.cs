using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SmartWardrobe.Application.DTOs.Subscription;
using SmartWardrobe.Application.Interfaces.Services;
using SmartWardrobe.Domain.Constants;
using SmartWardrobe.Domain.Entities;
using SmartWardrobe.Domain.Enums;
using SmartWardrobe.Persistence.UnitOfWork;

namespace SmartWardrobe.Infrastructure.Services
{
    public class SubscriptionService : ISubscriptionService
    {
        private readonly IUnitOfWork _unitOfWork;

        public SubscriptionService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<SubscriptionStatusDto> GetSubscriptionStatusAsync(User user)
        {
            var remaining = user.MonthlyPhotoLimit - user.UsedPhotoCount;
            var isExpired = user.SubscriptionExpiryDate.HasValue &&
                            user.SubscriptionExpiryDate.Value < DateTime.UtcNow;

            return new SubscriptionStatusDto
            {
                Plan = user.Plan,
                MonthlyPhotoLimit = user.MonthlyPhotoLimit,
                UsedPhotoCount = user.UsedPhotoCount,
                RemainingPhotoCount = remaining < 0 ? 0 : remaining,
                SubscriptionExpiryDate = user.SubscriptionExpiryDate,
                IsExpired = isExpired,
                CanUpload = !isExpired && remaining > 0
            };
        }

        public async Task<SubscriptionStatusDto> CheckAndUpdatePhotoUsageAsync(User user)
        {
            // Subscription süresi dolmuş mu kontrol et
            if (user.SubscriptionExpiryDate.HasValue &&
                user.SubscriptionExpiryDate.Value < DateTime.UtcNow)
            {
                // Ücretsiz plana düşür
                user.Plan = SubscriptionPlan.Free;
                user.MonthlyPhotoLimit = 20;
                user.SubscriptionExpiryDate = DateTime.UtcNow.AddMonths(1);
            }

            // Kullanılan fotoğraf sayısını kontrol et
            if (user.UsedPhotoCount >= user.MonthlyPhotoLimit)
            {
                return await GetSubscriptionStatusAsync(user);
            }

            // Fotoğraf kullanımını artır
            user.UsedPhotoCount++;
            _unitOfWork.Users.Update(user);
            await _unitOfWork.CompleteAsync();

            return await GetSubscriptionStatusAsync(user);
        }

        public async Task<bool> CanUploadPhotoAsync(User user)
        {
            var status = await GetSubscriptionStatusAsync(user);
            return status.CanUpload;
        }

        public async Task<SubscriptionStatusDto> UpgradeSubscriptionAsync(User user, UpgradeSubscriptionDto dto)
        {
            // Plan özelliklerini al
            var (photoLimit, price) = GetPlanDetails(dto.NewPlan);

            // Kullanıcının planını güncelle
            user.Plan = dto.NewPlan;
            user.MonthlyPhotoLimit = photoLimit;
            user.UsedPhotoCount = 0; // Yeni plan ile sıfırla

            // Abonelik süresini ayarla
            var months = dto.IsYearly ? 12 : 1;
            user.SubscriptionExpiryDate = DateTime.UtcNow.AddMonths(months);

            _unitOfWork.Users.Update(user);
            await _unitOfWork.CompleteAsync();

            return await GetSubscriptionStatusAsync(user);
        }

        public async Task<List<SubscriptionPlanDto>> GetAvailablePlansAsync()
        {
            return new List<SubscriptionPlanDto>
            {
                new SubscriptionPlanDto
                {
                    Plan = SubscriptionPlan.Free,
                    PlanName = "Ücretsiz",
                    PhotoLimit = SubscriptionPricing.Free.PhotoLimit,
                    PriceMonthly = SubscriptionPricing.Free.PriceMonthly,
                    PriceYearly = 0,
                    Description = "Başlangıç seviyesi",
                    Features = new List<string>
                    {
                        "Aylık 20 fotoğraf",
                        "Temel AI önerileri",
                        "Gardrop yönetimi"
                    }
                },
                new SubscriptionPlanDto
                {
                    Plan = SubscriptionPlan.Plus,
                    PlanName = "Plus",
                    PhotoLimit = SubscriptionPricing.Plus.PhotoLimit,
                    PriceMonthly = SubscriptionPricing.Plus.PriceMonthly,
                    PriceYearly = SubscriptionPricing.Plus.PriceMonthly * 10, // Yıllık %20 indirim
                    Description = "Orta seviye kullanıcılar",
                    Features = new List<string>
                    {
                        "Aylık 20 fotoğraf",
                        "Gelişmiş AI önerileri",
                        "Gardrop yönetimi",
                        "Renk analizi",
                        "Mevsim önerileri"
                    }
                },
                new SubscriptionPlanDto
                {
                    Plan = SubscriptionPlan.Pro,
                    PlanName = "Pro",
                    PhotoLimit = SubscriptionPricing.Pro.PhotoLimit,
                    PriceMonthly = SubscriptionPricing.Pro.PriceMonthly,
                    PriceYearly = SubscriptionPricing.Pro.PriceMonthly * 10,
                    Description = "Profesyonel kullanıcılar",
                    Features = new List<string>
                    {
                        "Aylık 100 fotoğraf",
                        "Gelişmiş AI önerileri",
                        "Gardrop yönetimi",
                        "Renk analizi",
                        "Mevsim önerileri",
                        "Kombin önerileri",
                        "Marka analizi"
                    }
                },
                new SubscriptionPlanDto
                {
                    Plan = SubscriptionPlan.Ultimate,
                    PlanName = "Ultimate",
                    PhotoLimit = SubscriptionPricing.Ultimate.PhotoLimit,
                    PriceMonthly = SubscriptionPricing.Ultimate.PriceMonthly,
                    PriceYearly = SubscriptionPricing.Ultimate.PriceMonthly * 10,
                    Description = "Sınırsız deneyim",
                    Features = new List<string>
                    {
                        "Aylık 500 fotoğraf",
                        "Gelişmiş AI önerileri",
                        "Gardrop yönetimi",
                        "Renk analizi",
                        "Mevsim önerileri",
                        "Kombin önerileri",
                        "Marka analizi",
                        "Trend analizi",
                        "Özel stil danışmanı"
                    }
                }
            };
        }

        public async Task ResetMonthlyPhotoCountAsync()
        {
            // Her ayın ilk günü tüm kullanıcıların fotoğraf sayısını sıfırla
            var users = await _unitOfWork.Users.GetAllAsync();
            foreach (var user in users)
            {
                user.UsedPhotoCount = 0;
                _unitOfWork.Users.Update(user);
            }
            await _unitOfWork.CompleteAsync();
        }

        private (int PhotoLimit, decimal Price) GetPlanDetails(SubscriptionPlan plan)
        {
            return plan switch
            {
                SubscriptionPlan.Free => (SubscriptionPricing.Free.PhotoLimit, SubscriptionPricing.Free.PriceMonthly),
                SubscriptionPlan.Plus => (SubscriptionPricing.Plus.PhotoLimit, SubscriptionPricing.Plus.PriceMonthly),
                SubscriptionPlan.Pro => (SubscriptionPricing.Pro.PhotoLimit, SubscriptionPricing.Pro.PriceMonthly),
                SubscriptionPlan.Ultimate => (SubscriptionPricing.Ultimate.PhotoLimit, SubscriptionPricing.Ultimate.PriceMonthly),
                _ => (20, 0)
            };
        }
    }
}