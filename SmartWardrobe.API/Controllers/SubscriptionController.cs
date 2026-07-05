using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartWardrobe.Application.DTOs.Subscription;
using SmartWardrobe.Application.Interfaces.Services;
using SmartWardrobe.Persistence.UnitOfWork;

namespace SmartWardrobe.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SubscriptionController : ControllerBase
    {
        private readonly ISubscriptionService _subscriptionService;
        private readonly IUnitOfWork _unitOfWork;

        public SubscriptionController(ISubscriptionService subscriptionService, IUnitOfWork unitOfWork)
        {
            _subscriptionService = subscriptionService;
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

        [HttpGet("status")]
        public async Task<IActionResult> GetStatus()
        {
            try
            {
                var user = await GetCurrentUserAsync();
                var status = await _subscriptionService.GetSubscriptionStatusAsync(user);
                return Ok(new { success = true, data = status });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("plans")]
        public async Task<IActionResult> GetPlans()
        {
            try
            {
                var plans = await _subscriptionService.GetAvailablePlansAsync();
                return Ok(new { success = true, data = plans });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("upgrade")]
        public async Task<IActionResult> Upgrade([FromBody] UpgradeSubscriptionDto dto)
        {
            try
            {
                var user = await GetCurrentUserAsync();
                var result = await _subscriptionService.UpgradeSubscriptionAsync(user, dto);
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("can-upload")]
        public async Task<IActionResult> CanUpload()
        {
            try
            {
                var user = await GetCurrentUserAsync();
                var canUpload = await _subscriptionService.CanUploadPhotoAsync(user);
                return Ok(new { success = true, data = new { canUpload } });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}