using System;
using System.Threading.Tasks;

namespace SmartWardrobe.Application.Interfaces.Services
{
    public interface IStorageService
    {
        Task<(string ImageUrl, string PublicId)> UploadImageAsync(string base64Image, string fileName = null);
        Task<(string ImageUrl, string PublicId)> UploadImageAsync(byte[] imageBytes, string fileName);
        Task<bool> DeleteImageAsync(string publicId);
        string GetOptimizedUrl(string publicId, int width = 500, int height = 500);
        string GetThumbnailUrl(string publicId, int width = 200, int height = 200);
    }
}