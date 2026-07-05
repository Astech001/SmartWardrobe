namespace SmartWardrobe.Application.DTOs.Upload
{
    public class UploadImageResponseDto
    {
        public string ImageUrl { get; set; }
        public string ThumbnailUrl { get; set; }
        public string PublicId { get; set; }
        public string Format { get; set; }
        public long Bytes { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}