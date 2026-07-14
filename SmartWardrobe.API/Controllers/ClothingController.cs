using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;
using SmartWardrobe.Application.DTOs.Clothing;
using SmartWardrobe.Application.Interfaces.Services;
using SmartWardrobe.Persistence.UnitOfWork;

namespace SmartWardrobe.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ClothingController : ControllerBase
    {
        private readonly IClothingService _clothingService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IDistributedCache _cache;

        public ClothingController(
            IClothingService clothingService,
            IUnitOfWork unitOfWork,
            IDistributedCache cache)
        {
            _clothingService = clothingService;
            _unitOfWork = unitOfWork;
            _cache = cache;
        }

        private async Task<Guid> GetCurrentUserIdAsync()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                throw new UnauthorizedAccessException("Kullanıcı bulunamadı");
            return userId;
        }

        private async Task<Domain.Entities.User> GetCurrentUserAsync()
        {
            var userId = await GetCurrentUserIdAsync();
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null)
                throw new UnauthorizedAccessException("Kullanıcı bulunamadı");
            return user;
        }

        /// <summary>
        /// Kullanıcıya ait cache'leri temizler
        /// </summary>
        private async Task ClearUserCacheAsync(Guid userId)
        {
            try
            {
                var cacheKey = $"products_{userId}";
                await _cache.RemoveAsync(cacheKey);
                Console.WriteLine($"✅ Cache cleared for user {userId}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Cache clear failed: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateClothingItemDto dto)
        {
            try
            {
                var user = await GetCurrentUserAsync();
                var result = await _clothingService.CreateClothingItemAsync(user, dto);

                // ✅ Yeni ürün eklendiğinde cache'i temizle
                await ClearUserCacheAsync(user.Id);

                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] ClothingFilterDto filter)
        {
            try
            {
                var userId = await GetCurrentUserIdAsync();
                var cacheKey = $"products_{userId}_{filter.PageNumber}_{filter.PageSize}";

                // ✅ Cache'den kontrol et
                var cachedData = await _cache.GetStringAsync(cacheKey);
                if (!string.IsNullOrEmpty(cachedData))
                {
                    Console.WriteLine($"✅ Cache hit for user {userId}");
                    var cachedResult = JsonSerializer.Deserialize<object>(cachedData);
                    return Ok(new { success = true, data = cachedResult });
                }

                Console.WriteLine($"⏳ Cache miss for user {userId}, fetching from database...");

                // Cache yoksa veritabanından al
                var result = await _clothingService.GetUserClothingItemsAsync(userId, filter);

                // ✅ Cache'e kaydet (5 dakika)
                var serialized = JsonSerializer.Serialize(result);
                await _cache.SetStringAsync(cacheKey, serialized, new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
                });

                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error in GetAll: {ex.Message}");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var userId = await GetCurrentUserIdAsync();
                var cacheKey = $"product_{userId}_{id}";

                // ✅ Cache'den kontrol et
                var cachedData = await _cache.GetStringAsync(cacheKey);
                if (!string.IsNullOrEmpty(cachedData))
                {
                    var cachedResult = JsonSerializer.Deserialize<object>(cachedData);
                    return Ok(new { success = true, data = cachedResult });
                }

                // Cache yoksa veritabanından al
                var result = await _clothingService.GetClothingItemByIdAsync(id, userId);

                // ✅ Cache'e kaydet (5 dakika)
                var serialized = JsonSerializer.Serialize(result);
                await _cache.SetStringAsync(cacheKey, serialized, new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
                });

                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateClothingItemDto dto)
        {
            try
            {
                var userId = await GetCurrentUserIdAsync();
                var result = await _clothingService.UpdateClothingItemAsync(id, userId, dto);

                // ✅ Ürün güncellendiğinde cache'i temizle
                await ClearUserCacheAsync(userId);

                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var userId = await GetCurrentUserIdAsync();
                var result = await _clothingService.DeleteClothingItemAsync(id, userId);

                // ✅ Ürün silindiğinde cache'i temizle
                await ClearUserCacheAsync(userId);

                return Ok(new { success = true, message = "Ürün başarıyla silindi" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPatch("{id}/favorite")]
        public async Task<IActionResult> ToggleFavorite(Guid id)
        {
            try
            {
                var userId = await GetCurrentUserIdAsync();
                var result = await _clothingService.MarkAsFavoriteAsync(id, userId);

                // ✅ Favori durumu değiştiğinde cache'i temizle
                await ClearUserCacheAsync(userId);

                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPatch("{id}/wear")]
        public async Task<IActionResult> IncrementWear(Guid id)
        {
            try
            {
                var userId = await GetCurrentUserIdAsync();
                var result = await _clothingService.IncrementWearCountAsync(id, userId);

                // ✅ Giyim sayısı güncellendiğinde cache'i temizle
                await ClearUserCacheAsync(userId);

                return Ok(new { success = true, message = "Giyim sayısı güncellendi" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}