using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SmartWardrobe.Application.DTOs.AI;
using SmartWardrobe.Application.DTOs.Clothing;
using SmartWardrobe.Application.Interfaces.Services;
using SmartWardrobe.Domain.Entities;
using SmartWardrobe.Domain.Enums;
using SmartWardrobe.Persistence.UnitOfWork;

namespace SmartWardrobe.Infrastructure.Services
{
    public class AIService : IAIService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IStorageService _storageService;
        private readonly Random _random = new Random();

        public AIService(IUnitOfWork unitOfWork, IStorageService storageService)
        {
            _unitOfWork = unitOfWork;
            _storageService = storageService;
        }

        // ============= GÖRSEL ANALİZ =============

        public async Task<AIAnalysisResponseDto> AnalyzeImageAsync(string imageUrl)
        {
            await Task.Delay(500);

            return new AIAnalysisResponseDto
            {
                Category = "Outerwear",
                SubCategory = "Jacket",
                Season = "Winter",
                Style = "Casual",
                Color = "Black",
                ColorHex = "#000000",
                Material = "Leather",
                Pattern = "Solid",
                Tags = new List<string> { "leather", "classic", "winter" },
                Confidence = 0.85,
                ColorPalette = new List<AIColorAnalysisDto>
                {
                    new AIColorAnalysisDto { ColorName = "Black", HexCode = "#000000", Percentage = 60 },
                    new AIColorAnalysisDto { ColorName = "Dark Gray", HexCode = "#404040", Percentage = 30 },
                    new AIColorAnalysisDto { ColorName = "Silver", HexCode = "#C0C0C0", Percentage = 10 }
                }
            };
        }

        public async Task<AIAnalysisResponseDto> AnalyzeClothingItemAsync(Guid clothingItemId)
        {
            var items = await _unitOfWork.ClothingItems
                .FindAsync(c => c.Id == clothingItemId);

            var item = items.FirstOrDefault();
            if (item == null)
                throw new Exception("Ürün bulunamadı");

            if (string.IsNullOrEmpty(item.ImageUrl))
                throw new Exception("Ürünün fotoğrafı yok");

            return await AnalyzeImageAsync(item.ImageUrl);
        }

        // ============= KOMBİN ÖNERİLERİ =============

        public async Task<AIOutfitSuggestionResponseDto> GetOutfitSuggestionsAsync(
     User user,
     AIOutfitSuggestionRequestDto request)
        {
            // Kullanıcının aktif ürünlerini al
            var clothingItems = await _unitOfWork.ClothingItems
                .FindAsync(c => c.UserId == user.Id && c.IsActive == true);

            var items = clothingItems.ToList();

            // Hariç tutulan ürünleri filtrele
            if (request.ExcludeItems != null && request.ExcludeItems.Any())
            {
                items = items.Where(c => !request.ExcludeItems.Contains(c.Id)).ToList();
            }

            // Sezon filtresi - request.Season nullable DEĞİL
            if (request.Season != ItemSeason.AllSeason)
            {
                items = items.Where(c =>
                    c.Season.HasValue &&
                    (c.Season.Value == request.Season || c.Season.Value == ItemSeason.AllSeason)).ToList();
            }

            // Hava durumu filtresi - request.Weather nullable
            if (request.Weather.HasValue)
            {
                items = items.Where(c =>
                    c.SuitableWeather.HasValue &&
                    c.SuitableWeather.Value == request.Weather.Value).ToList();
            }

            // Sıcaklık filtresi - request.Temperature nullable
            if (request.Temperature.HasValue)
            {
                items = items.Where(c =>
                    c.MinTemperature.HasValue &&
                    c.MaxTemperature.HasValue &&
                    c.MinTemperature.Value <= request.Temperature.Value &&
                    c.MaxTemperature.Value >= request.Temperature.Value).ToList();
            }

            // Kombin oluştur
            var suggestions = new List<OutfitSuggestionDto>();

            var categories = items
                .Where(c => c.Category.HasValue)
                .Select(c => c.Category.Value)
                .Distinct()
                .ToList();

            for (int i = 0; i < request.SuggestionCount && items.Count >= 3; i++)
            {
                var selectedItems = new List<ClothingItem>();
                var usedIds = new HashSet<Guid>();

                var shuffledCategories = categories.OrderBy(x => _random.Next()).ToList();

                foreach (var category in shuffledCategories.Take(Math.Min(3, categories.Count)))
                {
                    var available = items
                        .Where(c => c.Category.HasValue && c.Category.Value == category && !usedIds.Contains(c.Id))
                        .ToList();

                    if (available.Any())
                    {
                        var selected = available[_random.Next(available.Count)];
                        selectedItems.Add(selected);
                        usedIds.Add(selected.Id);
                    }
                }

                if (selectedItems.Count < 2)
                    continue;

                var suggestion = new OutfitSuggestionDto
                {
                    Id = Guid.NewGuid(),
                    Name = $"Kombin {i + 1}",
                    Description = GenerateSuggestionDescription(selectedItems),
                    Items = selectedItems.Select(c => MapToDto(c)).ToList(),
                    SuitabilityScore = _random.Next(70, 100),
                    Reason = GenerateReason(selectedItems)
                };

                suggestions.Add(suggestion);
            }

            suggestions = suggestions.OrderByDescending(s => s.SuitabilityScore).ToList();

            return new AIOutfitSuggestionResponseDto
            {
                Suggestions = suggestions,
                WeatherAdvice = GetWeatherAdvice(request),
                StyleAdvice = GetStyleAdvice(user)
            };
        }

        // ============= RENK ANALİZİ =============

        public async Task<List<AIColorAnalysisDto>> AnalyzeColorsAsync(string imageUrl)
        {
            await Task.Delay(300);

            return new List<AIColorAnalysisDto>
            {
                new AIColorAnalysisDto { ColorName = "Black", HexCode = "#000000", Percentage = 40 },
                new AIColorAnalysisDto { ColorName = "Navy", HexCode = "#000080", Percentage = 30 },
                new AIColorAnalysisDto { ColorName = "White", HexCode = "#FFFFFF", Percentage = 30 }
            };
        }

        public async Task<List<string>> GetColorPaletteAsync(string baseColor, int count = 5)
        {
            await Task.Delay(100);

            var palettes = new Dictionary<string, List<string>>
            {
                ["Black"] = new List<string> { "#000000", "#333333", "#666666", "#999999", "#CCCCCC" },
                ["White"] = new List<string> { "#FFFFFF", "#F5F5F5", "#EEEEEE", "#E0E0E0", "#D0D0D0" },
                ["Red"] = new List<string> { "#FF0000", "#CC0000", "#990000", "#FF3333", "#FF6666" },
                ["Blue"] = new List<string> { "#0000FF", "#0000CC", "#000099", "#3333FF", "#6666FF" },
                ["Green"] = new List<string> { "#00FF00", "#00CC00", "#009900", "#33FF33", "#66FF66" },
                ["Yellow"] = new List<string> { "#FFFF00", "#CCCC00", "#999900", "#FFFF33", "#FFFF66" }
            };

            if (palettes.ContainsKey(baseColor))
            {
                return palettes[baseColor].Take(count).ToList();
            }

            return new List<string> { "#000000", "#FFFFFF", "#808080", "#404040", "#C0C0C0" };
        }

        // ============= STİL ANALİZİ =============

        public async Task<string> AnalyzeStyleAsync(User user)
        {
            var items = await _unitOfWork.ClothingItems
                .FindAsync(c => c.UserId == user.Id && c.IsActive == true);

            var itemsList = items.ToList();

            if (!itemsList.Any())
                return "Henüz yeterli ürün yok. Gardropuna ürün ekledikçe stil analizi yapabiliriz.";

            var styleCount = itemsList
                .Where(c => c.Style.HasValue)
                .GroupBy(c => c.Style.Value)
                .Select(g => new { Style = g.Key, Count = g.Count() })
                .OrderByDescending(g => g.Count)
                .ToList();

            if (!styleCount.Any())
                return "Stil analizi için yeterli veri yok.";

            var dominantStyle = styleCount.First().Style;

            return $"{dominantStyle} stili hakim. Gardrobunda {styleCount.Count} farklı stil var.";
        }

        public async Task<List<string>> GetStyleRecommendationsAsync(User user)
        {
            var items = await _unitOfWork.ClothingItems
                .FindAsync(c => c.UserId == user.Id && c.IsActive == true);

            var itemsList = items.ToList();

            var recommendations = new List<string>();

            if (!itemsList.Any())
            {
                recommendations.Add("Gardropuna ürün eklemeye başla!");
                return recommendations;
            }

            // Eksik kategorileri bul - nullable kontrolü
            var categories = itemsList
                .Where(c => c.Category.HasValue)
                .Select(c => c.Category.Value)
                .Distinct()
                .ToList();

            var allCategories = Enum.GetValues(typeof(ItemCategory)).Cast<ItemCategory>().ToList();
            var missingCategories = allCategories.Except(categories).ToList();

            if (missingCategories.Any())
            {
                recommendations.Add($"Eksik kategoriler: {string.Join(", ", missingCategories.Select(c => c.ToString()))}");
            }

            // Az giyilen ürünleri bul
            var unwornItems = itemsList.Where(c => c.WearCount == 0).ToList();
            if (unwornItems.Any())
            {
                recommendations.Add($"{unwornItems.Count} ürün hiç giyilmemiş. Onları değerlendirmeyi unutma!");
            }

            return recommendations;
        }

        // ============= MEVSİM ÖNERİLERİ =============

        public async Task<List<ClothingItem>> GetSeasonalRecommendationsAsync(User user, ItemSeason season)
        {
            var items = await _unitOfWork.ClothingItems
                .FindAsync(c => c.UserId == user.Id &&
                               c.IsActive == true &&
                               (c.Season == season || c.Season == ItemSeason.AllSeason));

            return items.ToList();
        }

        // ============= HAVA DURUMU BAZLI ÖNERİ =============

        public async Task<List<ClothingItem>> GetWeatherBasedRecommendationsAsync(
            User user,
            int temperature,
            WeatherType weather)
        {
            var items = await _unitOfWork.ClothingItems
                .FindAsync(c => c.UserId == user.Id &&
                               c.IsActive == true &&
                               c.MinTemperature <= temperature &&
                               c.MaxTemperature >= temperature &&
                               (c.SuitableWeather == weather || c.SuitableWeather == WeatherType.Cloudy));

            return items.ToList();
        }

        // ============= YARDIMCI METODLAR =============

        private string GenerateSuggestionDescription(List<ClothingItem> items)
        {
            var names = string.Join(", ", items.Select(c => c.Name ?? "Ürün"));
            return $"Bu kombin {names} ürünlerinden oluşuyor.";
        }

        private string GenerateReason(List<ClothingItem> items)
        {
            var reasons = new List<string>();

            foreach (var item in items)
            {
                if (!string.IsNullOrEmpty(item.Color))
                {
                    reasons.Add($"{item.Name ?? "Ürün"} ({item.Color})");
                }
            }

            if (reasons.Any())
                return $"Renk uyumu: {string.Join(", ", reasons)}";

            return "Mevsim ve hava durumuna uygun.";
        }

        private string GetWeatherAdvice(AIOutfitSuggestionRequestDto request)
        {
            if (request.Temperature.HasValue && request.Weather.HasValue)
            {
                if (request.Temperature.Value < 5)
                    return "Hava çok soğuk, kalın giyinmeyi unutma!";
                else if (request.Temperature.Value < 15)
                    return "Serin hava için kat kat giyin.";
                else if (request.Temperature.Value < 25)
                    return "Ilık hava için rahat kıyafetler tercih et.";
                else
                    return "Sıcak hava için hafif kumaşlar tercih et.";
            }

            return "Hava durumuna göre giyinmeyi unutma!";
        }

        private string GetStyleAdvice(User user)
        {
            return "Stilini geliştirmek için farklı kombinleri dene!";
        }

        private ClothingItemDto MapToDto(ClothingItem item)
        {
            return new ClothingItemDto
            {
                Id = item.Id,
                Name = item.Name ?? string.Empty,
                Brand = item.Brand ?? string.Empty,
                Category = item.Category ?? ItemCategory.TShirt,
                CategoryName = (item.Category ?? ItemCategory.TShirt).ToString(),
                Season = item.Season ?? ItemSeason.Summer,
                SeasonName = (item.Season ?? ItemSeason.Summer).ToString(),
                Style = item.Style ?? ItemStyle.Casual,
                StyleName = (item.Style ?? ItemStyle.Casual).ToString(),
                Color = item.Color ?? string.Empty,
                ColorHex = item.ColorHex ?? "#000000",
                ImageUrl = item.ImageUrl ?? string.Empty,
                ThumbnailUrl = item.ThumbnailUrl ?? string.Empty
            };
        }
    }
}