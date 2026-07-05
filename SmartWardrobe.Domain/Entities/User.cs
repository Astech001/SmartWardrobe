using System;
using System.Collections.Generic;
using SmartWardrobe.Domain.Enums;

namespace SmartWardrobe.Domain.Entities
{
    public class User : BaseEntity
    {
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string FullName { get; set; }

        // Abonelik bilgileri
        public SubscriptionPlan Plan { get; set; } = SubscriptionPlan.Free;
        public int MonthlyPhotoLimit { get; set; } = 20;
        public int UsedPhotoCount { get; set; } = 0;
        public DateTime? SubscriptionExpiryDate { get; set; }

        // Refresh Token alanları (JWT için)
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiry { get; set; }

        // Navigasyon property'leri (ilişkiler)
        public virtual ICollection<ClothingItem> ClothingItems { get; set; } = new List<ClothingItem>();
        public virtual ICollection<OutfitSuggestion> OutfitSuggestions { get; set; } = new List<OutfitSuggestion>();
    }
}