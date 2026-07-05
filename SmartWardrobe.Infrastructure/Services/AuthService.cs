using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using BCrypt.Net;  // BCrypt.Net namespace'i
using SmartWardrobe.Application.DTOs.Auth;
using SmartWardrobe.Application.Interfaces.Services;
using SmartWardrobe.Domain.Entities;
using SmartWardrobe.Domain.Enums;
using SmartWardrobe.Persistence.UnitOfWork;

namespace SmartWardrobe.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ITokenService _tokenService;
        private readonly IConfiguration _configuration;

        public AuthService(IUnitOfWork unitOfWork, ITokenService tokenService, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _tokenService = tokenService;
            _configuration = configuration;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
        {
            // E-posta kontrolü
            var existingUser = await _unitOfWork.Users
                .SingleOrDefaultAsync(u => u.Email == registerDto.Email);

            if (existingUser != null)
                throw new Exception("Bu e-posta adresi zaten kayıtlı");

            // Şifreyi hash'le - BCrypt.Net.BCrypt kullan
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);

            // Kullanıcı oluştur
            var user = new User
            {
                FullName = registerDto.FullName,
                Email = registerDto.Email,
                PasswordHash = passwordHash,
                Plan = SubscriptionPlan.Free,
                MonthlyPhotoLimit = 20,
                UsedPhotoCount = 0,
                SubscriptionExpiryDate = DateTime.UtcNow.AddMonths(1)
            };

            await _unitOfWork.Users.AddAsync(user);
            await _unitOfWork.CompleteAsync();

            // Token oluştur
            return await GenerateAuthResponseAsync(user);
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
        {
            var user = await _unitOfWork.Users
                .SingleOrDefaultAsync(u => u.Email == loginDto.Email);

            if (user == null)
                throw new Exception("E-posta veya şifre hatalı");

            // Şifre kontrolü - BCrypt.Net.BCrypt.Verify kullan
            bool isValidPassword = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash);
            if (!isValidPassword)
                throw new Exception("E-posta veya şifre hatalı");

            return await GenerateAuthResponseAsync(user);
        }

        public async Task<bool> ValidateTokenAsync(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["JWT:Secret"]);

            try
            {
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _configuration["JWT:Issuer"],
                    ValidateAudience = true,
                    ValidAudience = _configuration["JWT:Audience"],
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
        {
            // Refresh token kontrolü
            var user = await _unitOfWork.Users
                .SingleOrDefaultAsync(u => u.RefreshToken == refreshToken);

            if (user == null || user.RefreshTokenExpiry < DateTime.UtcNow)
                throw new Exception("Geçersiz veya süresi dolmuş refresh token");

            return await GenerateAuthResponseAsync(user);
        }

        public async Task LogoutAsync(Guid userId)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user != null)
            {
                user.RefreshToken = null;
                user.RefreshTokenExpiry = null;
                _unitOfWork.Users.Update(user);
                await _unitOfWork.CompleteAsync();
            }
        }

        private async Task<AuthResponseDto> GenerateAuthResponseAsync(User user)
        {
            var accessToken = await _tokenService.GenerateAccessTokenAsync(user);
            var refreshToken = await _tokenService.GenerateRefreshTokenAsync(user);

            // Refresh token'ı veritabanına kaydet
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
            _unitOfWork.Users.Update(user);
            await _unitOfWork.CompleteAsync();

            return new AuthResponseDto
            {
                Token = accessToken,
                RefreshToken = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddMinutes(15),
                User = new UserInfoDto
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    Email = user.Email,
                    Plan = user.Plan,
                    MonthlyPhotoLimit = user.MonthlyPhotoLimit,
                    UsedPhotoCount = user.UsedPhotoCount,
                    RemainingPhotoCount = user.MonthlyPhotoLimit - user.UsedPhotoCount
                }
            };
        }
    }
}