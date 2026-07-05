namespace SmartWardrobe.Application.DTOs.AI
{
    public class AIAnalysisRequestDto
    {
        public string ImageUrl { get; set; }
        public Guid? ClothingItemId { get; set; }
    }
}