using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartWardrobe.Application.DTOs.Auth;
using SmartWardrobe.Application.Interfaces.Services;
using SmartWardrobe.Domain.Enums;
using SmartWardrobe.Persistence.UnitOfWork;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SmartWardrobe.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IUnitOfWork _unitOfWork;

        public AuthController(IAuthService authService, IUnitOfWork unitOfWork)
        {
            _authService = authService;
            _unitOfWork = unitOfWork;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            try
            {
                var result = await _authService.RegisterAsync(registerDto);
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                var result = await _authService.LoginAsync(loginDto);
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshTokenDto refreshTokenDto)
        {
            try
            {
                var result = await _authService.RefreshTokenAsync(refreshTokenDto.RefreshToken);
                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out Guid userId))
                {
                    await _authService.LogoutAsync(userId);
                }
                return Ok(new { success = true, message = "Başarıyla çıkış yapıldı" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            if (!Guid.TryParse(userIdClaim.Value, out var userId))
                return BadRequest(new { message = "Invalid user ID" });

            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found" });

            var plan = user.Plan;
            var photoLimit = GetPhotoLimit(plan);
            var remainingPhotoCount = plan == SubscriptionPlan.Ultimate ? -1 : photoLimit - user.UsedPhotoCount;

            return Ok(new
            {
                user.FullName,
                user.Email,
                Plan = (int)plan,
                PlanName = plan.ToString(),
                user.UsedPhotoCount,
                PhotoLimit = photoLimit,
                RemainingPhotoCount = remainingPhotoCount,
                IsUnlimited = plan == SubscriptionPlan.Ultimate,
                user.CreatedAt,
                user.SubscriptionExpiryDate
            });
        }

        private int GetPhotoLimit(SubscriptionPlan plan)
        {
            return plan switch
            {
                SubscriptionPlan.Free => 20,
                SubscriptionPlan.Plus => 200,
                SubscriptionPlan.Pro => 500,
                SubscriptionPlan.Ultimate => -1,
                _ => 20
            };
        }
    }

    public class RefreshTokenDto
    {
        public string RefreshToken { get; set; }
    }
}