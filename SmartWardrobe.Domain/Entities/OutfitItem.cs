using System;

namespace SmartWardrobe.Domain.Entities
{
    public class OutfitItem
    {
        public Guid OutfitSuggestionId { get; set; }
        public OutfitSuggestion OutfitSuggestion { get; set; }

        public Guid ClothingItemId { get; set; }
        public ClothingItem ClothingItem { get; set; }
    }
}