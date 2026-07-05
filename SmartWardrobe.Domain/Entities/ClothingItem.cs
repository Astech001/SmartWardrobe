using System;
using SmartWardrobe.Domain.Enums;

namespace SmartWardrobe.Domain.Entities
{
    public class ClothingItem
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public virtual User User { get; set; }

        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Brand { get; set; }
        public string? Model { get; set; }
        public ItemCategory? Category { get; set; }
        public ItemSubCategory? SubCategory { get; set; }
        public ItemSeason? Season { get; set; }
        public ItemStyle? Style { get; set; }
        public string? Color { get; set; }
        public string? ColorHex { get; set; }
        public string? SecondaryColor { get; set; }
        public string? Size { get; set; }
        public string? Material { get; set; }
        public WeatherType? SuitableWeather { get; set; }
        public int? MinTemperature { get; set; }
        public int? MaxTemperature { get; set; }
        public string? ImageUrl { get; set; }
        public string? PublicImageId { get; set; }
        public string? ThumbnailUrl { get; set; }
        public decimal? PurchasePrice { get; set; }
        public DateTime? PurchaseDate { get; set; }
        public string? UserNotes { get; set; }
        
        // Varsayılan değerler ile
        public bool IsFavorite { get; set; } = false;
        public bool IsActive { get; set; } = true;
        public int WearCount { get; set; } = 0;
        public DateTime? LastWornDate { get; set; }
        public string? AiTags { get; set; } = "{}";
        public int Rating { get; set; } = 0;
        public bool IsDeleted { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}