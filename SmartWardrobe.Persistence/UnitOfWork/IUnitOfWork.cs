using System;
using System.Threading.Tasks;
using SmartWardrobe.Domain.Entities;
using SmartWardrobe.Persistence.Repositories;

namespace SmartWardrobe.Persistence.UnitOfWork
{
    public interface IUnitOfWork : IDisposable
    {
        IRepository<User> Users { get; }
        IRepository<ClothingItem> ClothingItems { get; }
        IRepository<OutfitSuggestion> OutfitSuggestions { get; }
        IRepository<OutfitItem> OutfitItems { get; }

        Task<int> CompleteAsync();
        Task BeginTransactionAsync();
        Task CommitTransactionAsync();
        Task RollbackTransactionAsync();
    }
}