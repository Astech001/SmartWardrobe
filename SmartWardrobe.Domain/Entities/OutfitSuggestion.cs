using System;
using System.Collections.Generic;

namespace SmartWardrobe.Domain.Entities
{
    public class OutfitSuggestion : BaseEntity
    {
        public Guid UserId { get; set; }
        public User User { get; set; }

        public string SuggestionText { get; set; }
        public string Season { get; set; }
        public DateTime SuggestionDate { get; set; } = DateTime.UtcNow;

        // İlişkiler
        public ICollection<OutfitItem> OutfitItems { get; set; }
    }
}