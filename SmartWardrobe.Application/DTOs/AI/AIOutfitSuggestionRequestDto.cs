using SmartWardrobe.Domain.Enums;

namespace SmartWardrobe.Application.DTOs.AI
{
    public class AIOutfitSuggestionRequestDto
    {
        public ItemSeason Season { get; set; }
        public WeatherType? Weather { get; set; }
        public int? Temperature { get; set; }
        public string Occasion { get; set; } // "Casual", "Business", "Formal", "Sport"
        public List<Guid> ExcludeItems { get; set; } // Hariç tutulacak ürünler
        public int SuggestionCount { get; set; } = 5;
    }
}