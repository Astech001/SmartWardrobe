using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartWardrobe.Application.DTOs.AI;
using SmartWardrobe.Application.Interfaces.Services;
using SmartWardrobe.Persistence.UnitOfWork;

namespace SmartWardrobe.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AIController : ControllerBase
    {
        private readonly IAIService _aiService;
        private readonly IUnitOfWork _unitOfWork;

        public AIController(IAIService aiService, IUnitOfWork unitOfWork)
        {
            _aiService = aiService;
            _unitOfWork = unitOfWork;
        }

        private async Task<Domain.Entities.User> GetCurrentUserAsync()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                throw new UnauthorizedAccessException("Kullanıcı bulunamadı");

            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null)
                throw new UnauthorizedAccessException("Kullanıcı bulunamadı");

            return user;
        }

        // ============= GÖRSEL ANALİZ =============

        [HttpPost("analyze-image")]
        public async Task<IActionResult> AnalyzeImage([FromBody] AIAnalysisRequestDto dto)
        {
            try
            {
                var result = await _aiService.AnalyzeImageAsync(dto.ImageUrl);
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("analyze-clothing/{clothingItemId}")]
        public async Task<IActionResult> AnalyzeClothingItem(Guid clothingItemId)
        {
            try
            {
                var result = await _aiService.AnalyzeClothingItemAsync(clothingItemId);
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        // ============= KOMBİN ÖNERİLERİ =============

        [HttpPost("outfit-suggestions")]
        public async Task<IActionResult> GetOutfitSuggestions([FromBody] AIOutfitSuggestionRequestDto dto)
        {
            try
            {
                var user = await GetCurrentUserAsync();
                var result = await _aiService.GetOutfitSuggestionsAsync(user, dto);
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        // ============= RENK ANALİZİ =============

        [HttpPost("analyze-colors")]
        public async Task<IActionResult> AnalyzeColors([FromBody] AIAnalysisRequestDto dto)
        {
            try
            {
                var result = await _aiService.AnalyzeColorsAsync(dto.ImageUrl);
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("color-palette/{baseColor}")]
        public async Task<IActionResult> GetColorPalette(string baseColor, [FromQuery] int count = 5)
        {
            try
            {
                var result = await _aiService.GetColorPaletteAsync(baseColor, count);
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        // ============= STİL ANALİZİ =============

        [HttpGet("analyze-style")]
        public async Task<IActionResult> AnalyzeStyle()
        {
            try
            {
                var user = await GetCurrentUserAsync();
                var result = await _aiService.AnalyzeStyleAsync(user);
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("style-recommendations")]
        public async Task<IActionResult> GetStyleRecommendations()
        {
            try
            {
                var user = await GetCurrentUserAsync();
                var result = await _aiService.GetStyleRecommendationsAsync(user);
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        // ============= MEVSİM ÖNERİLERİ =============

        [HttpGet("seasonal/{season}")]
        public async Task<IActionResult> GetSeasonalRecommendations(int season)
        {
            try
            {
                var user = await GetCurrentUserAsync();
                var items = await _aiService.GetSeasonalRecommendationsAsync(
                    user,
                    (Domain.Enums.ItemSeason)season);

                return Ok(new
                {
                    success = true,
                    data = items.Select(c => new
                    {
                        c.Id,
                        c.Name,
                        c.Category,
                        c.Color,
                        c.ImageUrl,
                        c.ThumbnailUrl
                    })
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        // ============= HAVA DURUMU BAZLI ÖNERİ =============

        [HttpGet("weather-based")]
        public async Task<IActionResult> GetWeatherBasedRecommendations(
            [FromQuery] int temperature,
            [FromQuery] int weather)
        {
            try
            {
                var user = await GetCurrentUserAsync();
                var items = await _aiService.GetWeatherBasedRecommendationsAsync(
                    user,
                    temperature,
                    (Domain.Enums.WeatherType)weather);

                return Ok(new
                {
                    success = true,
                    data = items.Select(c => new
                    {
                        c.Id,
                        c.Name,
                        c.Category,
                        c.Color,
                        c.ImageUrl,
                        c.ThumbnailUrl,
                        c.MinTemperature,
                        c.MaxTemperature,
                        c.SuitableWeather
                    })
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}