using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartWardrobe.Application.DTOs.Upload;
using SmartWardrobe.Application.Interfaces.Services;
using SmartWardrobe.Persistence.UnitOfWork;

namespace SmartWardrobe.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UploadController : ControllerBase
    {
        private readonly IStorageService _storageService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ISubscriptionService _subscriptionService;

        public UploadController(
            IStorageService storageService,
            IUnitOfWork unitOfWork,
            ISubscriptionService subscriptionService)
        {
            _storageService = storageService;
            _unitOfWork = unitOfWork;
            _subscriptionService = subscriptionService;
        }

        private async Task<Guid> GetCurrentUserIdAsync()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
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

        [HttpPost("image")]
        public async Task<IActionResult> UploadImage([FromBody] UploadImageDto dto)
        {
            try
            {
                var user = await GetCurrentUserAsync();

                // Subscription kontrolü
                var canUpload = await _subscriptionService.CanUploadPhotoAsync(user);
                if (!canUpload)
                    return BadRequest(new
                    {
                        success = false,
                        message = "Fotoğraf yükleme kotanız dolmuştur. Lütfen aboneliğinizi yükseltin."
                    });

                if (string.IsNullOrEmpty(dto.ImageBase64))
                    return BadRequest(new { success = false, message = "Fotoğraf verisi boş olamaz" });

                // Fotoğrafı Cloudinary'e yükle
                var (imageUrl, publicId) = await _storageService.UploadImageAsync(
                    dto.ImageBase64,
                    dto.FileName ?? $"{Guid.NewGuid()}.jpg");

                // Thumbnail URL oluştur
                var thumbnailUrl = _storageService.GetThumbnailUrl(publicId);

                // Kullanım sayısını artır
                user.UsedPhotoCount++;
                _unitOfWork.Users.Update(user);
                await _unitOfWork.CompleteAsync();

                var response = new UploadImageResponseDto
                {
                    ImageUrl = imageUrl,
                    ThumbnailUrl = thumbnailUrl,
                    PublicId = publicId,
                    CreatedAt = DateTime.UtcNow
                };

                return Ok(new { success = true, data = response });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("{publicId}")]
        public async Task<IActionResult> DeleteImage(string publicId)
        {
            try
            {
                var result = await _storageService.DeleteImageAsync(publicId);
                return Ok(new { success = result, message = "Fotoğraf başarıyla silindi" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("optimize/{publicId}")]
        public IActionResult GetOptimizedUrl(string publicId, [FromQuery] int width = 500, [FromQuery] int height = 500)
        {
            try
            {
                var url = _storageService.GetOptimizedUrl(publicId, width, height);
                return Ok(new { success = true, data = new { url } });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("thumbnail/{publicId}")]
        public IActionResult GetThumbnailUrl(string publicId, [FromQuery] int width = 200, [FromQuery] int height = 200)
        {
            try
            {
                var url = _storageService.GetThumbnailUrl(publicId, width, height);
                return Ok(new { success = true, data = new { url } });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}