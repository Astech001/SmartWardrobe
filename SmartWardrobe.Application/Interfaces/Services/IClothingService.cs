using System;
using System.Threading.Tasks;
using SmartWardrobe.Application.DTOs.Clothing;
using SmartWardrobe.Domain.Entities;

namespace SmartWardrobe.Application.Interfaces.Services
{
    public interface IClothingService
    {
        Task<ClothingItemDto> CreateClothingItemAsync(User user, CreateClothingItemDto dto);
        Task<ClothingItemDto> GetClothingItemByIdAsync(Guid id, Guid userId);
        Task<ClothingListResponseDto> GetUserClothingItemsAsync(Guid userId, ClothingFilterDto filter);
        Task<ClothingItemDto> UpdateClothingItemAsync(Guid id, Guid userId, UpdateClothingItemDto dto);
        Task<bool> DeleteClothingItemAsync(Guid id, Guid userId);
        Task<ClothingItemDto> MarkAsFavoriteAsync(Guid id, Guid userId);
        Task<bool> IncrementWearCountAsync(Guid id, Guid userId);
    }
}