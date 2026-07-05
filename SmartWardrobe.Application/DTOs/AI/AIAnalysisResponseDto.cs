using SmartWardrobe.Domain.Enums;

namespace SmartWardrobe.Application.DTOs.AI
{
    public class AIAnalysisResponseDto
    {
        public string Category { get; set; }
        public string SubCategory { get; set; }
        public string Season { get; set; }
        public string Style { get; set; }
        public string Color { get; set; }
        public string ColorHex { get; set; }
        public string Material { get; set; }
        public string Pattern { get; set; }
        public List<string> Tags { get; set; }
        public double Confidence { get; set; }
        public List<AIColorAnalysisDto> ColorPalette { get; set; }
    }

    public class AIColorAnalysisDto
    {
        public string ColorName { get; set; }
        public string HexCode { get; set; }
        public double Percentage { get; set; }
    }
}