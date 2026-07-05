using SmartWardrobe.Application.DTOs.Clothing;

namespace SmartWardrobe.Application.DTOs.AI
{
    public class AIOutfitSuggestionResponseDto
    {
        public List<OutfitSuggestionDto> Suggestions { get; set; }
        public string WeatherAdvice { get; set; }
        public string StyleAdvice { get; set; }
    }

    public class OutfitSuggestionDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public List<ClothingItemDto> Items { get; set; }
        public double SuitabilityScore { get; set; } // 0-100 arası
        public string Reason { get; set; }
    }
}