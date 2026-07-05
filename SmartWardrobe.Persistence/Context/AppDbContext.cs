using Microsoft.EntityFrameworkCore;
using SmartWardrobe.Domain.Entities;
using System.Linq.Expressions;

namespace SmartWardrobe.Persistence.Context
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<ClothingItem> ClothingItems { get; set; }
        public DbSet<OutfitSuggestion> OutfitSuggestions { get; set; }
        public DbSet<OutfitItem> OutfitItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User entity
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.Id);
                entity.HasIndex(u => u.Email).IsUnique();
                entity.Property(u => u.Email).IsRequired().HasMaxLength(100);
                entity.Property(u => u.PasswordHash).IsRequired();
                entity.Property(u => u.FullName).IsRequired().HasMaxLength(100);
                entity.Property(u => u.Plan).IsRequired();
                entity.Property(u => u.UsedPhotoCount).IsRequired();
                entity.Property(u => u.CreatedAt).IsRequired();

                // Global query filter - Soft delete
                entity.HasQueryFilter(u => !u.IsDeleted);
            });

            // ClothingItem entity
            modelBuilder.Entity<ClothingItem>(entity =>
            {
                entity.HasKey(c => c.Id);
                entity.Property(c => c.Name).HasMaxLength(200);
                entity.Property(c => c.Description).HasMaxLength(500);
                entity.Property(c => c.Brand).HasMaxLength(100);
                entity.Property(c => c.Model).HasMaxLength(100);
                entity.Property(c => c.Color).HasMaxLength(50);
                entity.Property(c => c.ColorHex).HasMaxLength(7);
                entity.Property(c => c.SecondaryColor).HasMaxLength(50);
                entity.Property(c => c.Size).HasMaxLength(20);
                entity.Property(c => c.Material).HasMaxLength(100);
                entity.Property(c => c.ImageUrl).HasMaxLength(500);
                entity.Property(c => c.PublicImageId).HasMaxLength(200);
                entity.Property(c => c.ThumbnailUrl).HasMaxLength(500);
                entity.Property(c => c.UserNotes).HasMaxLength(500);
                entity.Property(c => c.AiTags).HasColumnType("jsonb");

                // Relationships
                entity.HasOne(c => c.User)
                    .WithMany(u => u.ClothingItems)
                    .HasForeignKey(c => c.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Global query filter - Soft delete ve IsActive (tek filter)
                entity.HasQueryFilter(c => c.IsDeleted == false);
                // IsActive ayrıca kontrol edilecek
            });

            // OutfitSuggestion entity
            modelBuilder.Entity<OutfitSuggestion>(entity =>
            {
                entity.HasKey(o => o.Id);
                entity.Property(o => o.SuggestionText).HasMaxLength(500);
                entity.Property(o => o.Season).HasMaxLength(50);
                entity.Property(o => o.SuggestionDate).IsRequired();

                entity.HasOne(o => o.User)
                    .WithMany(u => u.OutfitSuggestions)
                    .HasForeignKey(o => o.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Global query filter - Soft delete
                entity.HasQueryFilter(o => !o.IsDeleted);
            });

            // OutfitItem entity (many-to-many relationship)
            modelBuilder.Entity<OutfitItem>(entity =>
            {
                entity.HasKey(oi => new { oi.OutfitSuggestionId, oi.ClothingItemId });

                entity.HasOne(oi => oi.OutfitSuggestion)
                    .WithMany(o => o.OutfitItems)
                    .HasForeignKey(oi => oi.OutfitSuggestionId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(oi => oi.ClothingItem)
                    .WithMany()  // ClothingItem'da OutfitItems navigation'ı yok
                    .HasForeignKey(oi => oi.ClothingItemId)
                    .OnDelete(DeleteBehavior.Cascade);

                // OutfitItem'da IsDeleted yok, bu yüzden filter kaldırıldı
                // entity.HasQueryFilter(oi => !oi.IsDeleted); // Bu satırı KALDIRIN
            });

            // IsActive için ayrı bir filtre uygulamak isterseniz, bunu sorgularda manuel yapın
        }
    }
}