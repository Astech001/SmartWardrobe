using System;
using SmartWardrobe.Domain.Enums;

namespace SmartWardrobe.Application.DTOs.Clothing
{
    public class CreateClothingItemDto
    {
        // SADECE Name zorunlu olsun
        public string Name { get; set; }

        // Diğer tüm alanlar opsiyonel
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
        public decimal? PurchasePrice { get; set; }
        public DateTime? PurchaseDate { get; set; }
        public string? UserNotes { get; set; }
        public bool? IsFavorite { get; set; }
        public string? ImageUrl { get; set; }
        public string? PublicImageId { get; set; }
        public string? ThumbnailUrl { get; set; }
        public string? AiTags { get; set; }
    }
}