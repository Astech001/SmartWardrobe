using SmartWardrobe.Application.DTOs.AI;
using SmartWardrobe.Domain.Entities;
using SmartWardrobe.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SmartWardrobe.Application.Interfaces.Services
{
    public interface IAIService
    {
        // Görsel Analiz
        Task<AIAnalysisResponseDto> AnalyzeImageAsync(string imageUrl);
        Task<AIAnalysisResponseDto> AnalyzeClothingItemAsync(Guid clothingItemId);

        // Kombin Önerileri
        Task<AIOutfitSuggestionResponseDto> GetOutfitSuggestionsAsync(
            User user,
            AIOutfitSuggestionRequestDto request);

        // Renk Analizi
        Task<List<AIColorAnalysisDto>> AnalyzeColorsAsync(string imageUrl);
        Task<List<string>> GetColorPaletteAsync(string baseColor, int count = 5);

        // Stil Analizi
        Task<string> AnalyzeStyleAsync(User user);
        Task<List<string>> GetStyleRecommendationsAsync(User user);

        // Mevsim Önerileri
        Task<List<ClothingItem>> GetSeasonalRecommendationsAsync(User user, ItemSeason season);

        // Hava Durumu Bazlı Öneri
        Task<List<ClothingItem>> GetWeatherBasedRecommendationsAsync(
            User user,
            int temperature,
            WeatherType weather);
    }
}