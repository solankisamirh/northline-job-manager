using Microsoft.EntityFrameworkCore;
using Northline.Api.Models;

namespace Northline.Api.Data;

public class NorthlineDbContext(DbContextOptions<NorthlineDbContext> options) : DbContext(options)
{
    public DbSet<QuoteRequest> QuoteRequests => Set<QuoteRequest>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<QuoteRequest>(e =>
        {
            e.ToTable("QuoteRequests");
            e.Property(q => q.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        });
    }
}