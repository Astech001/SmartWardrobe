using System;
using System.IO;
using System.Threading.Tasks;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Configuration;
using SmartWardrobe.Application.Interfaces.Services;

namespace SmartWardrobe.Infrastructure.Services
{
    public class CloudinaryService : IStorageService
    {
        private readonly Cloudinary _cloudinary;
        private readonly IConfiguration _configuration;

        public CloudinaryService(IConfiguration configuration)
        {
            _configuration = configuration;

            var cloudName = _configuration["Cloudinary:CloudName"];
            var apiKey = _configuration["Cloudinary:ApiKey"];
            var apiSecret = _configuration["Cloudinary:ApiSecret"];

            var account = new Account(cloudName, apiKey, apiSecret);
            _cloudinary = new Cloudinary(account);
            _cloudinary.Api.Secure = true;
        }

        public async Task<(string ImageUrl, string PublicId)> UploadImageAsync(string base64Image, string fileName = null)
        {
            try
            {
                // Base64'ten byte array oluştur
                var bytes = Convert.FromBase64String(base64Image);
                return await UploadImageAsync(bytes, fileName ?? Guid.NewGuid().ToString());
            }
            catch (Exception ex)
            {
                throw new Exception($"Fotoğraf yüklenirken hata oluştu: {ex.Message}");
            }
        }

        public async Task<(string ImageUrl, string PublicId)> UploadImageAsync(byte[] imageBytes, string fileName)
        {
            try
            {
                if (imageBytes == null || imageBytes.Length == 0)
                    throw new Exception("Dosya boş veya geçersiz");

                if (imageBytes.Length > 10 * 1024 * 1024)
                    throw new Exception("Dosya boyutu 10MB'dan büyük olamaz");

                using var stream = new MemoryStream(imageBytes);

                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(fileName, stream),
                    Folder = "smartwardrobe",
                    UseFilename = true,
                    UniqueFilename = true,
                    Overwrite = false,
                    Transformation = new Transformation()
                        .Width(1000)
                        .Height(1000)
                        .Crop("limit")
                        .Quality("auto")
                        .FetchFormat("auto")
                };

                var uploadResult = await _cloudinary.UploadAsync(uploadParams);

                if (uploadResult.Error != null)
                    throw new Exception($"Cloudinary upload error: {uploadResult.Error.Message}");

                return (uploadResult.SecureUrl.ToString(), uploadResult.PublicId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Fotoğraf yüklenirken hata oluştu: {ex.Message}");
            }
        }

        public async Task<bool> DeleteImageAsync(string publicId)
        {
            try
            {
                if (string.IsNullOrEmpty(publicId))
                    return false;

                var deletionParams = new DeletionParams(publicId)
                {
                    ResourceType = ResourceType.Image
                };

                var deletionResult = await _cloudinary.DestroyAsync(deletionParams);

                return deletionResult.Result == "ok";
            }
            catch (Exception ex)
            {
                throw new Exception($"Fotoğraf silinirken hata oluştu: {ex.Message}");
            }
        }

        public string GetOptimizedUrl(string publicId, int width = 500, int height = 500)
        {
            if (string.IsNullOrEmpty(publicId))
                return null;

            var transformation = new Transformation()
                .Width(width)
                .Height(height)
                .Crop("fill")
                .Quality("auto")
                .FetchFormat("auto");

            var url = _cloudinary.Api.UrlImgUp
                .Transform(transformation)
                .BuildUrl(publicId);

            return url;
        }

        public string GetThumbnailUrl(string publicId, int width = 200, int height = 200)
        {
            if (string.IsNullOrEmpty(publicId))
                return null;

            var transformation = new Transformation()
                .Width(width)
                .Height(height)
                .Crop("thumb")
                .Gravity("face")
                .Quality("auto")
                .FetchFormat("auto");

            var url = _cloudinary.Api.UrlImgUp
                .Transform(transformation)
                .BuildUrl(publicId);

            return url;
        }
    }
}