using System.Threading.Tasks;
using SmartWardrobe.Domain.Entities;

namespace SmartWardrobe.Application.Interfaces.Services
{
    public interface ITokenService
    {
        Task<string> GenerateAccessTokenAsync(User user);
        Task<string> GenerateRefreshTokenAsync(User user);
        Task<bool> ValidateRefreshTokenAsync(string refreshToken, User user);
        Task RevokeRefreshTokenAsync(User user);
    }
}