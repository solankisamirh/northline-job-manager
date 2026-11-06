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

        // Stored in UTC: mark it as UTC when reading, so the JSON ends in "Z"
        e.Property(q => q.CreatedAt)
            .HasDefaultValueSql("SYSUTCDATETIME()")
            .HasConversion(
                v => v,
                v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        e.Property(q => q.UpdatedAt)
            .HasConversion(
                v => v,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v);
    });
}
}