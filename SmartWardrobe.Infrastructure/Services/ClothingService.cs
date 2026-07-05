using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SmartWardrobe.Application.DTOs.Clothing;
using SmartWardrobe.Application.Interfaces.Services;
using SmartWardrobe.Domain.Entities;
using SmartWardrobe.Domain.Enums;
using SmartWardrobe.Persistence.UnitOfWork;

namespace SmartWardrobe.Infrastructure.Services
{
    public class ClothingService : IClothingService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ISubscriptionService _subscriptionService;

        public ClothingService(IUnitOfWork unitOfWork, ISubscriptionService subscriptionService)
        {
            _unitOfWork = unitOfWork;
            _subscriptionService = subscriptionService;
        }

        public async Task<ClothingItemDto> CreateClothingItemAsync(User user, CreateClothingItemDto dto)
        {
            // Subscription kontrolü
            var canUpload = await _subscriptionService.CanUploadPhotoAsync(user);
            if (!canUpload)
                throw new Exception("Fotoğraf yükleme kotanız dolmuştur. Lütfen aboneliğinizi yükseltin.");

            var clothingItem = new ClothingItem
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Name = dto.Name ?? "Ürün",
                Description = dto.Description,
                Brand = dto.Brand,
                Model = dto.Model,
                Category = dto.Category,
                SubCategory = dto.SubCategory,
                Season = dto.Season,
                Style = dto.Style,
                Color = dto.Color,
                ColorHex = dto.ColorHex,
                SecondaryColor = dto.SecondaryColor,
                Size = dto.Size,
                Material = dto.Material,
                SuitableWeather = dto.SuitableWeather,
                MinTemperature = dto.MinTemperature,
                MaxTemperature = dto.MaxTemperature,
                PurchasePrice = dto.PurchasePrice,
                PurchaseDate = dto.PurchaseDate,
                UserNotes = dto.UserNotes,
                IsFavorite = dto.IsFavorite ?? false,
                IsActive = true,
                ImageUrl = dto.ImageUrl,
                PublicImageId = dto.PublicImageId,
                ThumbnailUrl = dto.ThumbnailUrl,
                AiTags = dto.AiTags ?? "{}",
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false,
                WearCount = 0,
                Rating = 0
            };

            await _unitOfWork.ClothingItems.AddAsync(clothingItem);
            await _unitOfWork.CompleteAsync();

            // Fotoğraf kullanımını artır
            user.UsedPhotoCount++;
            _unitOfWork.Users.Update(user);
            await _unitOfWork.CompleteAsync();

            return MapToDto(clothingItem, user.FullName);
        }

        public async Task<ClothingItemDto> GetClothingItemByIdAsync(Guid id, Guid userId)
        {
            var items = await _unitOfWork.ClothingItems
                .FindAsync(c => c.Id == id && c.UserId == userId);

            var clothingItem = items.FirstOrDefault();
            if (clothingItem == null)
                throw new Exception("Ürün bulunamadı veya size ait değil");

            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            return MapToDto(clothingItem, user?.FullName ?? "Unknown");
        }

        public async Task<ClothingListResponseDto> GetUserClothingItemsAsync(Guid userId, ClothingFilterDto filter)
        {
            // Tüm kullanıcı ürünlerini getir
            var allItems = await _unitOfWork.ClothingItems
                .FindAsync(c => c.UserId == userId);

            // Aktif olanları filtrele (IsActive == true ve IsDeleted == false)
            var query = allItems
                .Where(c => c.IsActive == true && c.IsDeleted == false)
                .AsQueryable();

            // Filtreleme
            if (!string.IsNullOrEmpty(filter.SearchTerm))
            {
                var search = filter.SearchTerm.ToLower();
                query = query.Where(c =>
                    (c.Name != null && c.Name.ToLower().Contains(search)) ||
                    (c.Brand != null && c.Brand.ToLower().Contains(search)) ||
                    (c.Description != null && c.Description.ToLower().Contains(search)));
            }

            if (filter.Category.HasValue)
                query = query.Where(c => c.Category == filter.Category.Value);

            if (filter.SubCategory.HasValue)
                query = query.Where(c => c.SubCategory == filter.SubCategory.Value);

            if (filter.Season.HasValue)
                query = query.Where(c => c.Season == filter.Season.Value);

            if (filter.Style.HasValue)
                query = query.Where(c => c.Style == filter.Style.Value);

            if (!string.IsNullOrEmpty(filter.Color))
                query = query.Where(c => c.Color == filter.Color);

            if (!string.IsNullOrEmpty(filter.Size))
                query = query.Where(c => c.Size == filter.Size);

            if (filter.SuitableWeather.HasValue)
                query = query.Where(c => c.SuitableWeather == filter.SuitableWeather.Value);

            if (filter.IsFavorite.HasValue)
                query = query.Where(c => c.IsFavorite == filter.IsFavorite.Value);

            if (filter.MinPrice.HasValue)
                query = query.Where(c => c.PurchasePrice >= filter.MinPrice.Value);

            if (filter.MaxPrice.HasValue)
                query = query.Where(c => c.PurchasePrice <= filter.MaxPrice.Value);

            if (filter.MinTemperature.HasValue)
                query = query.Where(c => c.MinTemperature >= filter.MinTemperature.Value);

            if (filter.MaxTemperature.HasValue)
                query = query.Where(c => c.MaxTemperature <= filter.MaxTemperature.Value);

            // Sorting
            query = filter.SortBy?.ToLower() switch
            {
                "name" => filter.SortOrder == "ASC" ? query.OrderBy(c => c.Name) : query.OrderByDescending(c => c.Name),
                "brand" => filter.SortOrder == "ASC" ? query.OrderBy(c => c.Brand) : query.OrderByDescending(c => c.Brand),
                "price" => filter.SortOrder == "ASC" ? query.OrderBy(c => c.PurchasePrice) : query.OrderByDescending(c => c.PurchasePrice),
                "wearcount" => filter.SortOrder == "ASC" ? query.OrderBy(c => c.WearCount) : query.OrderByDescending(c => c.WearCount),
                "rating" => filter.SortOrder == "ASC" ? query.OrderBy(c => c.Rating) : query.OrderByDescending(c => c.Rating),
                _ => filter.SortOrder == "ASC" ? query.OrderBy(c => c.CreatedAt) : query.OrderByDescending(c => c.CreatedAt)
            };

            var totalCount = query.Count();

            // Pagination
            var pageNumber = filter.PageNumber < 1 ? 1 : filter.PageNumber;
            var pageSize = filter.PageSize < 1 ? 10 : filter.PageSize;
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var pagedItems = query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            var dtos = pagedItems.Select(item => MapToDto(item, user?.FullName ?? "Unknown")).ToList();

            return new ClothingListResponseDto
            {
                Items = dtos,
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalPages = totalPages,
                HasPreviousPage = pageNumber > 1,
                HasNextPage = pageNumber < totalPages
            };
        }

        public async Task<ClothingItemDto> UpdateClothingItemAsync(Guid id, Guid userId, UpdateClothingItemDto dto)
        {
            var items = await _unitOfWork.ClothingItems
                .FindAsync(c => c.Id == id && c.UserId == userId);

            var clothingItem = items.FirstOrDefault();
            if (clothingItem == null)
                throw new Exception("Ürün bulunamadı veya size ait değil");

            // Güncelle - null kontrolü ile
            if (!string.IsNullOrEmpty(dto.Name))
                clothingItem.Name = dto.Name;

            if (!string.IsNullOrEmpty(dto.Description))
                clothingItem.Description = dto.Description;

            if (!string.IsNullOrEmpty(dto.Brand))
                clothingItem.Brand = dto.Brand;

            if (!string.IsNullOrEmpty(dto.Model))
                clothingItem.Model = dto.Model;

            if (dto.Category.HasValue)
                clothingItem.Category = dto.Category.Value;

            if (dto.SubCategory.HasValue)
                clothingItem.SubCategory = dto.SubCategory.Value;

            if (dto.Season.HasValue)
                clothingItem.Season = dto.Season.Value;

            if (dto.Style.HasValue)
                clothingItem.Style = dto.Style.Value;

            if (!string.IsNullOrEmpty(dto.Color))
                clothingItem.Color = dto.Color;

            if (!string.IsNullOrEmpty(dto.ColorHex))
                clothingItem.ColorHex = dto.ColorHex;

            if (!string.IsNullOrEmpty(dto.SecondaryColor))
                clothingItem.SecondaryColor = dto.SecondaryColor;

            if (!string.IsNullOrEmpty(dto.Size))
                clothingItem.Size = dto.Size;

            if (!string.IsNullOrEmpty(dto.Material))
                clothingItem.Material = dto.Material;

            if (dto.SuitableWeather.HasValue)
                clothingItem.SuitableWeather = dto.SuitableWeather.Value;

            if (dto.MinTemperature.HasValue)
                clothingItem.MinTemperature = dto.MinTemperature.Value;

            if (dto.MaxTemperature.HasValue)
                clothingItem.MaxTemperature = dto.MaxTemperature.Value;

            if (dto.PurchasePrice.HasValue)
                clothingItem.PurchasePrice = dto.PurchasePrice.Value;

            if (dto.PurchaseDate.HasValue)
                clothingItem.PurchaseDate = dto.PurchaseDate.Value;

            if (!string.IsNullOrEmpty(dto.UserNotes))
                clothingItem.UserNotes = dto.UserNotes;

            if (dto.IsFavorite.HasValue)
                clothingItem.IsFavorite = dto.IsFavorite.Value;

            if (dto.IsActive.HasValue)
                clothingItem.IsActive = dto.IsActive.Value;

            if (!string.IsNullOrEmpty(dto.ImageUrl))
                clothingItem.ImageUrl = dto.ImageUrl;

            if (!string.IsNullOrEmpty(dto.PublicImageId))
                clothingItem.PublicImageId = dto.PublicImageId;

            if (!string.IsNullOrEmpty(dto.ThumbnailUrl))
                clothingItem.ThumbnailUrl = dto.ThumbnailUrl;

            if (!string.IsNullOrEmpty(dto.AiTags))
                clothingItem.AiTags = dto.AiTags;

            clothingItem.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.ClothingItems.Update(clothingItem);
            await _unitOfWork.CompleteAsync();

            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            return MapToDto(clothingItem, user?.FullName ?? "Unknown");
        }

        public async Task<bool> DeleteClothingItemAsync(Guid id, Guid userId)
        {
            var items = await _unitOfWork.ClothingItems
                .FindAsync(c => c.Id == id && c.UserId == userId);

            var clothingItem = items.FirstOrDefault();
            if (clothingItem == null)
                throw new Exception("Ürün bulunamadı veya size ait değil");

            clothingItem.IsDeleted = true;
            clothingItem.IsActive = false;
            clothingItem.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.ClothingItems.Update(clothingItem);
            await _unitOfWork.CompleteAsync();

            return true;
        }

        public async Task<ClothingItemDto> MarkAsFavoriteAsync(Guid id, Guid userId)
        {
            var items = await _unitOfWork.ClothingItems
                .FindAsync(c => c.Id == id && c.UserId == userId);

            var clothingItem = items.FirstOrDefault();
            if (clothingItem == null)
                throw new Exception("Ürün bulunamadı veya size ait değil");

            clothingItem.IsFavorite = !clothingItem.IsFavorite;
            clothingItem.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.ClothingItems.Update(clothingItem);
            await _unitOfWork.CompleteAsync();

            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            return MapToDto(clothingItem, user?.FullName ?? "Unknown");
        }

        public async Task<bool> IncrementWearCountAsync(Guid id, Guid userId)
        {
            var items = await _unitOfWork.ClothingItems
                .FindAsync(c => c.Id == id && c.UserId == userId);

            var clothingItem = items.FirstOrDefault();
            if (clothingItem == null)
                throw new Exception("Ürün bulunamadı veya size ait değil");

            // WearCount zaten int, nullable değil, direkt artır
            clothingItem.WearCount = clothingItem.WearCount + 1;
            clothingItem.LastWornDate = DateTime.UtcNow;
            clothingItem.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.ClothingItems.Update(clothingItem);
            await _unitOfWork.CompleteAsync();

            return true;
        }

        private ClothingItemDto MapToDto(ClothingItem item, string userFullName)
        {
            return new ClothingItemDto
            {
                Id = item.Id,
                UserId = item.UserId,
                UserFullName = userFullName ?? "Unknown",
                Name = item.Name ?? string.Empty,
                Description = item.Description ?? string.Empty,
                Brand = item.Brand ?? string.Empty,
                Model = item.Model ?? string.Empty,
                Category = item.Category ?? ItemCategory.TShirt,
                CategoryName = (item.Category ?? ItemCategory.TShirt).ToString(),
                SubCategory = item.SubCategory ?? ItemSubCategory.TShirt,
                SubCategoryName = (item.SubCategory ?? ItemSubCategory.TShirt).ToString(),
                Season = item.Season ?? ItemSeason.Summer,
                SeasonName = (item.Season ?? ItemSeason.Summer).ToString(),
                Style = item.Style ?? ItemStyle.Casual,
                StyleName = (item.Style ?? ItemStyle.Casual).ToString(),
                Color = item.Color ?? string.Empty,
                ColorHex = item.ColorHex ?? "#000000",
                SecondaryColor = item.SecondaryColor ?? string.Empty,
                Size = item.Size ?? string.Empty,
                Material = item.Material ?? string.Empty,
                SuitableWeather = item.SuitableWeather ?? WeatherType.Sunny,
                WeatherName = (item.SuitableWeather ?? WeatherType.Sunny).ToString(),
                MinTemperature = item.MinTemperature ?? 0,
                MaxTemperature = item.MaxTemperature ?? 30,
                ImageUrl = item.ImageUrl ?? string.Empty,
                PublicImageId = item.PublicImageId ?? string.Empty,
                ThumbnailUrl = item.ThumbnailUrl ?? string.Empty,
                IsFavorite = item.IsFavorite,
                IsActive = item.IsActive,
                WearCount = item.WearCount,
                LastWornDate = item.LastWornDate,
                PurchasePrice = item.PurchasePrice,
                PurchaseDate = item.PurchaseDate,
                UserNotes = item.UserNotes ?? string.Empty,
                Rating = item.Rating,
                CreatedAt = item.CreatedAt,
                UpdatedAt = item.UpdatedAt
            };
        }
    }
}