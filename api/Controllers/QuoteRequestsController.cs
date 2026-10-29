using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Northline.Api.Data;
using Northline.Api.Models;

namespace Northline.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QuoteRequestsController(NorthlineDbContext db) : ControllerBase
{
    // GET /api/quoterequests?search=sample&status=New
    [HttpGet]
    public async Task<ActionResult<List<QuoteRequest>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] string? serviceType,
        [FromQuery] string? season)
    {
        var query = db.QuoteRequests.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(q => q.CustomerName.Contains(search)
                                  || q.Address.Contains(search)
                                  || (q.Email != null && q.Email.Contains(search)));

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(q => q.Status == status);

        if (!string.IsNullOrWhiteSpace(serviceType))
            query = query.Where(q => q.ServiceType == serviceType);

        if (!string.IsNullOrWhiteSpace(season))
            query = query.Where(q => q.Season == season);

        return await query.OrderByDescending(q => q.CreatedAt).ToListAsync();
    }

    // GET /api/quoterequests/3
    [HttpGet("{id:int}")]
    public async Task<ActionResult<QuoteRequest>> GetById(int id)
    {
        var request = await db.QuoteRequests.AsNoTracking().FirstOrDefaultAsync(q => q.Id == id);
        if (request is null) return NotFound();
        return request;
    }

    // POST /api/quoterequests
    [HttpPost]
    public async Task<ActionResult<QuoteRequest>> Create(CreateQuoteRequestDto dto)
    {
        var request = new QuoteRequest
        {
            CustomerName = dto.CustomerName.Trim(),
            Email = dto.Email,
            Phone = dto.Phone,
            Address = dto.Address.Trim(),
            ServiceType = dto.ServiceType,
            PropertyType = dto.PropertyType,
            Season = dto.Season,
            Notes = dto.Notes,
            Status = "New"
        };

        db.QuoteRequests.Add(request);
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = request.Id }, request);
    }

    // PATCH /api/quoterequests/3/status
    [HttpPatch("{id:int}/status")]
    public async Task<ActionResult<QuoteRequest>> UpdateStatus(int id, UpdateStatusDto dto)
    {
        var request = await db.QuoteRequests.FindAsync(id);
        if (request is null) return NotFound();

        request.Status = dto.Status;
        request.ScheduledDate = dto.ScheduledDate;
        request.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return request;
    }

    // GET /api/quoterequests/summary
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var total = await db.QuoteRequests.CountAsync();

        var byStatus = await db.QuoteRequests
            .GroupBy(q => q.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        var byService = await db.QuoteRequests
            .GroupBy(q => q.ServiceType)
            .Select(g => new { ServiceType = g.Key, Count = g.Count() })
            .ToListAsync();

        return Ok(new { total, byStatus, byService });
    }
}