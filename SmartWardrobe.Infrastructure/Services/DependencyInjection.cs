using Microsoft.Extensions.DependencyInjection;
using SmartWardrobe.Application.Interfaces.Services;
using SmartWardrobe.Infrastructure.Services;

namespace SmartWardrobe.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services)
        {
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<ISubscriptionService, SubscriptionService>();
            services.AddScoped<IClothingService, ClothingService>();
            services.AddScoped<IStorageService, CloudinaryService>();
            services.AddScoped<IAIService, AIService>(); // YENİ
            services.AddScoped<IRedisCacheService, RedisCacheService>();

            return services;
        }
    }
}