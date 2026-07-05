using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

        public ClothingController(IClothingService clothingService, IUnitOfWork unitOfWork)
        {
            _clothingService = clothingService;
            _unitOfWork = unitOfWork;
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

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateClothingItemDto dto)
        {
            try
            {
                var user = await GetCurrentUserAsync();
                var result = await _clothingService.CreateClothingItemAsync(user, dto);
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
                var result = await _clothingService.GetUserClothingItemsAsync(userId, filter);
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var userId = await GetCurrentUserIdAsync();
                var result = await _clothingService.GetClothingItemByIdAsync(id, userId);
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
                return Ok(new { success = true, message = "Giyim sayısı güncellendi" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}