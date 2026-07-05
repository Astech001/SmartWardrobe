using Microsoft.EntityFrameworkCore.Storage;
using SmartWardrobe.Domain.Entities;
using SmartWardrobe.Persistence.Context;
using SmartWardrobe.Persistence.Repositories;
using System;
using System.Threading.Tasks;

namespace SmartWardrobe.Persistence.UnitOfWork
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;
        private IDbContextTransaction _transaction;
        private bool _disposed;

        private IRepository<User> _users;
        private IRepository<ClothingItem> _clothingItems;
        private IRepository<OutfitSuggestion> _outfitSuggestions;
        private IRepository<OutfitItem> _outfitItems;

        public UnitOfWork(AppDbContext context)
        {
            _context = context;
        }

        public IRepository<User> Users =>
            _users ??= new Repository<User>(_context);

        public IRepository<ClothingItem> ClothingItems =>
            _clothingItems ??= new Repository<ClothingItem>(_context);

        public IRepository<OutfitSuggestion> OutfitSuggestions =>
            _outfitSuggestions ??= new Repository<OutfitSuggestion>(_context);

        public IRepository<OutfitItem> OutfitItems =>
            _outfitItems ??= new Repository<OutfitItem>(_context);

        public async Task<int> CompleteAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public async Task BeginTransactionAsync()
        {
            _transaction = await _context.Database.BeginTransactionAsync();
        }

        public async Task CommitTransactionAsync()
        {
            await _transaction?.CommitAsync();
        }

        public async Task RollbackTransactionAsync()
        {
            await _transaction?.RollbackAsync();
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed)
            {
                if (disposing)
                {
                    _transaction?.Dispose();
                    _context.Dispose();
                }
                _disposed = true;
            }
        }
    }
}