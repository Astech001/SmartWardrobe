using SmartWardrobe.Domain.Enums;

namespace SmartWardrobe.Application.DTOs.Clothing
{
    public class ClothingFilterDto
    {
        // TÜM ALANLAR OPSİYONEL (nullable)
        public string? SearchTerm { get; set; }
        public ItemCategory? Category { get; set; }
        public ItemSubCategory? SubCategory { get; set; }
        public ItemSeason? Season { get; set; }
        public ItemStyle? Style { get; set; }
        public string? Color { get; set; }
        public string? Size { get; set; }
        public WeatherType? SuitableWeather { get; set; }
        public bool? IsFavorite { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public int? MinTemperature { get; set; }
        public int? MaxTemperature { get; set; }
        public string? SortBy { get; set; }
        public string? SortOrder { get; set; } = "ASC";
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}