namespace SmartWardrobe.Application.DTOs.Upload
{
    public class UploadImageDto
    {
        public string ImageBase64 { get; set; } // Base64 formatında resim
        public string FileName { get; set; } // Dosya adı (opsiyonel)
        public Guid? ClothingItemId { get; set; } // Ürün ID (opsiyonel)
        public bool IsThumbnail { get; set; } = false;
    }
}